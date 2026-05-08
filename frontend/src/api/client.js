import axios from 'axios';

// Single shared HTTP client. Every API call in the app goes through this.
//
// `baseURL: '/api/v1'` — relative URL. In dev the Vite proxy (vite.config.js)
// rewrites this to http://localhost:8080/api/v1 (the gateway). In prod the
// SPA will sit behind the same gateway, so the relative URL stays valid.
//
// With HttpOnly cookie-based auth, no Authorization header injection is needed.
// The browser sends the access_token cookie automatically on every same-origin
// request. The Vite proxy forwards cookies to the gateway transparently.

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 10_000,
});

// RESPONSE INTERCEPTOR ───────────────────────────────────────────────
// On 401: clear local user metadata and redirect to /login.
// We do NOT need to clear cookies — the browser discards expired cookies
// automatically, and a fresh /login → new cookies will overwrite stale ones.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      // Don't redirect if we're already on /login (avoid infinite loop)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default client;
