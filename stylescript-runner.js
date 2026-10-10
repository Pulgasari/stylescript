import { compileStyleScript } from './stylescript-compiler.js';

// 1. Register Service Worker for subsequent visits
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./stylescript-service.js', { type: 'module' }).catch((err) => {
    console.error('[StyleScript] Service Worker registration failed:', err);
  });
}

// 2. Cold-Start Fallback: Execute manually if SW does not control the page yet
if (!navigator.serviceWorker.controller) {
  console.info('[StyleScript] Cold start detected. Compiling styles inline as fallback.');

  const ssLinks = document.querySelectorAll('link[rel="stylesheet"][href$=".ss"]');

  ssLinks.forEach(async (link) => {
    try {
      const response = await fetch(link.href);
      const   ssCode = await response.text();
      const  cssCode = compileStyleScript(ssCode);

      // Inject compiled CSS as fallback style block
      const $style = document.createElement('style');
      $style.dataset.stylescript = link.href;
      $style.textContent         = cssCode;
      document.head.appendChild($style);
    } catch (err) {
      console.error('[StyleScript] Cold start compilation failed:', err);
    }
  });
}
