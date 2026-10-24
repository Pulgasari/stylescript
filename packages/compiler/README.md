# @stylescript/compiler

StyleScript source in, css out. runs anywhere: browser, service worker, edge, node.

```js
import compile from '@stylescript/compiler';

compile('$accent = #f80; .card { color: $accent; &:hover { color: black; } }');
```

the syntax is not decided yet (CONCEPT.md). today it knows what the demos use: `$name = value;` and nesting with `&`.
