# Scatcode Text Web Component

A custom HTML element `<scatcode-text>` that renders text with embedded domain-specific fonts using the Scatcode encoding format.

## Features

- **Web Component**: Works with any framework or vanilla JavaScript
- **Shadow DOM**: Encapsulated styling
- **Automatic Font Loading**: Loads domain-specific fonts automatically from domain URLs
- **Copy Support**: Preserves Scatcode encoding when copying text
- **No Dependencies Required**: Works standalone in the browser

## Installation

```bash
npm install @scatcode/text
```

## Usage

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="./scatcode-text-element.js"></script>
</head>
<body>
  <scatcode-text>Your text here</scatcode-text>
</body>
</html>
```

### JavaScript

```javascript
// Import the web component
import '@scatcode/text/scatcode-text-element.js';

// Create element programmatically
const element = document.createElement('scatcode-text');
element.textContent = 'Your text here';
document.body.appendChild(element);

// Update existing element
const el = document.querySelector('scatcode-text');
el.setText('New text');
```

### With Build Tools

```javascript
import { ScatcodeTextElement } from '@scatcode/text';

// The custom element is automatically registered
// Just use it in your HTML
```

## How It Works

The `<scatcode-text>` element:

1. Parses text content containing Scatcode domain markers
2. Creates styled spans with appropriate font families
3. Automatically loads font definitions from domain URLs
4. Preserves encoding when text is copied to clipboard

### Scatcode Format

Scatcode uses special Unicode characters (Tag Characters U+E0000-U+E007F) to encode domain information:

- `U+E0001`: Start domain marker
- `U+E0020-U+E007E`: Domain name characters (offset by 0xE0000)
- `U+E007F`: End domain marker

Example:
```
󠀁󠁳󠁩󠁴󠁥󠁬󠁥󠁮󠀭󠁰󠁯󠁮󠁡󠀮󠁳󠁣󠁡󠁴󠁣󠁯󠁤󠁥󠀮󠁧󠁩󠁭󠁩󠁴󠁥󠀮󠁮󠁥󠁴󠀿toki pona
```

This renders "toki pona" using the font from `sitelen-pona.scatcode.gimite.net`.

## API

### Element

#### `<scatcode-text>`

Custom element that renders Scatcode-encoded text.

**Attributes**: None (uses text content)

**Methods**:
- `setText(text: string)`: Update the text content and re-render

### Exports

The module also exports utility functions:

- `parseScatcodeRuns(text)`: Parse text into domain/text runs
- `parseScatcodeToHtml(text)`: Convert Scatcode text to HTML
- `loadData(domain)`: Load font data for a domain
- `validateDomain(domain)`: Validate domain format
- `getScatcodeTextFromRanges(ranges)`: Extract Scatcode from selection
- `toCodePoints(str)`: Convert string to codepoint array
- `toJsonStringLiteral(str)`: Convert to JSON string with Unicode escapes

## React Component

This package also includes a React component:

```jsx
import { ScatcodeText } from '@scatcode/text';

function App() {
  return (
    <ScatcodeText>
      Your scatcode-encoded text here
    </ScatcodeText>
  );
}
```

## Browser Support

Works in all modern browsers that support:
- Custom Elements v1
- Shadow DOM v1
- ES6 Modules

## License

MIT
