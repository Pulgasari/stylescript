// @stylescript/compiler :: compile

/*
the prototype: no syntax of its own yet, only what the demos use.

  $accent = #ff8800;                 a variable, $accent anywhere after it
  .card { h1 { … } &:hover { … } }   nesting, & is the parent selector

source in, css out.
*/

function compile (ssCode) {
  // 1. Substitute variables
  const vars = {};
  let css = ssCode.replace(/\$([a-zA-Z0-9_-]+)\s*=\s*([^;]+);/g, (_, name, val) => {
    vars[name] = val.trim();
    return '';
  });

  for (const [name, value] of Object.entries(vars)) {
    css = css.replace(new RegExp(`\\$${name}\\b`, 'g'), value);
  }

  // 2. Flatten nested rules recursively
  return flattenCSS(css);
}

function flattenCSS (css, parentSelector = '') {
  let output          = '';
  let buffer          = '';
  let depth           = 0;
  let currentSelector = '';
  let blockContent    = '';

  for (let i = 0; i < css.length; i++) {
    const char = css[i];

    if (char === '{') {
      if (depth === 0) {
        currentSelector = buffer.trim();
        buffer = '';
      } else {
        blockContent += char;
      }
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        // Resolve target selector
        let fullSelector = currentSelector;
        if (parentSelector) {
          fullSelector = currentSelector.includes('&')
            ? currentSelector.replace(/&/g, parentSelector)
            : `${parentSelector}${currentSelector}`;
        }

        const { properties, nested } = extractPropsAndNested(blockContent);

        if (properties.trim()) {
          output += `${fullSelector} {\n${properties.trim()}\n}\n`;
        }

        if (nested.trim()) {
          output += flattenCSS(nested, fullSelector);
        }

        blockContent = '';
      } else {
        blockContent += char;
      }
    } else {
      if (depth === 0) {
        buffer += char;
      } else {
        blockContent += char;
      }
    }
  }

  return output;
}

function extractPropsAndNested (content) {
  let properties    = '';
  let nested        = '';
  let depth         = 0;
  let currentNested = '';

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '{') {
      depth++;
      currentNested += char;
    } else if (char === '}') {
      depth--;
      currentNested += char;
      if (depth === 0) {
        nested += currentNested + '\n';
        currentNested = '';
      }
    } else if (depth > 0) {
      currentNested += char;
    } else {
      properties += char;
    }
  }

  if (nested) {
    properties = properties.replace(/[^{};]+$/g, '');
  }

  return { properties, nested };
}

// :::::: EXPORT

export { compile };
export default compile;
