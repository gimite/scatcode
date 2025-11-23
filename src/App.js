import './App.css';
import { useEffect } from 'react';

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
  console.log('textContent', style.textContent);
  document.head.appendChild(style);
}

function OpencodeText({ children }) {
  const text = children == null ? '' : String(children);
  let domain = '';
  let chunkText = '';
  const domains = new Set();
  const elements = [];
  const output = () => {
    if (domain !== '') {
      domains.add(domain);
    }
    const fontFamily = domain.replace(/\./g, ' ');
    elements.push(<span style={{fontFamily}}>{chunkText}</span>);
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
  return (
    <div>
      <div>
        <OpencodeText>
          foo&#xe0001;&#xe0073;&#xe0069;&#xe0074;&#xe0065;&#xe006c;&#xe0065;&#xe006e;&#xe0070;&#xe006f;&#xe006e;&#xe0061;&#xe002e;&#xe0067;&#xe0069;&#xe006d;&#xe0069;&#xe0074;&#xe0065;&#xe002e;&#xe006e;&#xe0065;&#xe0074;&#xe007f;&#xEE6C;&#xEE54;
          &#xe0001;&#xe007f;bar
          &#xe0001;&#xe0074;&#xe0065;&#xe006e;&#xe0067;&#xe0077;&#xe0061;&#xe0072;&#xe002e;&#xe0067;&#xe0069;&#xe006d;&#xe0069;&#xe0074;&#xe0065;&#xe002e;&#xe006e;&#xe0065;&#xe0074;abc
        </OpencodeText>
      </div>
    </div>
  );
}

export default App;
