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

function App() {
  const [clipboardHTML, setClipboardHTML] = useState('');
  const [clipboardText, setClipboardText] = useState('');

  const handlePasteClick = async () => {
    try {
      // Prefer the Async Clipboard API read() which can return rich types like text/html
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types && item.types.includes('text/html')) {
            const blob = await item.getType('text/html');
            const html = await blob.text();
            setClipboardHTML(html);
            setClipboardText('');
            console.log('Clipboard HTML:', html);
            return;
          }
        }
      }

      // Fallback to plain text if no html available or read() not supported
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
      setClipboardHTML('');
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
          let html = '';
          let text = '';

          const cb = e.clipboardData || (window.clipboardData && window.clipboardData.getData ? window.clipboardData : null);
          if (cb && typeof cb.getData === 'function') {
            html = cb.getData('text/html') || '';
            text = cb.getData('text/plain') || '';
          }

          // Fallback to selection-derived values when clipboardData is not populated.
          if ((!html || html === '') && window.getSelection) {
            console.log('Falling back to selection for HTML');
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              const container = document.createElement('div');
              for (let i = 0; i < sel.rangeCount; i++) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
              }
              html = container.innerHTML || '';
            }
          }
          if ((!text || text === '') && window.getSelection) {
            text = window.getSelection().toString() || '';
          }

          setClipboardHTML(html);
          setClipboardText(text);
          console.log('Captured copy event — html length:', (html || '').length, 'text length:', (text || '').length);
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
      <div>
        <strong>Clipboard (rendered):</strong>
        <div style={{border: '1px solid #ddd', padding: 8, marginTop: 6}}>
          {clipboardHTML ? (
            <div dangerouslySetInnerHTML={{ __html: clipboardHTML }} />
          ) : (
            <div style={{whiteSpace: 'pre-wrap'}}>{clipboardText}</div>
          )}
        </div>
      </div>
      <div style={{marginTop: 8}}>
        <strong>Clipboard (raw):</strong>
        <pre style={{whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 8}}>{clipboardHTML || clipboardText}</pre>
      </div>
      <CKEditor
        editor={ ClassicEditor }
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
