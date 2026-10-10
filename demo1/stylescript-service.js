import compile from './stylescript-compiler.js';

// 1. Activate immediately during install phase
self.addEventListener('install', () => { self.skipWaiting(); });

// 2. Claim active clients immediately
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });

// 3. Intercept request pipeline for .ss files
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('.ss')) {
    event.respondWith(
      (async () => {
        try {
          // Fetch raw StyleScript file from server
          const response = await fetch(event.request);
          const ssCode   = await response.text();

          // Transpile StyleScript to CSS on the fly
          const cssCode = compile(ssCode);

          // Return compiled CSS directly to browser rendering engine
          return new Response(cssCode, {
            headers: {
              'Content-Type': 'text/css; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          });
        } catch (err) {
          console.error('[StyleScript SW] Interception failed:', err);
          return fetch(event.request);
        }
      })()
    );
  }
});
