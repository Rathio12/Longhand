import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './monaco.js';
import './index.css';
import { StateProvider } from './state.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StateProvider>
    <App />
  </StateProvider>,
);
