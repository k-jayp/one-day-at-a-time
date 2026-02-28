// Cloudflare Worker: Hazelden "Thought for the Day" Proxy
// Fetches today's meditation from Hazelden Betty Ford's widget endpoint
//
// SETUP:
// 1. Create a new Cloudflare Worker (e.g., "thought-for-the-day-proxy")
// 2. Paste this code
// 3. Deploy — no secrets/env vars needed
// 4. Update TFTD_WORKER_URL in js/app.js with the worker URL

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
    const cacheKey = new Request('https://hazelden-tftd/today', request);
    const cache = caches.default;
    let cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
      // Hazelden's embeddable widget serves today's thought as a simple HTML page
      const widgetUrl = 'https://hazelden.org/web/public/thoughtwidget.view?unescape=Y&widgetid=TFD2198&target=_blank&border=none&style=standard';

      const response = await fetch(widgetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ThoughtForTheDayProxy/1.0)',
          'Accept': 'text/html',
        },
      });

      if (!response.ok) {
        // If widget fails, try the main page as fallback
        const fallbackResult = await fetchFromMainPage();
        if (fallbackResult.success) {
          const res = jsonResponse(fallbackResult, 200, {
            'Cache-Control': 'public, max-age=14400',
          });
          ctx.waitUntil(cache.put(cacheKey, res.clone()));
          return res;
        }
        throw new Error(`Hazelden returned ${response.status}`);
      }

      const html = await response.text();
      const result = parseWidgetContent(html);

      const res = jsonResponse(result, 200, {
        'Cache-Control': 'public, max-age=14400', // 4 hours
      });

      ctx.waitUntil(cache.put(cacheKey, res.clone()));

      return res;
    } catch (error) {
      console.error('Error fetching Thought for the Day:', error);
      return jsonResponse({
        success: false,
        error: error.message,
      }, 500);
    }
  },
};

function parseWidgetContent(html) {
  // The widget page is a lightweight HTML page with the daily thought.
  // Structure varies but typically includes:
  // - An image
  // - Author attribution
  // - The thought/meditation text
  // - A "Read More" link

  let title = 'Thought for the Day';
  let quote = '';
  let quoteSource = '';
  let content = '';

  // Try to extract author — often in a standalone text node or small element
  const authorMatch = html.match(/(?:by\s+|—\s*|–\s*)([A-Z][a-zA-Z\s.'-]+?)(?:<|,|\n)/);
  if (authorMatch) {
    quoteSource = authorMatch[1].trim();
  }

  // Extract text content — strip all HTML tags and get the readable text
  // First remove script and style blocks
  let textHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '');

  // Extract text from paragraphs and divs
  const textBlocks = [];
  const blockRegex = /<(?:p|div|blockquote|span)[^>]*>([\s\S]*?)<\/(?:p|div|blockquote|span)>/gi;
  let match;
  while ((match = blockRegex.exec(textHtml)) !== null) {
    const text = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length > 15 && !text.includes('Read More') && !text.includes('hazeldenbettyford')) {
      textBlocks.push(text);
    }
  }

  // If we got paragraph blocks, use them
  if (textBlocks.length > 0) {
    // First substantial block is often the quote/thought
    if (textBlocks.length === 1) {
      content = decodeEntities(textBlocks[0]);
    } else {
      // First block might be a short quote, rest is the meditation
      quote = decodeEntities(textBlocks[0]);
      content = textBlocks.slice(1).map(t => decodeEntities(t)).join('\n\n');
    }
  } else {
    // Fallback: strip all HTML and grab everything
    const plainText = textHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Remove common boilerplate
    const cleaned = plainText
      .replace(/Read More.*$/i, '')
      .replace(/Hazelden Betty Ford.*$/i, '')
      .trim();

    if (cleaned.length > 30) {
      content = decodeEntities(cleaned);
    }
  }

  // Try to extract a title from any heading elements
  const headingMatch = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i);
  if (headingMatch) {
    const headingText = headingMatch[1].replace(/<[^>]+>/g, '').trim();
    if (headingText.length > 2 && headingText.length < 100) {
      title = decodeEntities(headingText);
    }
  }

  return {
    success: !!(content),
    title: title,
    quote: quote || null,
    quoteSource: quoteSource || null,
    content: content || '',
    thought: null,
  };
}

async function fetchFromMainPage() {
  try {
    const response = await fetch('https://www.hazeldenbettyford.org/thought-for-the-day', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ThoughtForTheDayProxy/1.0)',
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      return { success: false };
    }

    const html = await response.text();

    // The main page may have the thought content rendered server-side
    // Look for structured content in the page
    let content = '';
    let title = 'Thought for the Day';

    // Look for article or main content area
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                         html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    if (articleMatch) {
      const articleText = articleMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (articleText.length > 50) {
        content = decodeEntities(articleText.substring(0, 2000));
      }
    }

    return {
      success: !!content,
      title: title,
      quote: null,
      quoteSource: null,
      content: content,
      thought: null,
    };
  } catch {
    return { success: false };
  }
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
