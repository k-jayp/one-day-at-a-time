import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Strips @layer wrappers from the CSS output so Tailwind utilities
 * are unlayered and can compete with the main site's CSS on specificity
 * instead of automatically losing (unlayered CSS always beats layered).
 */
function stripCssLayers(): Plugin {
  return {
    name: 'strip-css-layers',
    generateBundle(_, bundle) {
      for (const [, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && typeof chunk.source === 'string' && chunk.fileName.endsWith('.css')) {
          chunk.source = removeLayers(chunk.source);
        }
      }
    },
  };
}

function removeLayers(css: string): string {
  let result = '';
  let i = 0;
  while (i < css.length) {
    // Check for @layer <name> { pattern
    const remaining = css.substring(i);
    const match = remaining.match(/^@layer\s+[\w-]+\s*\{/);
    if (match) {
      i += match[0].length;
      // Find the matching closing brace by counting depth
      let depth = 1;
      const start = i;
      while (i < css.length && depth > 0) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') depth--;
        if (depth > 0) i++;
      }
      // Add the inner content without the @layer wrapper
      result += css.substring(start, i);
      i++; // skip the closing brace
    } else {
      result += css[i];
      i++;
    }
  }
  return result;
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stripCssLayers()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({}),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      name: 'GrowthGames',
      formats: ['iife'],
      fileName: () => 'growth-games.js',
    },
    cssFileName: 'growth-games',
    outDir: path.resolve(__dirname, '..', 'js', 'growth-games'),
    emptyOutDir: true,
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
