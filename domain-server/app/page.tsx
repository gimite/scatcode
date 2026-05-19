'use client';

import { useEffect, useState } from 'react';

interface HostDomain {
  id: string;
  name: string;
  tag: string;
  description: string;
}

export default function Home() {
  const [origin, setOrigin] = useState('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      // Strip any existing subdomain if navigated to the home page from a subdomain
      const parts = host.split('.');
      const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
      let baseHost = host;
      
      if (isLocalhost) {
        if (parts.length > 1 && parts[parts.length - 1].startsWith('localhost')) {
          baseHost = parts.slice(1).join('.');
        }
      } else {
        if (parts.length > 2) {
          baseHost = parts.slice(1).join('.');
        }
      }
      
      setOrigin(`${window.location.protocol}//${baseHost}`);
    }
  }, []);

  const domains: HostDomain[] = [
    {
      id: 'sitelenpona',
      name: 'Sitelen Pona',
      tag: 'Conlang Hieroglyphs',
      description: 'A hieroglyphic script designed for Toki Pona. This domain hosts the scatcode.json configuration and font assets for rendering toki pona characters.',
    },
    {
      id: 'daedric',
      name: 'Daedric',
      tag: 'Gaming / Fantasy',
      description: 'The ancient script from The Elder Scrolls series. Perfect for translating or encoding Daedric character paths dynamically.',
    },
    {
      id: 'tengwar',
      name: 'Tengwar',
      tag: 'Fantasy / Elvish',
      description: 'The script invented by J.R.R. Tolkien to write Elvish languages. Fully configurable with specific fallback web fonts.',
    },
    {
      id: 'liparxe',
      name: 'Liparxe',
      tag: 'Phonetic Conlang',
      description: 'A custom phonetic conlang script mapping unique pronunciation codepoints and font definitions.',
    },
    {
      id: 'oldhylian',
      name: 'Old Hylian',
      tag: 'Gaming / Ancient',
      description: 'The iconic ancient script from The Legend of Zelda series (such as Ocarina of Time and Wind Waker).',
    },
    {
      id: 'protosinaitic',
      name: 'Proto-Sinaitic',
      tag: 'Ancient Script',
      description: 'An ancient Middle Bronze Age script. It is the oldest trace of alphabetic writing and serves as a classic historical test domain.',
    },
    {
      id: 'futuramaalien',
      name: 'Futurama Alien',
      tag: 'Sci-Fi / Alien',
      description: 'The first alien language and symbol cipher used in the animated science fiction series Futurama.',
    },
    {
      id: 'linearelamite',
      name: 'Linear Elamite',
      tag: 'Ancient Script',
      description: 'A Bronze Age writing system used in ancient Elam (modern-day Iran). Serves historic non-Unicode character encoding mappings.',
    },
  ];

  return (
    <div className="container">
      <header className="header">
        <span className="badge">Virtual Hosts Router</span>
        <h1 className="title">Scatcode Host Routing</h1>
        <p className="description">
          A Next.js server routing static files from <code>domain_data/dist/*</code> dynamically.
          Select a domain below to visit its local virtual host or inspect its configuration.
        </p>
      </header>

      <main className="grid">
        {domains.map((domain) => {
          const parts = origin.split('//');
          const protocol = parts[0] + '//';
          const domainHost = parts[1];
          const localUrl = `${protocol}${domain.id}.${domainHost}`;
          const jsonUrl = `${localUrl}/scatcode.json`;

          return (
            <div key={domain.id} className="card">
              <div className="card-header">
                <span className="card-tag">{domain.tag}</span>
                <h2 className="card-title">{domain.name}</h2>
                <p className="card-desc">{domain.description}</p>
              </div>
              <div className="card-actions">
                <a
                  href={localUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Visit Site
                </a>
                <a
                  href={jsonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Inspect scatcode.json
                </a>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="footer">
        <p>
          Powered by <a href="https://scatcode.gimite.net/" target="_blank" rel="noopener noreferrer">Scatcode Project</a>. All domains served from <code>domain_data/dist</code>.
        </p>
      </footer>
    </div>
  );
}
