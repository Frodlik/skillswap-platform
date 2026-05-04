import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Entry point. Vite imports this file from index.html via <script type="module">.
//
// React 18 mounts using `createRoot(container).render(element)`. The element
// here is <App />, which is the top of the component tree. Everything else
// (routing, theme, auth, screens) lives inside App.
createRoot(document.getElementById('root')).render(<App />);
