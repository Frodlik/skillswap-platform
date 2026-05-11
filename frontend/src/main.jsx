import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// IMPORTANT: importing the i18n module here registers `i18next` with React
// before any component tries to call useTranslation(). Without this import
// the translation hooks throw "i18next is not initialised". The module
// itself runs side-effect initialisation — we don't need to use the export.
import './i18n/i18n.js';

// Entry point. Vite imports this file from index.html via <script type="module">.
//
// React 18 mounts using `createRoot(container).render(element)`. The element
// here is <App />, which is the top of the component tree. Everything else
// (routing, theme, auth, screens) lives inside App.
createRoot(document.getElementById('root')).render(<App />);
