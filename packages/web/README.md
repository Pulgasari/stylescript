# @stylescript/web

three ways to get StyleScript into a page, all through `@stylescript/compiler`.

| | where it compiles | |
|---|---|---|
| `element.js` | the page | `<style-script src='main.ss'>`, or the source inside it |
| `service-worker.js` + `register.js` | a service worker | a plain `<link rel='stylesheet' href='main.ss'>`, the first visit compiled by the page |
| `middleware.js` | the edge (vercel) | a plain `<link>`, the server hands out css |

## element

```html
<script type='module' src='./packages/web/element.js'></script>
<style-script src='./main.ss'></style-script>
```

the css is adopted into the document while the element is there. events `stylescript:load`, `stylescript:error`.

## service worker

```js
// sw.js, next to the pages: a worker reaches only the pages below its folder
import './packages/web/service-worker.js';
```

```html
<link rel='stylesheet' href='./main.ss' />
<script type='module'>
  import { register } from './packages/web/register.js';
  register('./sw.js');
</script>
```

## middleware

```js
// middleware.js at the root of the vercel project
export { middleware as default } from './packages/web/middleware.js';
export const config = { matcher: '/:path*.ss' };
```
