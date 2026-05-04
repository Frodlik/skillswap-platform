import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite is the dev server + build tool. In dev mode it serves files
// straight from disk with hot-reload. In `npm run build` it bundles
// everything into ./dist for production.
//
// Why the proxy:
//   The frontend runs on http://localhost:5173 and the gateway on :8080.
//   Different ports = different origins from the browser's perspective,
//   which would trigger CORS errors on every request. Vite's proxy
//   makes the dev server forward "/api/*" to the gateway internally,
//   so the browser sees a same-origin request and never asks about CORS.
//   In production both the SPA and the API will sit behind the same
//   gateway, so this is a dev-only concern.

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
