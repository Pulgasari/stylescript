// @stylescript/web :: service-worker

/*
a service worker that answers every request for a .ss file with its css, so
a plain <link rel='stylesheet' href='main.ss'> works. a worker reaches only
the pages below its own folder: the site keeps a one line worker next to its
pages and registers that one (register.js):

  // sw.js, next to index.html
  import './packages/web/service-worker.js';
*/

import compile from '../compiler/index.js';

const isStyleScript = request => new URL(request.url).pathname.endsWith('.ss');

async function respond (request) {
  try {
    const response = await fetch(request);
    if (!response.ok) return response;
    return new Response(compile(await response.text()), { headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'text/css; charset=utf-8' } });
  }
  catch (error) {
    console.error('[stylescript] service worker:', error);
    return fetch(request);
  }
}

// in charge at once, also of the pages already open
self.addEventListener('install',  ()    => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',    event => { if (isStyleScript(event.request)) event.respondWith(respond(event.request)); });

// :::::: EXPORT

export { isStyleScript, respond };
