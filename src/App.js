import { useEffect, Children, useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Paragraph, FontFamily, ButtonView, Plugin } from 'ckeditor5';
import { unicodeName } from 'unicode-name';

import 'ckeditor5/ckeditor5.css';
import './App.css';

const toCodePoints = (str) => Array.from(str, ch => ch.codePointAt(0));

// Custom Save button plugin for CKEditor
class SaveButtonPlugin extends Plugin {
  init() {
    const editor = this.editor;
    
    editor.ui.componentFactory.add('saveButton', locale => {
      const view = new ButtonView(locale);
      view.set({
        label: 'Save',
        withText: true,
        tooltip: true
      });
      view.on('execute', () => {
        // Get the HTML content from the editor
        const html = editor.getData();
        
        // Parse the HTML to extract font runs
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Extract text with font family information
        const runs = [];
        const extractRuns = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (text) {
              const fontFamily = getInlineFontFamily(node) || '';
              runs.push({ text, fontFamily });
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (const child of node.childNodes) {
              extractRuns(child);
            }
          }
        };
        extractRuns(tempDiv);
        
        // Convert to Scatcode text
        const scatcodeText = getScatcodeTextFromFontRuns(runs);
        
        // Create a Blob with UTF-8 encoding
        const blob = new Blob([scatcodeText], { type: 'text/plain;charset=utf-8' });
        
        // Create a download link and trigger it
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scatcode-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Saved Scatcode text:', scatcodeText);
      });
      return view;
    });
  }
}

// Custom Load button plugin for CKEditor
class LoadButtonPlugin extends Plugin {
  init() {
    const editor = this.editor;
    
    editor.ui.componentFactory.add('loadButton', locale => {
      const view = new ButtonView(locale);
      view.set({
        label: 'Load',
        withText: true,
        tooltip: true
      });
      view.on('execute', () => {
        // Create a hidden file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,text/plain';
        
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          try {
            // Read the file as text with UTF-8 encoding
            const text = await file.text();
            console.log('Loaded Scatcode text:', text);
            
            // Parse the Scatcode text to HTML
            const html = parseScatcodeToHtml(text);
            console.log('Parsed HTML:', html);
            
            // Set the editor content
            editor.setData(html);
            
            console.log('Successfully loaded file into editor');
          } catch (err) {
            console.error('Error loading file:', err);
            alert('Error loading file: ' + err.message);
          }
        };
        
        // Trigger the file picker
        input.click();
      });
      return view;
    });
  }
}

function getScatcodeDomainTagHtml(domain) {
  return '&#xe0001;' +
    Array.from(
      domain,
      ch => "&#x" + (ch.codePointAt(0) + 0xe0000).toString(16) + ";"
    ).join("") +
    '&#xe007f;'
}

// console.log(getScatcodeDomainTagHtml('liparxe.gimite.net'));

const loadedDomains = new Set();
const loadingPromises = new Map();
const domainData = {};

async function loadData(domain) {
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
      
      loadedDomains.add(domain);
    } finally {
      loadingPromises.delete(domain);
    }
  })();
  
  loadingPromises.set(domain, loadPromise);
  return loadPromise;
}

function ScatcodeText({ children }) {
  const childArray = Children.toArray(children);
  for (const c of childArray) {
    if (typeof c !== 'string' && typeof c !== 'number') {
      throw new Error('ScatcodeText: children must be plain text (string or number)');
    }
  }
  const text = childArray.length === 0 ? '' : childArray.map(c => String(c)).join('');

  // Use the shared parser to obtain runs of {domain, text}
  const runs = parseScatcodeRuns(text);
  const domains = new Set();
  const elements = runs.map((run, index) => {
    if (run.domain && run.domain !== '') domains.add(run.domain);
    const fontFamily = run.domain.replace(/\./g, ' ');
    return <span key={index} style={{fontFamily}}>{run.text}</span>;
  });

  return <>{elements}</>;
}

// Parse scatcode encoded text into an array of runs [{domain, text}].
// `domain` is '' for the default domain, otherwise contains the domain string.
function parseScatcodeRuns(text) {
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
        loadData(domain).catch(console.error);
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
  return result;
}

function getScatcodeTextFromSelection(selection) {
  const runs = getSelectionTextFontRuns(selection);
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
function parseScatcodeToHtml(text) {
  const runs = parseScatcodeRuns(text);
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

function CharacterTable({ characters }) {
  return (
    <table className="character-table">
      <thead>
        <tr>
          <th>Character</th>
          <th>Codepoint</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {characters.length === 0 && (
          <tr><td colSpan={3} className="no-data-message">No characters found.</td></tr>
        )}
        {characters.map((charInfo, i) => (
          <tr key={i}>
            <td className="character" style={{ fontFamily: charInfo.fontFamily }}>
              {charInfo.char}
            </td>
            <td>{charInfo.codepoint}</td>
            <td>{charInfo.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  const editorRef = useRef(null);
  const [domainPreset, setDomainPreset] = useState('sitelenpona');
  const [domainInput, setDomainInput] = useState('sitelenpona.gimite.net');
  const [tableDomain, setTableDomain] = useState('');
  const [tableDomainData, setTableDomainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChars, setSelectedChars] = useState(null);
  const [selectedScatcodeText, setSelectedScatcodeText] = useState('');

  const oldEditorContentScatcodeText =
    'I love ' +
    '\u{e0001}\u{e0073}\u{e0069}\u{e0074}\u{e0065}\u{e006c}\u{e0065}\u{e006e}\u{e0070}\u{e006f}' +
    '\u{e006e}\u{e0061}\u{e002e}\u{e0067}\u{e0069}\u{e006d}\u{e0069}\u{e0074}\u{e0065}\u{e002e}' +
    '\u{e006e}\u{e0065}\u{e0074}\u{e007f}\u{F196C}\u{F1954}\u{e0001}\u{e007f}, ' +
    '\u{e0001}\u{e0074}\u{e0065}\u{e006e}\u{e0067}\u{e0077}\u{e0061}\u{e0072}\u{e002e}\u{e0067}' +
    '\u{e0069}\u{e006d}\u{e0069}\u{e0074}\u{e0065}\u{e002e}\u{e006e}\u{e0065}\u{e0074}\u{e007f}' +
    '\u{E000}\u{E046}\u{E007}\u{E040}\u{E014}\u{e0001}\u{e007f} and ' +
    '\u{e0001}\u{e006c}\u{e0069}\u{e0070}\u{e0061}\u{e0072}\u{e0078}\u{e0065}\u{e002e}\u{e0067}' +
    '\u{e0069}\u{e006d}\u{e0069}\u{e0074}\u{e0065}\u{e002e}\u{e006e}\u{e0065}\u{e0074}\u{e007f}' +
    'lineparine\u{e0001}\u{e007f}!\nHello.';

  const editorContentScatcodeText = 
    'Scatcode is an experimental character encoding that can support any characters. ' +
    'It supports non-Unicode characters like ' +
    '\u{e0001}\u{e0073}\u{e0069}\u{e0074}\u{e0065}\u{e006c}\u{e0065}\u{e006e}\u{e0070}\u{e006f}' +
    '\u{e006e}\u{e0061}\u{e002e}\u{e0067}\u{e0069}\u{e006d}\u{e0069}\u{e0074}\u{e0065}\u{e002e}' +
    '\u{e006e}\u{e0065}\u{e0074}\u{e007f}\u{F1960}\u{F1954}\u{e0001}\u{e007f} (Sitelen Pona), ' +
    '\u{e0001}\u{e0074}\u{e0065}\u{e006e}\u{e0067}\u{e0077}\u{e0061}\u{e0072}\u{e002e}\u{e0067}' +
    '\u{e0069}\u{e006d}\u{e0069}\u{e0074}\u{e0065}\u{e002e}\u{e006e}\u{e0065}\u{e0074}\u{e007f}' +
    '\u{E000}\u{E046}\u{E007}\u{E040}\u{E014}\u{e0001}\u{e007f} (Tengwar) and ' +
    '\u{e0001}\u{e006c}\u{e0069}\u{e0070}\u{e0061}\u{e0072}\u{e0078}\u{e0065}\u{e002e}\u{e0067}' +
    '\u{e0069}\u{e006d}\u{e0069}\u{e0074}\u{e0065}\u{e002e}\u{e006e}\u{e0065}\u{e0074}\u{e007f}' +
    'liparxe\u{e0001}\u{e007f} (Liparxe). ' +
    'And even you can add your own characters!\n\n' +
    'You can try Scatcode in this editor. Try:\n' +
    '• Copy&paste characters from the character table below.\n' +
    '• Copy text over to your favirite text editor (the text would look garbled there) and paste it' +
    ' back here to see the characters are recovered.\n' +
    '• Select text here like ' +
    '\u{e0001}\u{e0073}\u{e0069}\u{e0074}\u{e0065}\u{e006c}\u{e0065}\u{e006e}\u{e0070}\u{e006f}' +
    '\u{e006e}\u{e0061}\u{e002e}\u{e0067}\u{e0069}\u{e006d}\u{e0069}\u{e0074}\u{e0065}\u{e002e}' +
    '\u{e006e}\u{e0065}\u{e0074}\u{e007f}\u{F1942}\u{F1941}\u{e0001}\u{e007f} ' +
    'to see the character details and how they are encoded.\n\n' +
    'How does it work?\n\n' +
    '• In Scatcode, each character belongs to a "domain" identified by a domain name ' +
    '(e.g., sitelenpona.gimite.net for Sitelen Pona).\n' +
    '• It uses special Unicode tag characters to mark which domain each text segment belongs to.';

  const domainPresets = {
    'sitelenpona': 'sitelenpona.gimite.net',
    'tengwar': 'tengwar.gimite.net',
    'liparxe': 'liparxe.gimite.net',
  };

  const handleCharacterTableSubmit = async (e) => {
    e.preventDefault();
    const domain = domainInput.trim();
    if (!domain) return;
    await loadDomainData(domain);
  }

  const loadDomainData = async (domain) => {
    console.log(`Loading domain table data for: ${domain}`);
    setLoading(true);
    setError(null);
    try {
      await loadData(domain);
      console.log(`Loaded domain table data for: ${domain}`);
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

  // Load sitelenpona data on mount
  useEffect(() => {
    loadDomainData('sitelenpona.gimite.net');
  }, []);

  // Global copy handler: capture copied HTML and plain text anywhere in the window.
  useEffect(() => {
    const handleCopy = (e) => {
      try {
        const cb = e.clipboardData || (window.clipboardData && window.clipboardData.getData ? window.clipboardData : null);
        const scatcodeText = getScatcodeTextFromSelection();
        console.log('Scatcode text:', scatcodeText);
        console.log('Scatcode text codepoints:', toCodePoints(scatcodeText));
        cb.setData('text/plain', scatcodeText);
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
        
        // Check if the selection is inside CKEditor
        if (!editorRef.current) {
          setSelectedChars(null);
          return;
        }
        const editorElement = editorRef.current.ui.view.editable.element;
        if (!editorElement) {
          setSelectedChars(null);
          return;
        }
        
        // Check if any part of the selection is within the editor
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (!range || !editorElement.contains(range.commonAncestorContainer)) {
          return;
        }

        if (!selectedText || selectedText.trim() === '') {
          setSelectedChars(null);
          return;
        }

        const scatcodeText = getScatcodeTextFromSelection(selection);
        const scatcodeRuns = parseScatcodeRuns(scatcodeText);
        
        // Build character list with domain and codepoint info
        const chars = [];
        for (const run of scatcodeRuns) {
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
        setSelectedScatcodeText(scatcodeText);
      } catch (err) {
        console.error('Error in selectionchange handler', err);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  return (
    <div className="app-root">
      <div className="app-container">
        <header className="app-header">
          <h1>Scatcode</h1>
        </header>
        <div className="editor-container">
          <CKEditor
            editor={ ClassicEditor }
            onReady={(editor) => {
              editorRef.current = editor;
              
              // Use CKEditor's Clipboard plugin to intercept pasted text and transform Scatcode runs
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
                  const html = parseScatcodeToHtml(plain);
                  console.log('Parsed HTML from Scatcode:', html);
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
              plugins: [ Essentials, Paragraph, FontFamily, SaveButtonPlugin, LoadButtonPlugin ],
              fontFamily: {
                supportAllValues: true,
              },
              toolbar: {
                items: [
                  'loadButton',
                  'saveButton',
                ]
              },
              initialData: parseScatcodeToHtml(editorContentScatcodeText),
            } }
          />
        </div>

        <div className="content-section">
          {selectedChars ? (
            <div>
              <h3>Selected characters</h3>
              <CharacterTable characters={selectedChars} />

              <h3>How they are encoded</h3>
              <table className="character-table">
                <thead>
                  <tr>
                    <th>Codepoint</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const codepoints = toCodePoints(selectedScatcodeText);
                    return codepoints.map((cp, i) => {
                      const char = String.fromCodePoint(cp);
                      const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
                      let name = unicodeName(char) || '';
                      return (
                        <tr key={i}>
                          <td>{hex}</td>
                          <td>{name}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <h3>Available characters</h3>
              <form onSubmit={handleCharacterTableSubmit} className="domain-selector-form">
                <select 
                  value={domainPreset}
                  onChange={handlePresetChange}
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
                  disabled={domainPreset !== 'custom'}
                />
              </form>

              {loading && <div className="status-message status-loading">Loading...</div>}
              {error && <div className="status-message status-error">{error}</div>}

              {tableDomainData && (
                <div>
                  <CharacterTable 
                    characters={tableDomainData.characters.map((ch) => {
                      const domainFontFamily = tableDomain.replace(/\./g, ' ');
                      const cpHex = ch.codepoint;
                      const cp = parseInt(cpHex, 16);
                      const rendered = Number.isNaN(cp) ? '' : String.fromCodePoint(cp);
                      const fullCodepoint = `${tableDomain}/#${cpHex}`;
                      const fullName = tableDomainData.name.toUpperCase() + ' ' + ch.name;
                      return {
                        char: rendered,
                        codepoint: fullCodepoint,
                        name: fullName,
                        fontFamily: domainFontFamily,
                      };
                    })}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
