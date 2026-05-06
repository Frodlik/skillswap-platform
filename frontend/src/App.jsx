import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider, useTheme } from './theme/theme.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import RequireAuth from './auth/RequireAuth.jsx';
import Layout from './components/Layout.jsx';
import Login from './screens/Login.jsx';
import Matches from './screens/Matches.jsx';
import Skills from './screens/Skills.jsx';
import Sessions from './screens/Sessions.jsx';
import Wallet from './screens/Wallet.jsx';
import Profile from './screens/Profile.jsx';
import UserProfile from './screens/UserProfile.jsx';
import Browse from './screens/Browse.jsx';
import Dashboard from './screens/Dashboard.jsx';

// Top of the component tree.
//
//   ThemeProvider → AuthProvider → BrowserRouter → Routes
//
// Routing structure:
//   /              → redirect to /matches
//   /login         → public, no Layout (own design)
//   everything else → wrapped in <RequireAuth><Layout/></RequireAuth>
//                    so every authenticated screen gets the Nav for free

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/matches" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Authenticated section ───────────────────────────────── */}
            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route path="/browse"    element={<Browse />} />
              <Route path="/matches"   element={<Matches />} />
              <Route path="/skills"    element={<Skills />} />
              <Route path="/sessions"  element={<Sessions />} />
              <Route path="/wallet"    element={<Wallet />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile"        element={<Profile />} />
              <Route path="/users/:userId"  element={<UserProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

function NotFound() {
  const { m } = useTheme();
  return (
    <div
      style={{
        minHeight: '100vh',
        background: m.bg,
        color: m.ink,
        fontFamily: m.font,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.02em' }}>404</div>
        <div style={{ marginTop: 8, color: m.ink50, fontFamily: m.mono, fontSize: 13 }}>
          No such page.
        </div>
      </div>
    </div>
  );
}
