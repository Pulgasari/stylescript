// @stylescript/web :: element

import compile from '../compiler/index.js';

const sheets = document.adoptedStyleSheets;

class StyleScriptElement extends HTMLElement {
  static observedAttributes = ['src'];

  #sheet = new CSSStyleSheet;
  #load  = 0;   // the latest load: an earlier one that answers late is dropped

  connectedCallback () {
    this.hidden = true;
    sheets = [...sheets, this.#sheet];
    this.refresh();
  }

  disconnectedCallback () {
    sheets = sheets.filter(sheet => sheet !== this.#sheet);
  }

  attributeChangedCallback (name, prev, next) {
    if (this.isConnected && prev !== next) this.refresh();
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
