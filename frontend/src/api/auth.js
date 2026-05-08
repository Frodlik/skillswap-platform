import client from './client.js';

// Thin wrappers around POST /api/v1/auth/*.
//
// Auth tokens live exclusively in HttpOnly cookies managed by the server —
// JavaScript can no longer read them (XSS protection). The response body
// carries only non-sensitive metadata:
//   request:  { email, password }
//   response: { userId, role, expiresIn }   (AuthResponse)
//   error:    { status, message, path, timestamp }
//
// The browser sends the access_token cookie automatically on every same-origin
// request — no manual Authorization header injection needed.

export async function register(email, password) {
  try {
    const res = await client.post('/auth/register', { email, password });
    return res.data;
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function login(email, password) {
  try {
    const res = await client.post('/auth/login', { email, password });
    return res.data;
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function logout() {
  // Server revokes the refresh token (read from the cookie) and clears
  // both cookies. We swallow errors so callers can always clear local
  // state afterwards regardless of server response.
  try {
    await client.post('/auth/logout');
  } catch {
    // swallow — server may already have invalidated the session
  }
}

// Translate any error from axios into { status, message }. Cases:
//   - response received with body  → take server's status + message
//   - response received without body → status + generic message
//   - no response (network down)   → status: 0, friendly message
function normaliseError(err) {
  if (err.response) {
    const data = err.response.data;
    return {
      status: err.response.status,
      message: data?.message || `HTTP ${err.response.status}`,
    };
  }
  return {
    status: 0,
    message: 'Cannot reach server. Is the backend running?',
  };
}
