import { useEffect, Children, useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Paragraph, FontFamily } from 'ckeditor5';
import { unicodeName } from 'unicode-name';

import 'ckeditor5/ckeditor5.css';
import './App.css';

const toCodePoints = (str) => Array.from(str, ch => ch.codePointAt(0));

function getOpencodeDomainTagHtml(domain) {
  return '&#xe0001;' +
    Array.from(
      domain,
      ch => "&#x" + (ch.codePointAt(0) + 0xe0000).toString(16) + ";"
    ).join("") +
    '&#xe007f;'
}

// console.log(getOpencodeDomainTagHtml('liparxe.gimite.net'));

const loadedDomains = new Set();
const domainData = {};

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

  // Use the shared parser to obtain runs of {domain, text}
  const runs = parseOpencodeRuns(text);
  const domains = new Set();
  const elements = runs.map((run, index) => {
    if (run.domain && run.domain !== '') domains.add(run.domain);
    const fontFamily = run.domain.replace(/\./g, ' ');
    return <span key={index} style={{fontFamily}}>{run.text}</span>;
  });

  useEffect(() => {
    for (const d of domains) {
      loadData(d).catch(console.error);
    }
  }, [text]);
  
  return <>{elements}</>;
}

// Parse opencode encoded text into an array of runs [{domain, text}].
// `domain` is '' for the default domain, otherwise contains the domain string.
function parseOpencodeRuns(text) {
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
  const runs = parseOpencodeRuns(text);
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

function App() {
  const editorRef = useRef(null);
  const [domainPreset, setDomainPreset] = useState('custom');
  const [domainInput, setDomainInput] = useState('');
  const [tableDomain, setTableDomain] = useState('');
  const [tableDomainData, setTableDomainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChars, setSelectedChars] = useState(null);

  const domainPresets = {
    'sitelenpona': 'sitelenpona.gimite.net',
    'tengwar': 'tengwar.gimite.net',
    'liparxe': 'liparxe.gimite.net',
  };

  const insertHtml = (html) => {
    if (!editorRef.current) {
      console.error('Editor is not ready');
      return;
    }
    try {
      const editor = editorRef.current;
      const viewFragment = editor.data.processor.toView(html);
      const modelFragment = editor.data.toModel(viewFragment);
      editor.model.change(writer => {
        // Ensure default font is used for the inserted content
        writer.removeSelectionAttribute('fontFamily');
        editor.model.insertContent(modelFragment, editor.model.document.selection);
      });
    } catch (err) {
      console.error('Failed to insert HTML into CKEditor', err);
    }
  };

  const handleCharacterTableSubmit = async (e) => {
    e.preventDefault();
    const domain = domainInput.trim();
    if (!domain) return;
    await loadDomainData(domain);
  }

  const loadDomainData = async (domain) => {
    setLoading(true);
    setError(null);
    try {
      await loadData(domain);
      setTableDomain(domain);
      setTableDomainData(domainData[domain]);
    } catch (err) {
      setError(String(err));
      setTableDomain('');
      setTableDomainData(null);
    } finally {
      setLoading(false);
    }
  }

  const handlePresetChange = async (e) => {
    const preset = e.target.value;
    setDomainPreset(preset);
    
    if (preset !== 'custom') {
      const domain = domainPresets[preset];
      setDomainInput(domain);
      await loadDomainData(domain);
    }
  }

  // Global copy handler: capture copied HTML and plain text anywhere in the window.
  useEffect(() => {
    const handleCopy = (e) => {
      try {
        const cb = e.clipboardData || (window.clipboardData && window.clipboardData.getData ? window.clipboardData : null);
        const runs = getSelectionTextFontRuns();
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

  // Handle text selection: show table of selected characters
  useEffect(() => {
    const handleSelectionChange = () => {
      try {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        if (!selectedText || selectedText.trim() === '') {
          setSelectedChars(null);
          return;
        }

        // Get font runs with their associated domains
        const runs = getSelectionTextFontRuns(selection);
        const opencodeText = getOpencodeTextFromFontRuns(runs);
        
        // Parse the opencode text to get domain information for each character
        const opencodeRuns = parseOpencodeRuns(opencodeText);
        
        // Build character list with domain and codepoint info
        const chars = [];
        for (const run of opencodeRuns) {
          for (const ch of run.text) {
            const cp = ch.codePointAt(0);
            const cpHex = cp.toString(16).toUpperCase().padStart(4, '0');
            const codepointDisplay = run.domain
              ? `${run.domain}/#${cpHex}`
              : `U+${cpHex}`;
            let name;
            if (run.domain && domainData[run.domain]) {
              const data = domainData[run.domain];
              const charData = data.charactersMap[cp];
              name = charData ? `${data.name.toUpperCase()} ${charData.name}` : '';
            } else {
              name = unicodeName(ch) || '';
            }
            chars.push({
              char: ch,
              codepoint: codepointDisplay,
              fontFamily: run.domain ? run.domain.replace(/\./g, ' ') : '',
              domain: run.domain || '',
              name: name,
            });
          }
        }
        
        setSelectedChars(chars);
      } catch (err) {
        console.error('Error in selectionchange handler', err);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  return (
    <div>
      <div>
        <OpencodeText>
          I love
          &#xe0001;&#xe0073;&#xe0069;&#xe0074;&#xe0065;&#xe006c;&#xe0065;&#xe006e;&#xe0070;&#xe006f;&#xe006e;&#xe0061;&#xe002e;&#xe0067;&#xe0069;&#xe006d;&#xe0069;&#xe0074;&#xe0065;&#xe002e;&#xe006e;&#xe0065;&#xe0074;&#xe007f;&#xF196C;&#xF1954;
          &#xe0001;&#xe007f;,
          &#xe0001;&#xe0074;&#xe0065;&#xe006e;&#xe0067;&#xe0077;&#xe0061;&#xe0072;&#xe002e;&#xe0067;&#xe0069;&#xe006d;&#xe0069;&#xe0074;&#xe0065;&#xe002e;&#xe006e;&#xe0065;&#xe0074;&#xE000;&#xE046;&#xE007;&#xE040;&#xE014;
          &#xe0001;&#xe007f; and
          &#xe0001;&#xe006c;&#xe0069;&#xe0070;&#xe0061;&#xe0072;&#xe0078;&#xe0065;&#xe002e;&#xe0067;&#xe0069;&#xe006d;&#xe0069;&#xe0074;&#xe0065;&#xe002e;&#xe006e;&#xe0065;&#xe0074;&#xe007f;lineparine
          &#xe0001;&#xe007f;!
        </OpencodeText>
      </div>
      <CKEditor
        editor={ ClassicEditor }
        onReady={(editor) => {
          editorRef.current = editor;
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
              editor.model.change(writer => writer.removeSelectionAttribute('fontFamily'));
              const plain = dt.getData('text/plain') ?? '';
              const html = parseOpencodeToHtml(plain);
              console.log('Parsed HTML from Opencode:', html);
              data.content = editor.data.processor.toView(html);
            } catch (err) {
              console.error('Error handling clipboard inputTransformation:', err);
            }
          };

          clipboard.on('inputTransformation', clipboardHandler);
          editor.on('destroy', () => {
            clipboard.off('inputTransformation', clipboardHandler);
            editorRef.current = null;
          });

          // Make plain Enter behave like Shift+Enter (insert a <br/>) instead of creating
          // a new paragraph.
          try {
            editor.keystrokes.set('Enter', (keyEvtData, cancel) => {
              const domEvent = keyEvtData.domEvent;
              // Keep modifier combos intact (Ctrl/Cmd/Alt/Shift+Enter should remain usable)
              if (domEvent.ctrlKey || domEvent.metaKey || domEvent.altKey) return;
              if (domEvent.shiftKey) return; // let default Shift+Enter behavior remain
              // Prefer to use the editor's shiftEnter command (if present) which inserts a soft break <br/>
              if (editor.commands.get('shiftEnter')) {
                try { editor.execute('shiftEnter'); } catch (e) { /* ignore if command fails */ }
              }
              cancel();
            });
          } catch (err) {
            console.warn('Could not override Enter keystroke to insert <br/>:', err);
          }

          // Ensure typed input always uses the default font, regardless of the font
          // at the current position. We remove the `fontFamily` model attribute
          // from the selection right before typing so inserted text won't inherit
          // any font family defined on ancestor spans.
          const view = editor.editing.view;
          view.document.on('keydown', (evt, data) => {
            try {
              const domEvent = data.domEvent;
              // Ignore modifier combos (Ctrl/Cmd/Alt) and navigation keys.
              if (domEvent.ctrlKey || domEvent.metaKey || domEvent.altKey) return;
              const key = domEvent.key;
              // If this is basic typing (single printable character) or Enter/Tab,
              // remove the fontFamily attribute so the typed character uses default.
              if ((key && key.length === 1) || key === 'Enter' || key === 'Tab') {
                editor.model.change(writer => writer.removeSelectionAttribute('fontFamily'));
              }
            } catch (err) {
              // Do not break typing; log for debugging.
              console.error('Error enforcing default font on typing:', err);
            }
          }, { priority: 'high' });
        }}
        config={ {
          licenseKey: 'GPL',
          plugins: [ Essentials, Paragraph, FontFamily ],
          fontFamily: {
            supportAllValues: true,
          },
          initialData: '<p style="font-family: Arial, Helvetica, sans-serif;">Hello from CKEditor 5 in React!</p>',
        } }
      />

      <div style={{ marginTop: 20 }}>
        {selectedChars ? (
          <div>
            <h3>Selected characters</h3>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '4px' }}>Character</th>
                  <th style={{ border: '1px solid #ccc', padding: '4px' }}>Codepoint</th>
                  <th style={{ border: '1px solid #ccc', padding: '4px' }}>Name</th>
                </tr>
              </thead>
              <tbody>
                {selectedChars.map((charInfo, i) => {
                  return (
                    <tr key={i}>
                      <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontFamily: charInfo.fontFamily }}>
                        {charInfo.char}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{charInfo.codepoint}</td>
                      <td style={{ border: '1px solid #ccc', padding: '4px' }}>{charInfo.name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <h3>Available characters</h3>
            <form onSubmit={handleCharacterTableSubmit}>
              <select 
                value={domainPreset}
                onChange={handlePresetChange}
                style={{ marginRight: 16 }}
              >
                <option value="sitelenpona">Sitelen Pona</option>
                <option value="tengwar">Tengwar</option>
                <option value="liparxe">Liparxe</option>
                <option value="custom">Custom domain...</option>
              </select>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="example.com"
                style={{ marginRight: 8 }}
                disabled={domainPreset !== 'custom'}
              />
            </form>

            {loading && <div style={{ marginTop: 8 }}>Loading...</div>}
            {error && <div style={{ marginTop: 8, color: 'red' }}>{error}</div>}

            {tableDomainData && (
              <div style={{ marginTop: 12 }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ccc', padding: '4px' }}>Character</th>
                      <th style={{ border: '1px solid #ccc', padding: '4px' }}>Codepoint</th>
                      <th style={{ border: '1px solid #ccc', padding: '4px' }}>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableDomainData.characters.length === 0 && (
                      <tr><td colSpan={3} style={{ padding: 8 }}>No characters found.</td></tr>
                    )}
                    {tableDomainData.characters.map((ch, i) => {
                      const domainFontFamily = tableDomain.replace(/\./g, ' ');
                      const cpHex = ch.codepoint;
                      const cp = parseInt(cpHex, 16);
                      const rendered = Number.isNaN(cp) ? '' : String.fromCodePoint(cp);
                      const fullCodepoint = `${tableDomain}/#${cpHex}`;
                      const fullName = tableDomainData.name.toUpperCase() + ' ' + ch.name;
                      return (
                        <tr key={i}>
                          <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontFamily: domainFontFamily }}>
                            {rendered}
                          </td>
                          <td style={{ border: '1px solid #ccc', padding: '4px' }}>{fullCodepoint}</td>
                          <td style={{ border: '1px solid #ccc', padding: '4px' }}>{fullName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
