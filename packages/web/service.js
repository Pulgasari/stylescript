// @stylescript/web :: register

/*
the page side of the service worker: registers it, and compiles the .ss
stylesheets of this first visit itself, while no worker is in charge yet.

  <link rel='stylesheet' href='./main.ss' />
  <script type='module'>
    import { register } from './packages/web/register.js';
    register('./sw.js');
  </script>
*/

import compile from '../compiler/index.js';

// the .ss stylesheets of the page as <style> elements next to their links
async function fallback () {
  const links = document.querySelectorAll('link[rel="stylesheet"][href$=".ss"]');
  await Promise.all([...links].map(async link => {
    try {
      const response = await fetch(link.href);
      const style    = Object.assign(document.createElement('style'), { textContent: compile(await response.text()) });
      style.dataset.stylescript = link.href;
      link.after(style);
    }
    catch (error) { console.error('[stylescript] first visit:', error); }
  }));
}

function register (url = './sw.js') {
  if (!('serviceWorker' in navigator)) return fallback();
  navigator.serviceWorker.register(url, { type: 'module' }).catch(error => console.error('[stylescript] service worker:', error));
  if (!navigator.serviceWorker.controller) return fallback();
}

// :::::: EXPORT

export { fallback, register };
export default register;
