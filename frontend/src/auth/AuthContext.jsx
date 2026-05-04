import { createContext, useContext, useState } from 'react';

// AuthContext owns all auth state for the app:
//   - the current access/refresh tokens
//   - the decoded JWT payload (userId, role)
//   - the user's email (for the avatar in Nav; not present in the JWT)
//   - login() / logout() functions
//
// Tokens + email live in TWO places:
//   1. localStorage  — survives page reloads, read by api/client.js
//   2. React state   — triggers re-renders when login/logout happens
// We keep them in sync inside login()/logout() below.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy initialiser: this function runs ONCE on first render. We read
  // localStorage and decode the token if there is one — so a page
  // reload while logged in keeps the user logged in.
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('access_token');
    return t ? decodeJwt(t) : null;
  });
  const [email, setEmail] = useState(() => localStorage.getItem('email'));

  // Called by Login/Register screens after a successful POST /auth/login.
  //   tokenResponse: { accessToken, refreshToken, expiresIn }
  //   userEmail: the email the user just typed (JWT does not carry it)
  function login(tokenResponse, userEmail) {
    localStorage.setItem('access_token', tokenResponse.accessToken);
    if (tokenResponse.refreshToken) {
      localStorage.setItem('refresh_token', tokenResponse.refreshToken);
    }
    if (userEmail) {
      localStorage.setItem('email', userEmail);
      setEmail(userEmail);
    }
    setToken(tokenResponse.accessToken);
    setUser(decodeJwt(tokenResponse.accessToken));
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('email');
    setToken(null);
    setUser(null);
    setEmail(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, email, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// JWT structure: <header>.<payload>.<signature>, all base64-url-encoded.
// We never trust the payload for security (the signature is verified on
// the server), but reading it client-side is fine for showing the user
// their own id / role in the UI.
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const normalised = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalised + '='.repeat((4 - (normalised.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
