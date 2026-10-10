# stylescript

## strategies

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
