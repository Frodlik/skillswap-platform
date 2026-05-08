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
//   1. Attempt POST /auth/refresh — server reads the refresh_token cookie,
//      rotates it, and issues new access_token + refresh_token cookies.
//   2. If refresh succeeds, retry the original request (new cookie sent).
//   3. If refresh also fails (refresh token expired/revoked), wipe local
//      user metadata and redirect to /login.
//
// WHY the shared refreshPromise:
//   Refresh tokens rotate — each refresh call revokes the old token and
//   issues a new one. If multiple requests fail with 401 simultaneously
//   (e.g. page load fires 3 API calls with an expired token), each would
//   independently try to refresh. Only the first call would succeed; the
//   others would receive 401 on an already-rotated token and incorrectly
//   trigger a logout.
//   Solution: all concurrent 401s await the SAME promise, so exactly one
//   refresh call goes to the server. The promise is cleared when it settles
//   so the next genuine expiry starts a fresh refresh cycle.

let refreshPromise = null;

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._isRetry) {
      original._isRetry = true;

      if (!refreshPromise) {
        // _isRetry on the refresh config prevents the interceptor from
        // catching a 401 on the refresh call itself and looping.
        refreshPromise = client
          .post('/auth/refresh', null, { _isRetry: true })
          .finally(() => { refreshPromise = null; });
      }

      try {
        await refreshPromise;
        // New cookies are now set by the server — retry the original request.
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
