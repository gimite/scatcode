import Ajv from 'ajv';
import scatcodeSchema from './scatcode.schema.json';

// Shared state for domain data
const loadedDomains = new Set();
const loadingPromises = new Map();
export const domainData = {};

// Convert a string into a JSON string literal with non-ASCII printable characters
// encoded as \u{xxxx} format (xxxx must be at least 4 digits)
function toJsonStringLiteral(str) {
  let result = '"';
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    // ASCII printable range: 0x20 (space) to 0x7E (~)
    if (code >= 0x20 && code <= 0x7E) {
      // Handle special characters that need escaping in JSON
      if (ch === '"') {
        result += '\\"';
      } else if (ch === '\\') {
        result += '\\\\';
      } else {
        result += ch;
      }
    } else {
      // Encode non-ASCII printable characters as \u{xxxx}
      const codePoint = ch.codePointAt(0);
      const hexStr = codePoint.toString(16).toUpperCase().padStart(4, '0');
      result += `\\u{${hexStr}}`;
    }
  }
  result += '"';
  return result;
};

function validateDomain(domain) {
  // Basic domain validation
  if (!domain) {
    throw new Error('Domain cannot be empty');
  }
  
  // Check for valid domain format (allow letters, numbers, dots, and hyphens)
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  if (!domainRegex.test(domain)) {
    throw new Error('Invalid domain format (e.g., example.com)');
  }
  
  // Check if it has at least one dot
  if (!domain.includes('.')) {
    throw new Error('Domain must include a top-level domain (e.g., .com, .net)');
  }
}

async function fetchDomainData(domain) {
  validateDomain(domain);

  // If already loaded, return immediately
  if (loadedDomains.has(domain)) {
    return;
  }
  
  // If currently loading, wait for the existing promise
  if (loadingPromises.has(domain)) {
    return loadingPromises.get(domain);
  }
  
  // Start a new load
  const loadPromise = (async () => {
    try {
      console.log(`Loading scatcode data for domain: ${domain}`);

      const response = await fetch(`https://${domain}/scatcode.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Validate JSON against schema
      const ajv = new Ajv();
      const validate = ajv.compile(scatcodeSchema);
      const valid = validate(data);
      
      if (!valid) {
        throw new Error(`Invalid scatcode.json format: ${ajv.errorsText(validate.errors)}`);
      }

      const charactersMap = {};
      for (const ch of data.characters) {
        charactersMap[parseInt(ch.codepoint, 16)] = ch;
      }
      data.charactersMap = charactersMap;
      console.log(data);
      domainData[domain] = data;

      const styleSrcs = data.fallbackFont.src.map((src) => {
        const urlExp = JSON.stringify(src.url);
        const formatExp = JSON.stringify(src.format);
        return `url(${urlExp}) format(${formatExp})`;
      });
      const style = document.createElement('style');
      const fontFamilyExp = JSON.stringify(domain.replace(/\./g, ' '));
      style.textContent = `
        @font-face {
          font-family: ${fontFamilyExp};
          src: ${styleSrcs.join(', ')};
          font-display: block;
        }
      `;
      document.head.appendChild(style);
      
      loadedDomains.add(domain);
    } finally {
      loadingPromises.delete(domain);
    }
  })();
  
  loadingPromises.set(domain, loadPromise);
  return loadPromise;
}

export async function loadDomainData(domain) {
  await fetchDomainData(domain);
  return domainData[domain];
}

export function getDomainData(domain) {
  return domainData[domain];
}

// Parse scatcode encoded text into an array of runs [{domain, text}].
// `domain` is '' for the default domain, otherwise contains the domain string.
export function getScatcodeRunsFromScatcodeText(text) {
  const runs = [];
  let domain = '';
  let chunk = '';
  let isInDomain = false;

  const flush = () => {
    if (chunk === '') return;
    runs.push({ domain, text: chunk });
    chunk = '';
  };

  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === 0xe0001) {
      flush();
      domain = '';
      isInDomain = true;
    } else if (cp === 0xe007f && isInDomain) {
      isInDomain = false;
      if (domain !== '') {
        fetchDomainData(domain).catch(console.error);
      }
    } else if (cp >= 0xe0020 && cp < 0xe007f && isInDomain) {
      // Domain is encoded as ASCII codepoints (cp - 0xe0000)
      const ascii = String.fromCodePoint(cp - 0xe0000);
      domain += ascii;
    } else {
      chunk += ch;
    }
  }
  flush();
  return runs;
}

/**
 * Return the inline fontFamily string from an element or its ancestor where
 * the `style="font-family:..."` is present. This DOES NOT look up CSS rules,
 * only inline style attribute values.
 */
function getInlineFontFamily(node) {
  let el = node && node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    if (el.style && el.style.fontFamily) {
      return el.style.fontFamily;
    }
    el = el.parentElement;
  }
  return '';
}

/**
 * From an array of Range objects, return an array of {text, fontFamily} objects where
 * `text` is a contiguous piece of selected text and `fontFamily` is the raw
 * inline style value applied on the node or an ancestor element. This only
 * considers inline `style="font-family:..."` attributes and does not resolve
 * CSS rules or computed styles.
 */
function getTextFontRunsFromRanges(ranges) {
  const runs = [];
  if (!ranges || ranges.length === 0) return runs;

  for (const range of ranges) {
    const root = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    // If the root itself is a text node and it intersects, ensure we include it.
    let node = walker.nextNode();
    if (root.nodeType === Node.TEXT_NODE && range.intersectsNode(root) && (!node || node !== root)) {
      node = root;
    }

    while (node) {
      if (!range.intersectsNode(node)) {
        node = walker.nextNode();
        continue;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'BR') {
        // Insert a newline for <br> elements
        const fontFamily = getInlineFontFamily(node) || '';
        runs.push({ text: '\n', fontFamily });
      } else if (node.nodeType === Node.TEXT_NODE) {
        let start = 0;
        let end = node.length;
        if (node === range.startContainer) start = range.startOffset;
        if (node === range.endContainer) end = range.endOffset;
        if (end > start) {
          const text = node.data.slice(start, end);
          const fontFamily = getInlineFontFamily(node) || '';
          runs.push({ text, fontFamily });
        }
      }
      node = walker.nextNode();
    }
  }

  // Merge adjacent runs with same fontFamily
  const merged = [];
  for (const run of runs) {
    if (merged.length > 0 && merged[merged.length - 1].fontFamily === run.fontFamily) {
      merged[merged.length - 1].text += run.text;
    } else {
      merged.push({ ...run });
    }
  }
  return merged;
}

function getScatcodeTextFromFontRuns(runs) {
  let result = '';
  let lastDomain = '';
  for (const run of runs) {
    const { text, fontFamily } = run;
    let domain = '';
    let decodedFontFamily = fontFamily;
    try {
      decodedFontFamily = JSON.parse(fontFamily);
    } catch (e) {}
    if (decodedFontFamily && decodedFontFamily !== '') {
      domain = decodedFontFamily.replace(/ /g, '.');
    }
    if (domain !== lastDomain) {
      result += String.fromCodePoint(0xe0001);
      for (const ch of domain) {
        const cp = ch.codePointAt(0);
        result += String.fromCodePoint(cp + 0xe0000);
      }
      result += String.fromCodePoint(0xe007f);
      lastDomain = domain;
    }
    result += text;
  }
  if (lastDomain !== '') {
    result += String.fromCodePoint(0xe0001);
    result += String.fromCodePoint(0xe007f);
  }
  return result;
}

export function getScatcodeTextFromRanges(ranges) {
  const runs = getTextFontRunsFromRanges(ranges);
  return getScatcodeTextFromFontRuns(runs);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br/>');
}

function escapeCssString(s) {
  // We will wrap in single quotes, so escape single quotes if any
  return String(s).replace(/'/g, "\\'");
}

// Parse a text string encoded with Scatcode markers into HTML where text runs are wrapped
// in <span style="font-family: ..."> markers corresponding to the encoded domain.
export function getHtmlFromScatcodeText(text) {
  const runs = getScatcodeRunsFromScatcodeText(text);
  let result = '';
  for (const run of runs) {
    const chunkHtml = escapeHtml(run.text);
    if (!run.domain || run.domain === '') {
      result += chunkHtml;
    } else {
      const fontFamily = run.domain.replace(/\./g, ' ');
      const esc = escapeCssString(fontFamily);
      result += `<span style="font-family: '${esc}';">${chunkHtml}</span>`;
    }
  }
  return result;
}

function handleCopy(e) {
  try {
    const cb = e.clipboardData || (window.clipboardData && window.clipboardData.getData ? window.clipboardData : null);
    const selection = window.getSelection();
    const ranges = [];
    for (let i = 0; i < selection.rangeCount; i++) {
      ranges.push(selection.getRangeAt(i));
    }
    const scatcodeText = getScatcodeTextFromRanges(ranges);
    console.log('Scatcode text:', toJsonStringLiteral(scatcodeText));
    cb.setData('text/plain', scatcodeText);
    e.preventDefault();
  } catch (err) {
    console.error('Error in copy handler', err);
  }
}

// Register global copy handler once
let copyHandlerRegistered = false;
export function registerCopyHandler() {
  if (!copyHandlerRegistered) {
    document.addEventListener('copy', handleCopy);
    copyHandlerRegistered = true;
  }
}
