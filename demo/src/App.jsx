import { useEffect, useRef, useState } from 'react';
import { unicodeName } from 'unicode-name';
import Messages from './Messages';
import ScatcodeTextArea from './ScatcodeTextArea';
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

import './App.css';

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
          <ScatcodeTextArea editorRef={editorRef} messages={messages} />
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
