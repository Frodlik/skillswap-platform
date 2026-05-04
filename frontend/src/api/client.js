import axios from 'axios';

// Single shared HTTP client. Every API call in the app goes through this,
// so we configure base URL + auth header in ONE place rather than every
// component repeating itself.
//
// `baseURL: '/api/v1'` — relative URL. In dev the Vite proxy (vite.config.js)
// rewrites this to http://localhost:8080/api/v1 (the gateway). In prod the
// SPA will sit behind the same gateway, so the relative URL stays valid.

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 10_000,
});

// REQUEST INTERCEPTOR ────────────────────────────────────────────────
// Runs before every outgoing request. We inject the JWT access token
// from localStorage as `Authorization: Bearer <token>`. The gateway's
// JwtAuthenticationFilter validates it and either rejects the request
// or forwards it to the right service with x-user-id / x-user-role
// headers attached.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR ───────────────────────────────────────────────
// Runs after every response. We catch 401 (token expired or missing),
// wipe local credentials, and bounce the user to /login. This is a
// hard reset — no auto-refresh dance for now (we'll add that in a
// later phase if needed).
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Don't redirect if we're already on /login (avoid infinite loop)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default client;
