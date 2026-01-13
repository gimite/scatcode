import { useEffect, useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import { ClassicEditor, Essentials, Paragraph, FontFamily, ButtonView, Plugin } from 'ckeditor5';
import { unicodeName } from 'unicode-name';
import Messages from './Messages';
import alignBottomSVG from './align-bottom.svg?raw';
import fileUploadSVG from './file-upload.svg?raw';
import ScatcodeText, {
  toCodePoints,
  toJsonStringLiteral,
  validateDomain,
  loadData,
  domainData,
  parseScatcodeRuns,
  parseScatcodeToHtml,
  getScatcodeTextFromRanges,
} from './ScatcodeText';

import 'ckeditor5/ckeditor5.css';
import './App.css';

// Custom Save button plugin for CKEditor
class SaveButtonPlugin extends Plugin {
  init() {
    const editor = this.editor;
    
    editor.ui.componentFactory.add('saveButton', locale => {
      const view = new ButtonView(locale);
      view.set({
        icon: alignBottomSVG,
        label: 'Save',
        withText: false,
        tooltip: true
      });
      view.on('execute', () => {
        // Get the editor's editable element
        const editableElement = editor.ui.view.editable.element;
        if (!editableElement) {
          console.error('Could not find editable element');
          return;
        }
        
        // Create a selection range that covers the entire editor content
        const range = document.createRange();
        range.selectNodeContents(editableElement);
        
        // Convert to Scatcode text using the shared function
        const scatcodeText = getScatcodeTextFromRanges([range]);
        
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
        icon: fileUploadSVG,
        label: 'Load',
        withText: false,
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

function CharacterTable({ characters, messages, onCopy }) {
  const handleCharacterClick = (event) => {
    try {
      // Select the text content of the clicked cell
      const cell = event.currentTarget;
      const range = document.createRange();
      range.selectNodeContents(cell);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Execute the copy command (this will trigger the global copy handler)
      document.execCommand('copy');
      
      // Show toast notification
      if (onCopy) onCopy();
      
      console.log('Selected and copied character from cell');
    } catch (err) {
      console.error('Failed to select and copy character:', err);
    }
  };

  return (
    <div className="character-table-wrapper">
      <table className="character-table">
        <thead>
          <tr>
            <th><ScatcodeText>{messages.character}</ScatcodeText></th>
            <th><ScatcodeText>{messages.name}</ScatcodeText></th>
            <th><ScatcodeText>{messages.codepoint}</ScatcodeText></th>
          </tr>
        </thead>
        <tbody>
          {characters.length === 0 && (
            <tr><td colSpan={3} className="no-data-message">No characters found.</td></tr>
          )}
          {characters.map((charInfo, i) => (
            <tr key={i}>
              <td 
                className="character" 
                style={{ fontFamily: charInfo.fontFamily, cursor: 'pointer' }}
                onClick={handleCharacterClick}
                title="Click to copy"
              >
                {charInfo.char}
              </td>
              <td>{charInfo.name}</td>
              <td>{charInfo.codepoint}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const editorRef = useRef(null);
  const [domainPreset, setDomainPreset] = useState('sitelenpona.gimite.net');
  const [domainInput, setDomainInput] = useState('sitelenpona.gimite.net');
  const [tableDomain, setTableDomain] = useState('');
  const [language, setLanguage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || 'en';
  });
  const [tableDomainData, setTableDomainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChars, setSelectedChars] = useState(null);
  const [selectedScatcodeText, setSelectedScatcodeText] = useState('');
  const [showToast, setShowToast] = useState(false);

  const messages = Messages[language];

  const handleCharacterTableSubmit = async (e) => {
    e.preventDefault();
    const domain = domainInput.trim();
    
    // Validate domain
    const validationError = validateDomain(domain);
    if (validationError) {
      setError(validationError);
      setTableDomain('');
      setTableDomainData(null);
      return;
    }
    
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
    
    if (preset !== '') {
      setDomainInput(preset);
      await loadDomainData(preset);
    }
  }

  // Load sitelenpona data on mount
  useEffect(() => {
    loadDomainData('sitelenpona.gimite.net');
  }, []);

  // Toast notification handler
  const handleCopyToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Global copy handler: capture copied HTML and plain text anywhere in the window.
  useEffect(() => {
    const handleCopy = (e) => {
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

        const ranges = [];
        for (let i = 0; i < selection.rangeCount; i++) {
          ranges.push(selection.getRangeAt(i));
        }
        const scatcodeText = getScatcodeTextFromRanges(ranges);
        const scatcodeRuns = parseScatcodeRuns(scatcodeText);
        
        // Build character list with domain and codepoint info
        const chars = [];
        for (const run of scatcodeRuns) {
          for (const ch of run.text) {
            const cp = ch.codePointAt(0);
            const cpHex = cp.toString(16).toUpperCase().padStart(4, '0');
            const codepointDisplay = run.domain
              ? `${run.domain}#${cpHex}`
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

  const handleLanguageSwitch = (lang) => {
    const newUrl = `/?lang=${lang}`;
    window.history.pushState({}, '', newUrl);
    setLanguage(lang);
  };

  useEffect(() => {
    if (!editorRef.current) return;
    const html = parseScatcodeToHtml(messages.overview);
    editorRef.current.setData(html);
  }, [language]);

  return (
    <div className="app-root">
      {showToast && <div className="toast">Copied!</div>}
      <div className="app-container">
        <div className="language-switcher">
          {language === 'tok' ? (
            <button onClick={() => handleLanguageSwitch('en')}>English</button>
          ) : (
            <button onClick={() => handleLanguageSwitch('tok')}>
              <ScatcodeText>
                &#xE0001;&#xE0073;&#xE0069;&#xE0074;&#xE0065;&#xE006C;&#xE0065;&#xE006E;&#xE0070;&#xE006F;&#xE006E;&#xE0061;&#xE002E;&#xE0067;&#xE0069;&#xE006D;&#xE0069;&#xE0074;&#xE0065;&#xE002E;&#xE006E;&#xE0065;&#xE0074;&#xE007F;&#xF196C;&#xF1996;&#xF1954;
              </ScatcodeText>
            </button>
          )}
        </div>
        <header className="app-header">
          <img src="/logo.png" alt="" />
          <div className="header-text">
            <h1><ScatcodeText>{messages.title}</ScatcodeText></h1>
            <div className="subtitle">
              <ScatcodeText>
                {messages.subtitle}
              </ScatcodeText>
            </div>
          </div>
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

              let html = parseScatcodeToHtml(messages.overview);
              editor.setData(html);
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
            } }
          />
        </div>

        <div className="content-section">
          {selectedChars ? (
            <div>
              <h3><ScatcodeText>{messages.selectedCharacters}</ScatcodeText></h3>
              <CharacterTable characters={selectedChars} messages={messages} onCopy={handleCopyToast} />

              <h3><ScatcodeText>{messages.howTheyAreEncoded}</ScatcodeText></h3>
              <div className="character-table-wrapper">
                <table className="character-table">
                  <thead>
                    <tr>
                      <th><ScatcodeText>{messages.codepoint}</ScatcodeText></th>
                      <th><ScatcodeText>{messages.name}</ScatcodeText></th>
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
            </div>
          ) : (
            <>
              <h3><ScatcodeText>{messages.availableCharacters}</ScatcodeText></h3>
              <form onSubmit={handleCharacterTableSubmit} className="domain-selector-form">
                <select 
                  value={domainPreset}
                  onChange={handlePresetChange}
                >
                  <option value="sitelenpona.gimite.net">Sitelen Pona</option>
                  <option value="tengwar.gimite.net">Tengwar</option>
                  <option value="liparxe.gimite.net">Liparxe</option>
                  <option value="oldhylian.gimite.net">Old Hylian</option>
                  <option value="futuramaalien.gimite.net">Futurama Alien Alphabet</option>
                  <option value="daedric.gimite.net">Daedric</option>
                  <option value="protosinaitic.gimite.net">Proto-Sinaitic</option>
                  <option value="linearelamite.gimite.net">Linear Elamite</option>
                  <option value="">Custom domain...</option>
                </select>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="example.com"
                  disabled={domainPreset !== ''}
                  size={1}
                />
              </form>

              {loading && <div className="status-message status-loading">Loading...</div>}
              {error && <div className="status-message status-error">{error}</div>}

              {tableDomainData && (
                <div>
                  <CharacterTable 
                    messages={messages}
                    onCopy={handleCopyToast}
                    characters={tableDomainData.characters.map((ch) => {
                      const domainFontFamily = tableDomain.replace(/\./g, ' ');
                      const cpHex = ch.codepoint;
                      const cp = parseInt(cpHex, 16);
                      const rendered = Number.isNaN(cp) ? '' : String.fromCodePoint(cp);
                      const fullCodepoint = `${tableDomain}#${cpHex}`;
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
