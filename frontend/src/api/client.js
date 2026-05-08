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

// RESPONSE INTERCEPTOR — silent token refresh ────────────────────────
// When any request returns 401 (access token expired):
//   1. Attempt POST /auth/refresh — server reads the refresh_token cookie
//      and issues new access_token + refresh_token cookies.
//   2. If refresh succeeds, retry the original request (new cookie sent).
//   3. If refresh also fails (refresh token expired/revoked), wipe local
//      user metadata and redirect to /login.
//
// _isRetry flag prevents infinite loops: a 401 on the refresh call itself
// falls straight through to the redirect.

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._isRetry) {
      original._isRetry = true;

      try {
        await client.post('/auth/refresh', null, { _isRetry: true });
        // New cookies are now set by the server — retry with the same config.
        return client(original);
      } catch {
        // Refresh failed: session is truly over.
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(err);
  },
);

export default client;
