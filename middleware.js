import compile from './stylescript-compiler.js';

// Define routing matcher for StyleScript files
export const config = { matcher: '/:path*.ss' };

export async function middleware (request) {
  const url = new URL(request.url);

  // 1. Pass through to static asset if this is our internal fetch with ?raw=1
  if (url.searchParams.has('raw')) {
    return new Response(null, {
      headers: {
        'x-middleware-next': '1',
      },
    });
  }

  // 2. Fetch the raw static asset from Vercel CDN using a query parameter
  url.searchParams.set('raw', '1');
  const response = await fetch(url.toString());

  if (!response.ok) {
    return response;
  }

  // 3. Transpile StyleScript to CSS at the edge
  try {
    const ssCode = await response.text();
    const cssCode = compile(ssCode);

    // 4. Return compiled CSS to the browser
    return new Response(cssCode, {
      status: 200,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('StyleScript Compilation Error:', error);
    return new Response(`/* StyleScript compilation error: ${error.message} */`, {
      status: 500,
      headers: { 'Content-Type': 'text/css; charset=utf-8' },
    });
  }
}
