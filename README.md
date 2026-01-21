# Scatcode

Scatcode is an experimental character encoding that can support any characters.
It supports non-Unicode characters like Sitelen Pona, Tengwar and Liparxe.
You can even add your own characters!

See [scatcode.gimite.net](https://scatcode.gimite.net/) for an overview and demo.

## Table of Contents

- [Encoding Format](#encoding-format)
- [Domain Configuration (`/scatcode.json`)](#domain-configuration-scatcodejson)
- [Libraries](#libraries)
  - [scatcode-core](#scatcode-core)
  - [scatcode-text](#scatcode-text)
  - [scatcode-text-area](#scatcode-text-area)
- [License](#license)

## Encoding Format

Scatcode is an extension of Unicode. It abuses a deprecated Unicode feature called
[language tag](https://en.wikipedia.org/wiki/Tags_(Unicode_block)), but puts a domain name instead
of a language code in the tag. The encoding format is:

```
U+E0001 [domain-encoded] U+E007F [text]
```

### Components

1. **Domain Tag Start**: `U+E0001` signals the beginning of a domain specification
2. **Domain Characters**: Each ASCII character in the domain name is encoded by adding `0xE0000` to its codepoint
   - For example: `example.com` becomes `U+E0065 U+E0078 U+E0061 U+E006D U+E0070 U+E006C U+E0065 U+E002E U+E0063 U+E006F U+E006D`
   - An empty domain name indicates the default (Unicode) domain
3. **Domain Tag End**: `U+E007F` signals the end of domain specification and the start of the actual text
4. **Text Content**: The actual text using codepoints defined in the domain
   - This often uses codepoints in Unicode Private Use Area, but can be any Unicode codepoints

### Example Encoding

The text "toki pona" written in Sitelen Pona is encoded into:

1. `U+E0001`: LANGUAGE TAG
2. "sitelenpona.gimite.net" encoded using tag characters (by adding `0xE0000`)
3. `U+E007F`: CANCEL TAG
4. `U+F196C`: Unicode Private Use Area codepoint for SITELEN PONA IDEOGRAPH TOKI
5. `U+F1954`: Unicode Private Use Area codepoint for SITELEN PONA IDEOGRAPH PONA

You can also select text in the text area in [scatcode.gimite.net](https://scatcode.gimite.net/)
and look at the table below to see how it is encoded.

## Domain Configuration (`/scatcode.json`)

A "domain" of a character set in Scatcode is defined in `https://`*domain*`/scatcode.json`.

See https://sitelenpona.gimite.net/scatcode.json as an example.

Most importantly, `/scatcode.json` provides a web font in its `fallbackFont` property. It can be used
to render characters in the domain.

`/scatcode.json` also provides a list of characters in the domain in its `characters` property.

`/scatcode.json` must have a CORS policy to allow access from any domains.

## Libraries

### scatcode-core

Core library for Scatcode text encoding and parsing. It also provides a web component for displaying
Scatcode text.

**Usage:**

This embeds "toki pona" written in Sitelen Pona in HTML:

```html
<script type="module" src="https://scatcode.gimite.net/scatcode-core-0.1.0.es.js"></script>
<scatcode-text>&#xE0001;&#xE0073;&#xE0069;&#xE0074;&#xE0065;&#xE006C;&#xE0065;&#xE006E;&#xE0070;&#xE006F;&#xE006E;&#xE0061;&#xE002E;&#xE0067;&#xE0069;&#xE006D;&#xE0069;&#xE0074;&#xE0065;&#xE002E;&#xE006E;&#xE0065;&#xE0074;&#xE007F;&#xF196C;&#xF1954;&#xE0001;&#xE007F;</scatcode-text>
```

### scatcode-text

React component for rendering Scatcode-encoded text.

**Installation:**
```bash
npm install scatcode-text
```

**Usage:**

This renders "toki pona" written in Sitelen Pona:

```jsx
import { ScatcodeText } from 'scatcode-text';

function App() {
  return (
    <ScatcodeText>
      &#xE0001;&#xE0073;&#xE0069;&#xE0074;&#xE0065;&#xE006C;&#xE0065;&#xE006E;&#xE0070;&#xE006F;&#xE006E;&#xE0061;&#xE002E;&#xE0067;&#xE0069;&#xE006D;&#xE0069;&#xE0074;&#xE0065;&#xE002E;&#xE006E;&#xE0065;&#xE0074;&#xE007F;&#xF196C;&#xF1954;&#xE0001;&#xE007F;
    </ScatcodeText>
  );
}
```

### scatcode-text-area

React component providing an editable text area for Scatcode-encoded text.

**Installation:**
```bash
npm install scatcode-text-area
```

**Usage:**

This shows an editable text area that supports Scatcode-encoded text:

```jsx
import { ScatcodeTextArea } from 'scatcode-text-area';

function Editor() {
  const [content, setContent] = React.useState('');
  return (
    <ScatcodeTextArea
      value={content}
      onChange={(value) => setContent(value)}
    />
  );
}
```

## License

* Spec of the encoding format and domain configuration: Public domain
* `scatcode-core` and `scatcode-text` libraries: MIT
* `scatcode-text-area` library and `scatcode-demo` app: GPL
