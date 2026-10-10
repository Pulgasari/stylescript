// middleware.js
import compile from './stylescript-compiler.js';

// Define routing matcher for StyleScript files
export const config = { matcher: '/:path*.ss' };

export async function middleware (request) {
  // 1. fetch the raw static .ss asset from Vercel's internal origin
  // 2. transpile StyleScript to CSS at the edge
  const response = await fetch(request.url); if (!response.ok) return response;
  const   ssCode = await response.text();
  const  cssCode = compile(ssCode);

  // 3. return compiled CSS to the browser with proper caching and content-type
  return new Response(cssCode, {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
