// stylescript-runner.js
import { compileStyleScriptToCSS } from './compiler.js';

// 1. Register the Service Worker for all upcoming requests
navigator?.serviceWorker?.register('/stylescript-sw.js');

// 2. Fallback only for the VERY FIRST cold start
if (!navigator.serviceWorker.controller) {
  console.warn('[StyleScript] Cold start detected. SW not controlling page yet, falling back to JS compiler.');

  const ssLinks = document.querySelectorAll('link[href$=".ss"]');
  
  ssLinks.forEach(async (link) => {
    const response = await fetch(link.href);
    const code     = await response.text();
    const css      = compileStyleScriptToCSS(code);

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  });
}
