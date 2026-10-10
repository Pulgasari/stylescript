// middleware.js
import { next } from '@vercel/functions';
import compile from './stylescript-compiler.js';

// define routing matcher for StyleScript files
export const config = { matcher: '/:path*.ss' };

export default async function middleware (request) {
  // 1. pass through to the static file if this is our internal fetch
  if (request.headers.get('x-skip-middleware') === '1') return next();

  // 2. fetch the raw static asset with the skip header attached
  const response = await fetch(request.url, { headers: { 'x-skip-middleware': '1' }});     
  if (!response.ok) return response;
  
  // 3. transpile StyleScript to CSS at the edge
  const  ssCode = await response.text();
  const cssCode = compile(ssCode);

  // 4. return compiled CSS to the browser
  return new Response(cssCode, {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}



