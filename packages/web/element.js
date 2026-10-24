// @stylescript/web :: element

/*
<style-script src='./main.ss'></style-script>: loads a StyleScript file,
compiles it and adopts the css into the document. without src the text
inside is the source:

  <style-script>
    $accent = #f80;
    .card { color: $accent; }
  </style-script>

the sheet lives as long as the element: a new src recompiles, removing the
element removes its css. events: 'stylescript:load' ({ css }),
'stylescript:error' ({ error }).
*/

import compile from '../compiler/index.js';

class StyleScriptElement extends HTMLElement {
  static observedAttributes = ['src'];

  #sheet = new CSSStyleSheet;
  #load  = 0;   // the latest load: an earlier one that answers late is dropped

  connectedCallback () {
    this.hidden = true;
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.#sheet];
    this.refresh();
  }

  disconnectedCallback () {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sheet => sheet !== this.#sheet);
  }

  attributeChangedCallback (name, previous, next) {
    if (this.isConnected && previous !== next) this.refresh();
  }

  get src ()      { return this.getAttribute('src'); }
  set src (value) { this.setAttribute('src', value); }

  // the source again: from src, else the text inside
  async refresh () {
    const load = ++this.#load;
    try {
      const source = this.src ? await fetch(new URL(this.src, document.baseURI)).then(response => {
        if (!response.ok) throw new Error(`${this.src}: ${response.status} ${response.statusText}`);
        return response.text();
      }) : this.textContent;
      if (load !== this.#load) return;
      const css = compile(source);
      this.#sheet.replaceSync(css);
      this.dispatchEvent(new CustomEvent('stylescript:load', { detail: { css } }));
    }
    catch (error) {
      if (load !== this.#load) return;
      console.error('[stylescript]', error);
      this.dispatchEvent(new CustomEvent('stylescript:error', { detail: { error } }));
    }
  }
}

if (!customElements.get('style-script')) customElements.define('style-script', StyleScriptElement);

// :::::: EXPORT

export { StyleScriptElement };
export default StyleScriptElement;
