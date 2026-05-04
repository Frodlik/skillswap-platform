import client from './client.js';

// Thin wrappers around POST /api/v1/auth/*. Their job is to:
//  1. Hide the URL path from screen components
//  2. Return only the data we actually need (response.data, not the
//     full axios response object)
//  3. Translate axios errors into a small, predictable shape so the
//     UI can render `error.message` without knowing about HTTP codes.
//
// All four endpoints use the same backend DTO shapes:
//   request:  { email, password }              (or { refreshToken })
//   response: { accessToken, refreshToken, expiresIn }   (TokenResponse)
//   error:    { status, message, path, timestamp }       (ErrorResponse)

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

export async function logout(refreshToken) {
  // Best-effort. We always clear local state regardless of server reply.
  try {
    await client.post('/auth/logout', { refreshToken });
  } catch {
    // swallow — server may already have invalidated the token
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
