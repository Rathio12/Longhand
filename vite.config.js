import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const monacoRoot = fileURLToPath(new URL('./node_modules/monaco-editor/esm/vs/', import.meta.url)).replaceAll('\\', '/');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: { port: 5173, strictPort: true },
  build: { outDir: 'dist', chunkSizeWarningLimit: 6000 },
  resolve: {
    // Monaco's package "exports" hide its internal paths, which this app and
    // the Vim and Emacs keymaps import directly.
    alias: [
      { find: /^monaco-editor\/esm\/vs\/(.+\.css)$/, replacement: `${monacoRoot}$1` },
      { find: /^monaco-editor\/esm\/vs\/(.+?)(?:\.js)?$/, replacement: `${monacoRoot}$1.js` },
    ],
  },
});
