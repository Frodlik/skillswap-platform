import { createContext, useContext, useState } from 'react';

// AuthContext owns all auth state for the app.
//
// Tokens are now stored exclusively in HttpOnly cookies managed by the
// server — JavaScript can no longer read them (XSS protection). Instead,
// after a successful login/register the server returns:
//   { userId, role, expiresIn }
// We persist userId + role + email in localStorage (non-sensitive metadata)
// so the user stays logged in after a page reload.
//
// The actual request authentication is handled server-side: the browser
// sends the access_token cookie automatically on every same-origin request.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Lazy initialiser: reads localStorage once on first render so a page
  // reload while logged in restores the session without a round-trip.
  const [user, setUser] = useState(() => {
    const userId = localStorage.getItem('userId');
    const role   = localStorage.getItem('role');
    return userId ? { sub: userId, role } : null;
  });
  const [email, setEmail] = useState(() => localStorage.getItem('email'));

  // Called by Login/Register screens after a successful POST /auth/login.
  //   authResponse: { userId, role, expiresIn }
  //   userEmail: the email the user just typed (not present in the response)
  function login(authResponse, userEmail) {
    localStorage.setItem('userId', authResponse.userId);
    localStorage.setItem('role',   authResponse.role);
    if (userEmail) {
      localStorage.setItem('email', userEmail);
      setEmail(userEmail);
    }
    setUser({ sub: authResponse.userId, role: authResponse.role });
  }

  function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setUser(null);
    setEmail(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, email, isAuthenticated: !!user, login, logout }}
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
