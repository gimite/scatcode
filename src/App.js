import { useEffect, Children, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Paragraph, Bold, Italic, FontFamily } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import './App.css';

const toCodePoints = (str) => Array.from(str, ch => ch.codePointAt(0));

// Array.from("sitelenpona.gimite.net", ch => "&#x" + (ch.codePointAt(0) + 0xe0000).toString(16) + ";").join("")

const loadedDomains = new Set();

async function loadData(domain) {
  if (loadedDomains.has(domain)) {
    return;
  }
  loadedDomains.add(domain);

  const response = await fetch(`https://${domain}/opencode.json`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log(data);

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
    }
  `;
  document.head.appendChild(style);
}

function OpencodeText({ children }) {
  const childArray = Children.toArray(children);
  for (const c of childArray) {
    if (typeof c !== 'string' && typeof c !== 'number') {
      throw new Error('OpencodeText: children must be plain text (string or number)');
    }
  }
  const text = childArray.length === 0 ? '' : childArray.map(c => String(c)).join('');

  let domain = '';
  let chunkText = '';
  const domains = new Set();
  const elements = [];

  const output = () => {
    if (domain !== '') {
      domains.add(domain);
    }
    const fontFamily = domain.replace(/\./g, ' ');
    const index = elements.length;
    elements.push(<span key={index} style={{fontFamily}}>{chunkText}</span>);
    domain = '';
    chunkText = '';
  }

  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === 0xe0001) {
      output();
      domain = '';
    } else if (cp === 0xe007f) {
    } else if (cp >= 0xe0020 && cp < 0xe007f) {
      const ascii = String.fromCodePoint(cp - 0xe0000);
      domain += ascii;
    } else {
      chunkText += ch;
    }
  }
  output();

  useEffect(() => {
    for (const d of domains) {
      loadData(d).catch(console.error);
    }
  }, [text]);
  
  return <>{elements}</>;
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
 * From a Window Selection, return an array of {text, fontFamily} objects where
 * `text` is a contiguous piece of selected text and `fontFamily` is the raw
 * inline style value applied on the node or an ancestor element. This only
 * considers inline `style="font-family:..."` attributes and does not resolve
 * CSS rules or computed styles.
 */
function getSelectionTextFontRuns(selection = window.getSelection()) {
  const runs = [];
  if (!selection || selection.rangeCount === 0) return runs;

  for (let r = 0; r < selection.rangeCount; r++) {
    const range = selection.getRangeAt(r);
    const root = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
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
      let start = 0;
      let end = node.length;
      if (node === range.startContainer) start = range.startOffset;
      if (node === range.endContainer) end = range.endOffset;
      if (end > start) {
        const text = node.data.slice(start, end);
        const fontFamily = getInlineFontFamily(node) || '';
        runs.push({ text, fontFamily });
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

function getOpencodeTextFromFontRuns(runs) {
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
  return result;
}

// Parse a text string encoded with Opencode markers into HTML where text runs are wrapped
// in <span style="font-family: ..."> markers corresponding to the encoded domain.
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeCssString(s) {
  // We will wrap in single quotes, so escape single quotes if any
  return String(s).replace(/'/g, "\\'");
}

function parseOpencodeToHtml(text) {
  let result = '';
  let domain = '';
  let chunk = '';

  const flush = () => {
    if (chunk === '') return;
    const fontFamily = domain.replace(/\./g, ' ');
    const esc = escapeCssString(fontFamily);
    result += `<span style="font-family: '${esc}';">${escapeHtml(chunk)}</span>`;
    chunk = '';
  };

  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp === 0xe0001) {
      flush();
      domain = '';
    } else if (cp === 0xe007f) {
      // delimiter - ignore
    } else if (cp >= 0xe0020 && cp < 0xe007f) {
      // Domain is encoded as ASCII codepoints (cp - 0xe0000)
      const ascii = String.fromCodePoint(cp - 0xe0000);
      domain += ascii;
    } else {
      chunk += ch;
    }
  }
  flush();
  return result;
}

function App() {
  const [selectionRuns, setSelectionRuns] = useState([]);

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      console.log('Codepoints: ', toCodePoints(text));
      console.log('Clipboard text:', text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
      alert('Failed to read clipboard: ' + (err && err.message ? err.message : err));
    }
  };

    // Global copy handler: capture copied HTML and plain text anywhere in the window.
    useEffect(() => {
      const handleCopy = (e) => {
        try {
          const cb = e.clipboardData || (window.clipboardData && window.clipboardData.getData ? window.clipboardData : null);
          const runs = getSelectionTextFontRuns();
          setSelectionRuns(runs);
          console.log('Selection runs:', runs);
          const opencodeText = getOpencodeTextFromFontRuns(runs);
          console.log('Opencode text:', opencodeText);
          console.log('Opencode text codepoints:', toCodePoints(opencodeText));
          cb.setData('text/plain', opencodeText);
          e.preventDefault();
        } catch (err) {
          console.error('Error in copy handler', err);
        }
      };

      document.addEventListener('copy', handleCopy);
      return () => document.removeEventListener('copy', handleCopy);
    }, []);

  return (
    <div>
      <div>
        <OpencodeText>
          foo&#xe0001;&#xe0073;&#xe0069;&#xe0074;&#xe0065;&#xe006c;&#xe0065;&#xe006e;&#xe0070;&#xe006f;&#xe006e;&#xe0061;&#xe002e;&#xe0067;&#xe0069;&#xe006d;&#xe0069;&#xe0074;&#xe0065;&#xe002e;&#xe006e;&#xe0065;&#xe0074;&#xe007f;&#xEE6C;&#xEE54;
          &#xe0001;&#xe007f;bar
          &#xe0001;&#xe0074;&#xe0065;&#xe006e;&#xe0067;&#xe0077;&#xe0061;&#xe0072;&#xe002e;&#xe0067;&#xe0069;&#xe006d;&#xe0069;&#xe0074;&#xe0065;&#xe002e;&#xe006e;&#xe0065;&#xe0074;abc
        </OpencodeText>
      </div>
      <div>
        <button onClick={handlePasteClick}>Paste</button>
      </div>
      <div style={{marginTop: 8}}>
        <strong>Selection Runs:</strong>
        <pre style={{whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 8}}>{JSON.stringify(selectionRuns, null, 2)}</pre>
      </div>
      <CKEditor
        editor={ ClassicEditor }
        onReady={(editor) => {
          // Use CKEditor's Clipboard plugin to intercept pasted text and transform Opencode runs
          const clipboard = editor.plugins.get('ClipboardPipeline');
          if (!clipboard) {
            console.error('Clipboard plugin not found in CKEditor instance');
            return;
          }

          const clipboardHandler = (evt, data) => {
            try {
              console.log('CKEditor clipboard inputTransformation event', data);
              const dt = data.dataTransfer;
              if (!dt) return;
              const plain = dt.getData('text/plain') ?? '';
              const html = parseOpencodeToHtml(plain);
              console.log('Parsed HTML from Opencode:', html);
              data.content = editor.data.processor.toView(html);
            } catch (err) {
              console.error('Error handling clipboard inputTransformation:', err);
            }
          };

          clipboard.on('inputTransformation', clipboardHandler);
          editor.on('destroy', () => clipboard.off('inputTransformation', clipboardHandler));
        }}
        config={ {
          licenseKey: 'GPL',
          plugins: [ Essentials, Paragraph, Bold, Italic, FontFamily ],
          toolbar: [ 'undo', 'redo', '|', 'fontFamily', 'bold', 'italic' ],
          fontFamily: {
            options: [
              'default',
              'Arial, Helvetica, sans-serif',
              'Courier New, Courier, monospace',
              'Georgia, serif',
              'Lucida Sans Unicode, Lucida Grande, sans-serif',
              'Tahoma, Geneva, sans-serif',
              'Times New Roman, Times, serif',
              'Trebuchet MS, Helvetica, sans-serif',
              'Verdana, Geneva, sans-serif',
              'sitelenpona gimite net',
              'tengwar gimite net',
            ],
            supportAllValues: true,
          },
          initialData: '<p style="font-family: Arial, Helvetica, sans-serif;">Hello from CKEditor 5 in React!</p>',
        } }
      />
    </div>
  );
}

export default App;
