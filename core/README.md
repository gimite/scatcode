# scatcode-core

Core library for Scatcode text encoding and parsing.

## Installation

```bash
npm install scatcode-core
```

## Features

- Parse Scatcode-encoded text into domain-specific runs
- Load and validate domain-specific font data
- Handle copy operations with Scatcode encoding
- Web component for displaying Scatcode text
- Convert text to/from HTML with Scatcode markers

## Usage

### Parsing Scatcode Text

```javascript
import { parseScatcodeRuns } from 'scatcode-core';

const text = "..."; // Your scatcode-encoded text
const runs = parseScatcodeRuns(text);
// Returns: [{ domain: 'example.com', text: '...' }, ...]
```

### Using the Web Component

```javascript
import 'scatcode-core';

// In your HTML:
// <scatcode-text>Your scatcode-encoded text here</scatcode-text>
```

### Loading Domain Data

```javascript
import { loadData, validateDomain } from 'scatcode-core';

const error = validateDomain('example.com');
if (!error) {
  await loadData('example.com');
}
```

## API

### Exports

- `toCodePoints(str)` - Convert string to array of codepoints
- `toJsonStringLiteral(str)` - Convert string to JSON literal with escaped Unicode
- `validateDomain(domain)` - Validate domain format
- `loadData(domain)` - Load scatcode.json from a domain
- `parseScatcodeRuns(text)` - Parse encoded text into runs
- `getScatcodeTextFromRanges(ranges)` - Extract scatcode text from selection ranges
- `parseScatcodeToHtml(text)` - Convert scatcode text to HTML
- `handleCopy(event)` - Copy event handler for preserving encoding
- `domainData` - Object containing loaded domain data
- `ScatcodeTextElement` - Web component class

## License

MIT
