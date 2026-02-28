// Cloudflare Worker: AA Daily Reflections Proxy
// Scrapes today's Daily Reflection from aa.org and returns structured JSON
//
// SETUP:
// 1. Create a new Cloudflare Worker (e.g., "daily-reflections-proxy")
// 2. Paste this code
// 3. Deploy — no secrets/env vars needed
// 4. Update DR_WORKER_URL in js/app.js with the worker URL

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    // Only allow GET
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    // Check cache first (cache for 4 hours — content changes daily)
    const cacheKey = new Request('https://aa-daily-reflection/today', request);
    const cache = caches.default;
    let cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch('https://www.aa.org/daily-reflections', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DailyReflectionsProxy/1.0)',
          'Accept': 'text/html',
        },
      });

      if (!response.ok) {
        throw new Error(`AA.org returned ${response.status}`);
      }

      const html = await response.text();
      const result = parseReflection(html);

      const res = jsonResponse(result, 200, {
        'Cache-Control': 'public, max-age=14400', // 4 hours
      });

      // Store in Cloudflare cache
      ctx.waitUntil(cache.put(cacheKey, res.clone()));

      return res;
    } catch (error) {
      console.error('Error fetching Daily Reflection:', error);
      return jsonResponse({
        success: false,
        error: error.message,
      }, 500);
    }
  },
};

function parseReflection(html) {
  // The AA Daily Reflections page has this structure:
  // <h2>"TITLE"</h2>
  // <p>Month Day</p>
  // <p><strong>Quote text...</strong></p>
  // <p><strong>SOURCE, p. XX</strong></p>
  // <p>Reflection body text...</p>

  // Extract title — look for the h2 after "Daily Reflections" h1
  // Title is typically in quotes like "I AM A MIRACLE"
  let title = '';
  const titleMatch = html.match(/<h2[^>]*>\s*(?:&ldquo;|"|"|&#8220;)([^<""\u201D]+)(?:&rdquo;|"|"|&#8221;)\s*<\/h2>/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  } else {
    // Fallback: grab the second h2 on the page
    const h2s = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);
    if (h2s && h2s.length >= 2) {
      title = h2s[1].replace(/<[^>]+>/g, '').replace(/[""]/g, '').trim();
    }
  }

  // Extract the bold quote text (the AA literature quote)
  let quote = '';
  let quoteSource = '';

  // Find all <strong> blocks — usually 2: the quote and the source
  const strongBlocks = [];
  const strongRegex = /<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>/gi;
  let match;
  while ((match = strongRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 10) {
      strongBlocks.push(text);
    }
  }

  if (strongBlocks.length >= 2) {
    // First long strong block is the quote, second is the source
    quote = strongBlocks[0];
    quoteSource = strongBlocks[1];
  } else if (strongBlocks.length === 1) {
    quote = strongBlocks[0];
  }

  // Extract the reflection body — the paragraph(s) after the bold sections
  // that aren't the copyright notice
  let content = '';

  // Get all paragraphs
  const paragraphs = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  while ((match = pRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 0) {
      paragraphs.push(text);
    }
  }

  // The reflection body is typically the paragraph(s) that:
  // - Come after the bold quote/source
  // - Don't contain "Copyright" or "Daily Reflections."
  // - Are longer than a short date string
  const bodyParagraphs = paragraphs.filter(p => {
    if (p.length < 30) return false;
    if (p.includes('Copyright')) return false;
    if (p.includes('All rights reserved')) return false;
    if (p.includes('General Service Office')) return false;
    if (p.includes('registered trademark')) return false;
    if (p.includes('World Services, Inc')) return false;
    if (p === 'Daily Reflections.') return false;
    // Skip the quote and source (already captured)
    if (quote && p === quote) return false;
    if (quoteSource && p === quoteSource) return false;
    return true;
  });

  content = bodyParagraphs.join('\n\n');

  // Clean up HTML entities
  title = decodeEntities(title);
  quote = decodeEntities(quote);
  quoteSource = decodeEntities(quoteSource);
  content = decodeEntities(content);

  return {
    success: !!(title || content),
    title: title || 'Daily Reflection',
    quote: quote || null,
    quoteSource: quoteSource || null,
    content: content || '',
    thought: null, // AA reflections don't have a separate "thought" section
  };
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#\d+;/g, (m) => {
      const code = parseInt(m.replace(/&#|;/g, ''));
      return String.fromCharCode(code);
    });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...extraHeaders,
    },
  });
}
