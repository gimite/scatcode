import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'ScatcodeTextArea',
      fileName: (format) => `scatcode-text-area.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'scatcode-core',
        '@ckeditor/ckeditor5-react',
        'ckeditor5',
        'ckeditor5/ckeditor5.css'
      ],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'ReactJSXRuntime',
          'scatcode-core': 'ScatcodeCore',
          '@ckeditor/ckeditor5-react': 'CKEditor5React',
          'ckeditor5': 'CKEditor5'
        }
      }
    }
  }
});
