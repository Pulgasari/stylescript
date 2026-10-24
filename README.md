# stylescript

a language for styles, compiled to css. the syntax is not decided yet, see CONCEPT.md.

| package | | |
|---|---|---|
| `@stylescript/compiler` | [packages/compiler](packages/compiler) | source in, css out |
| `@stylescript/web` | [packages/web](packages/web) | `<style-script>`, a service worker, vercel middleware |
| `@stylescript/cli` | [packages/cli](packages/cli) | `.ss` files to `.css` files |

## demos

- `index.html`: `<style-script src='./demo.ss'>`, compiled in the page
- `demo1/`: a plain `<link rel='stylesheet' href='demo.ss'>`, compiled by a service worker
- `demo2/`: the same link, compiled by the vercel middleware (`middleware.js` at the root)

## strategies (the first sketch)


### 1. service worker

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <!-- Browser treats this as render-blocking CSS! -->
  <link rel="stylesheet" href="/styles/main.ss" />
  
  <script>
    // register the compiler service worker
    navigator?.serviceWorker?.register('/stylescript-sw.js');
  </script>
</head>
<body>
  <h1>Hello StyleScript</h1>
</body>
</html>
```

```js
// stylescript-sw.js (Service Worker)
import compile from '@stylescript/compiler.js';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // intercept StyleScript files
  if (url.pathname.endsWith('.ss')) {
    event.respondWith(
      (async () => {
        // 1. fetch raw StyleScript source code
        // 2. compile StyleScript to standard CSS string
        const response = await fetch(event.request);
        const   ssCode = await response.text();
        const  cssCode = compile(ssCode);

        // 3. return as valid CSS to the browser rendering pipeline
        return new Response(cssCode, {
          headers: { 'Content-Type': 'text/css' },
        });
      })()
    );
  }
});
```

### 2. vercel | middleware.js

```js
// middleware.js
import compile from '@stylescript/compiler.js';

// Define routing matcher for StyleScript files
export const config = { matcher: '/:path*.ss' };

export default async function middleware (request) {
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
```

```js
// middleware.js
import compile from './stylescript-compiler.js';

// define routing matcher for StyleScript files
export const config = { matcher: '/:path*.ss' };

export async function middleware (request) {
  // 1. pass through to the static file if this is our internal fetch
  if (request.headers.get('x-skip-middleware') === '1') {
    return new Response (null, { headers: { 'x-middleware-next': '1' }});
  }

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

export default middleware;
```
