import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// Guard for protected routes. If user isn't logged in, redirect to /login
// and stash the URL they were trying to reach in router `state`.
//
// After a successful login, Login.jsx reads `state.from` and navigates
// the user back to where they came from instead of always /matches.
//
// Example:
//   Bob bookmarks /wallet, opens it after token expiry → 401 → /login
//   He signs in → goes straight to /wallet, not /matches.

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
