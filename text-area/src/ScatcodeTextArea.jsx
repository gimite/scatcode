import { useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Paragraph, FontFamily, ButtonView, Plugin } from 'ckeditor5';
import alignBottomSVG from './align-bottom.svg?raw';
import fileUploadSVG from './file-upload.svg?raw';
import { getHtmlFromScatcodeText, getScatcodeTextFromRanges, registerCopyHandler } from 'scatcode-core';

import 'ckeditor5/ckeditor5.css';

// Custom Save button plugin for CKEditor
class SaveButtonPlugin extends Plugin {
  init() {
    const editor = this.editor;
    
    editor.ui.componentFactory.add('saveButton', locale => {
      const view = new ButtonView(locale);
      view.set({
        icon: alignBottomSVG,
        label: 'Save',
        withText: false,
        tooltip: true
      });
      view.on('execute', () => {
        // Get the editor's editable element
        const editableElement = editor.ui.view.editable.element;
        if (!editableElement) {
          console.error('Could not find editable element');
          return;
        }
        
        // Create a selection range that covers the entire editor content
        const range = document.createRange();
        range.selectNodeContents(editableElement);
        
        // Convert to Scatcode text using the shared function
        const scatcodeText = getScatcodeTextFromRanges([range]);
        
        // Create a Blob with UTF-8 encoding
        const blob = new Blob([scatcodeText], { type: 'text/plain;charset=utf-8' });
        
        // Create a download link and trigger it
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scatcode-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Saved Scatcode text:', scatcodeText);
      });
      return view;
    });
  }
}

// Custom Load button plugin for CKEditor
class LoadButtonPlugin extends Plugin {
  init() {
    const editor = this.editor;
    
    editor.ui.componentFactory.add('loadButton', locale => {
      const view = new ButtonView(locale);
      view.set({
        icon: fileUploadSVG,
        label: 'Load',
        withText: false,
        tooltip: true
      });
      view.on('execute', () => {
        // Create a hidden file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,text/plain';
        
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          try {
            // Read the file as text with UTF-8 encoding
            const text = await file.text();
            console.log('Loaded Scatcode text:', text);
            
            // Parse the Scatcode text to HTML
            const html = getHtmlFromScatcodeText(text);
            console.log('Parsed HTML:', html);
            
            // Set the editor content
            editor.setData(html);
            
            console.log('Successfully loaded file into editor');
          } catch (err) {
            console.error('Error loading file:', err);
            alert('Error loading file: ' + err.message);
          }
        };
        
        // Trigger the file picker
        input.click();
      });
      return view;
    });
  }
}

function ScatcodeTextArea({ value, editableElementRef }) {
  const editorRef = useRef(null);

  useEffect(() => {
    registerCopyHandler();
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    const html = getHtmlFromScatcodeText(value);
    editorRef.current.setData(html);
  }, [value]);

  return (
    <CKEditor
      editor={ ClassicEditor }
      onReady={(editor) => {
        editorRef.current = editor;
        if (editableElementRef) {
          editableElementRef.current = editor.ui.view.editable.element;
        }
        
        // Use CKEditor's Clipboard plugin to intercept pasted text and transform Scatcode runs
        const clipboard = editor.plugins.get('ClipboardPipeline');
        if (!clipboard) {
          console.error('Clipboard plugin not found in CKEditor instance');
          return;
        }

        const clipboardHandler = (evt, data) => {
          try {
            console.log('CKEditor clipboard inputTransformation event', data);
            const dt = data.dataTransfer;
            if (!dt) return;
            editor.model.change(writer => writer.removeSelectionAttribute('fontFamily'));
            const plain = dt.getData('text/plain') ?? '';
            const html = getHtmlFromScatcodeText(plain);
            console.log('Parsed HTML from Scatcode:', html);
            data.content = editor.data.processor.toView(html);
          } catch (err) {
            console.error('Error handling clipboard inputTransformation:', err);
          }
        };

        clipboard.on('inputTransformation', clipboardHandler);
        editor.on('destroy', () => {
          clipboard.off('inputTransformation', clipboardHandler);
          editorRef.current = null;
        });

        // Make plain Enter behave like Shift+Enter (insert a <br/>) instead of creating
        // a new paragraph.
        try {
          editor.keystrokes.set('Enter', (keyEvtData, cancel) => {
            const domEvent = keyEvtData.domEvent;
            // Keep modifier combos intact (Ctrl/Cmd/Alt/Shift+Enter should remain usable)
            if (domEvent.ctrlKey || domEvent.metaKey || domEvent.altKey) return;
            if (domEvent.shiftKey) return; // let default Shift+Enter behavior remain
            // Prefer to use the editor's shiftEnter command (if present) which inserts a soft break <br/>
            if (editor.commands.get('shiftEnter')) {
              try { editor.execute('shiftEnter'); } catch (e) { /* ignore if command fails */ }
            }
            cancel();
          });
        } catch (err) {
          console.warn('Could not override Enter keystroke to insert <br/>:', err);
        }

        // Ensure typed input always uses the default font, regardless of the font
        // at the current position. We remove the `fontFamily` model attribute
        // from the selection right before typing so inserted text won't inherit
        // any font family defined on ancestor spans.
        const view = editor.editing.view;
        view.document.on('keydown', (evt, data) => {
          try {
            const domEvent = data.domEvent;
            // Ignore modifier combos (Ctrl/Cmd/Alt) and navigation keys.
            if (domEvent.ctrlKey || domEvent.metaKey || domEvent.altKey) return;
            const key = domEvent.key;
            // If this is basic typing (single printable character) or Enter/Tab,
            // remove the fontFamily attribute so the typed character uses default.
            if ((key && key.length === 1) || key === 'Enter' || key === 'Tab') {
              editor.model.change(writer => writer.removeSelectionAttribute('fontFamily'));
            }
          } catch (err) {
            // Do not break typing; log for debugging.
            console.error('Error enforcing default font on typing:', err);
          }
        }, { priority: 'high' });

        let html = getHtmlFromScatcodeText(value);
        editor.setData(html);
      }}
      config={ {
        licenseKey: 'GPL',
        plugins: [ Essentials, Paragraph, FontFamily, SaveButtonPlugin, LoadButtonPlugin ],
        fontFamily: {
          supportAllValues: true,
        },
        toolbar: {
          items: [
            'loadButton',
            'saveButton',
          ]
        },
      } }
    />
  );
}

export default ScatcodeTextArea;
