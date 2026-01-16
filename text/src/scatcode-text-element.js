import { parseScatcodeRuns, handleCopy } from './Scatcode.js';

// Register global copy handler once
let copyHandlerRegistered = false;
function registerCopyHandler() {
  if (!copyHandlerRegistered) {
    document.addEventListener('copy', handleCopy);
    copyHandlerRegistered = true;
  }
}

// Define the web component
class ScatcodeTextElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Register the global copy handler
    registerCopyHandler();
    
    // Get text content from the element
    const text = this.textContent || '';
    
    // Parse the scatcode text
    const runs = parseScatcodeRuns(text);
    
    // Clear shadow root
    this.shadowRoot.innerHTML = '';
    
    // Create spans for each run
    runs.forEach(run => {
      const span = document.createElement('span');
      span.textContent = run.text;
      
      if (run.domain && run.domain !== '') {
        const fontFamily = run.domain.replace(/\./g, ' ');
        span.style.fontFamily = fontFamily;
      }
      
      this.shadowRoot.appendChild(span);
    });
  }
  
  // Observe changes to text content
  static get observedAttributes() {
    return [];
  }
  
  // Provide a method to update the text
  setText(text) {
    this.textContent = text;
    this.connectedCallback();
  }
}

// Register the custom element
customElements.define('scatcode-text', ScatcodeTextElement);

export { ScatcodeTextElement };
