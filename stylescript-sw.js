import { compileStyleScriptToCSS } from './compiler.js';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept StyleScript files
  if (url.pathname.endsWith('.ss')) {
    event.respondWith(
      (async () => {
        // 1. fetch raw StyleScript source code
        const response = await fetch(event.request);
        const ssCode = await response.text();

        // 2. compile StyleScript to standard CSS string
        const cssCode = compileStyleScriptToCSS(ssCode);

        // 3. return as valid CSS to the browser rendering pipeline
        return new Response(cssCode, {
          headers: { 'Content-Type': 'text/css' },
        });
      })()
    );
  }
});
