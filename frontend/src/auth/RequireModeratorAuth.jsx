import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// Allows only MODERATOR and ADMIN roles.
// If not authenticated at all → /login.
// If authenticated but wrong role → /matches.
export default function RequireModeratorAuth({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'MODERATOR' && user?.role !== 'ADMIN') {
    return <Navigate to="/matches" replace />;
  }
  return children;
}
