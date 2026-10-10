# stylescript

## strategies

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
```

### 2. vercel | middleware.js

```js
// middleware.js
import { compileStyleScript } from './compiler.js';

// Define routing matcher for StyleScript files
export const config = {
  matcher: '/styles/:path*.ss',
};

export async function middleware(request) {
  // 1. Fetch the raw static .ss asset from Vercel's internal origin
  const response = await fetch(request.url);

  if (!response.ok) {
    return response;
  }

  const ssCode = await response.text();

  // 2. Transpile StyleScript to CSS at the Edge
  const cssCode = compileStyleScript(ssCode);

  // 3. Return compiled CSS to the browser with proper Caching and Content-Type
  return new Response(cssCode, {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
```
