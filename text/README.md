# scatcode-text

Library for rendering and handling Scatcode encoded text with React.

## Installation

```bash
npm install scatcode-text
```

## Usage

```jsx
import { ScatcodeText } from 'scatcode-text';

function MyComponent() {
  return (
    <ScatcodeText>
      Your scatcode-encoded text here
    </ScatcodeText>
  );
}
```

## API

- `ScatcodeText` - React component for rendering scatcode text
- `parseScatcodeRuns(text)` - Parse scatcode text into runs
- `loadData(domain)` - Load domain data
- `validateDomain(domain)` - Validate domain format
- `toCodePoints(str)` - Convert string to codepoints array
- `toJsonStringLiteral(str)` - Convert string to JSON literal
- `getScatcodeTextFromRanges(ranges)` - Extract scatcode text from selection ranges
- `parseScatcodeToHtml(text)` - Convert scatcode text to HTML
