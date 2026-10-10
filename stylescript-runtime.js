// stylescript-runtime.js
import compile from 'stylescript-compiler.js';

(async function () {
  // Find all StyleScript links
  const links = document.querySelectorAll('link[rel="stylescript"]');

  for (const link of links) {
    const href     = link.getAttribute('href');
    const response = await fetch(href);
    const ssCode   = await response.text();

    // Compile code
    const cssCode = compile(ssCode);

    // Replace <link> with compiled <style> tag synchronously in head
    const styleTag = document.createElement('style');
    styleTag.textContent = cssCode;
    link.parentNode.replaceChild(styleTag, link);
  }
})();
