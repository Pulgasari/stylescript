// @stylescript/web

/** <style-script src='main.ss'>: loads, compiles and adopts a StyleScript file. */
export declare class StyleScriptElement extends HTMLElement {
  src: string | null;
  /** The source again: from src, else the text inside. */
  refresh (): Promise<void>;
}
