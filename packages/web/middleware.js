// @stylescript/web :: middleware

/*
vercel edge middleware: a request for a .ss file gets the compiled css. the
project's own middleware.js at its root re-exports it, with the matcher
written there (vercel reads config from that file only):

  // middleware.js
  export { middleware as default } from './packages/web/middleware.js';
  export const config = { matcher: '/:path*.ss' };
*/

import compile from '../compiler/index.js';

const SKIP = 'x-skip-middleware';

export const config = { matcher: '/:path*.ss' };

export async function middleware (request) {
  // the fetch below comes back through here: let it reach the static file
  if (request.headers.get(SKIP) === '1') return new Response(null, { headers: { 'x-middleware-next': '1' } });

  const response = await fetch(request.url, { headers: { [SKIP]: '1' } });
  if (!response.ok) return response;

  return new Response(compile(await response.text()), {
    headers : { 'Cache-Control': 'public, max-age=0, must-revalidate', 'Content-Type': 'text/css; charset=utf-8' },
    status  : 200,
  });
}

export default middleware;
