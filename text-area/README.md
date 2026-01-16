# scatcode-text-area

React component for editing Scatcode encoded text with CKEditor.

## Usage

```jsx
import ScatcodeTextArea from 'scatcode-text-area';

function MyComponent() {
  const editableElementRef = useRef(null);
  const [value, setValue] = useState('');

  return (
    <ScatcodeTextArea 
      value={value} 
      editableElementRef={editableElementRef} 
    />
  );
}
```

## Props

- `value`: Initial Scatcode text value
- `editableElementRef`: React ref to access the CKEditor editable element
