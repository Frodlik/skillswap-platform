import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as authApi from '../api/auth.js';

// Login + Register screen. One component, two modes (tab toggle).
// Adapted from frontend/directions/minimal-account.jsx · MinLogin,
// with OAuth (Google/Apple) and "Full name" field removed because the
// backend's RegisterRequest only accepts { email, password }.
//
// Lifecycle:
//   1. User types into email/password (controlled inputs → useState)
//   2. Submit → setSubmitting(true) → call authApi.login/register
//   3a. Success → AuthContext.login(tokenResponse) → navigate('/matches')
//   3b. Error   → setError(message) → render banner above the form
//   4. setSubmitting(false) (in finally — always runs)

export default function Login() {
  const { m } = useTheme();
  const { isAuthenticated, login: setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // RequireAuth stashes the URL we were redirected from in `state.from`.
  // Default to /matches if user opened /login directly.
  const redirectTo = location.state?.from?.pathname || '/matches';

  const [tab, setTab] = useState('register');     // 'register' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // If a logged-in user lands on /login, bounce them straight to where
  // they were heading (or /matches by default).
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(e) {
    e.preventDefault();   // stop browser from doing a full page reload
    setError(null);
    setSubmitting(true);
    try {
      const fn = tab === 'register' ? authApi.register : authApi.login;
      const tokenResponse = await fn(email, password);
      setAuth(tokenResponse, email);   // updates AuthContext + localStorage
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchTab(next) {
    setTab(next);
    setError(null);
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: m.bg,
        color: m.ink,
        fontFamily: m.font,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      {/* ─── LEFT: form ───────────────────────────────────────── */}
      <div
        style={{
          padding: '64px 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Logo m={m} />

        {/* Tab switcher (Register / Sign in) */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            background: m.ink10,
            borderRadius: 9,
            width: 'fit-content',
            marginBottom: 28,
            fontSize: 13.5,
            marginTop: 56,
          }}
        >
          {[
            ['register', 'Create account'],
            ['login', 'Sign in'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => switchTab(id)}
              style={{
                background: tab === id ? m.panel : 'transparent',
                color: m.ink,
                border: 'none',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: m.font,
                fontWeight: 500,
                boxShadow: tab === id ? `0 1px 2px ${m.ink10}` : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <h1
          style={{
            fontSize: 38,
            fontWeight: 500,
            letterSpacing: '-0.025em',
            margin: 0,
            marginBottom: 8,
            lineHeight: 1.05,
          }}
        >
          {tab === 'register' ? (
            <>
              Start trading{' '}
              <span style={{ fontStyle: 'italic', color: m.accent }}>skills.</span>
            </>
          ) : (
            <>
              Welcome <span style={{ fontStyle: 'italic', color: m.accent }}>back.</span>
            </>
          )}
        </h1>
        <p style={{ fontSize: 14.5, color: m.ink70, margin: 0, marginBottom: 32 }}>
          {tab === 'register'
            ? 'Earn a credit each hour you teach. Spend it learning anything else.'
            : 'Pick up where you left off.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && <ErrorBanner m={m} message={error} />}

          <Field m={m} label="Email" htmlFor="email">
            <Input
              m={m}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field
            m={m}
            label="Password"
            htmlFor="password"
            hint={tab === 'register' ? 'min 8 characters' : null}
          >
            <Input
              m={m}
              id="password"
              type="password"
              autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={tab === 'register' ? 8 : undefined}
              required
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: m.ink,
              color: m.bg,
              border: 'none',
              padding: '13px',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: m.font,
              fontWeight: 500,
              cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              marginTop: 18,
              marginBottom: 14,
            }}
          >
            {submitting
              ? tab === 'register'
                ? 'Creating account...'
                : 'Signing in...'
              : tab === 'register'
                ? 'Create account →'
                : 'Sign in →'}
          </button>
        </form>

        <div style={{ fontSize: 12.5, color: m.ink50, fontFamily: m.mono }}>
          {tab === 'register' ? (
            <>
              Already a member?{' '}
              <span
                onClick={() => switchTab('login')}
                style={{ color: m.accent, cursor: 'pointer' }}
              >
                Sign in
              </span>
            </>
          ) : (
            <>
              New here?{' '}
              <span
                onClick={() => switchTab('register')}
                style={{ color: m.accent, cursor: 'pointer' }}
              >
                Create an account
              </span>
            </>
          )}
        </div>
      </div>

      {/* ─── RIGHT: marketing visual ─────────────────────────── */}
      <SidePanel m={m} />
    </div>
  );
}

// ─── Local sub-components ─────────────────────────────────────
// Pulled out for readability. Each is "dumb" — receives `m` (theme)
// + props, returns markup, no state.

function Logo({ m }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: m.ink,
          display: 'grid',
          placeItems: 'center',
          color: m.bg,
          fontFamily: m.mono,
          fontSize: 13,
        }}
      >
        ⇄
      </div>
      skillswap
    </div>
  );
}

function Field({ m, label, htmlFor, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label
          htmlFor={htmlFor}
          style={{
            fontSize: 11,
            fontFamily: m.mono,
            color: m.ink50,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </label>
        {hint && (
          <span style={{ fontSize: 11, color: m.ink50, fontFamily: m.mono }}>{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Input({ m, ...rest }) {
  return (
    <input
      {...rest}
      style={{
        width: '100%',
        padding: '11px 12px',
        background: m.panel,
        color: m.ink,
        border: `1px solid ${m.ink20}`,
        borderRadius: 8,
        fontSize: 14,
        fontFamily: m.font,
        outline: 'none',
      }}
    />
  );
}

function ErrorBanner({ m, message }) {
  return (
    <div
      role="alert"
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: '#fee',
        color: '#902020',
        border: '1px solid #f3c0c0',
        fontSize: 13,
        marginBottom: 14,
        fontFamily: m.font,
      }}
    >
      {message}
    </div>
  );
}

function SidePanel({ m }) {
  return (
    <div
      style={{
        background: m.panel,
        borderLeft: `1px solid ${m.ink10}`,
        padding: '64px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          fontFamily: m.mono,
          fontSize: 11,
          color: m.ink50,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>// what you get</span>
        <span>v0.1</span>
      </div>
      <div>
        <div style={{ fontFamily: m.mono, fontSize: 12, color: m.accent, marginBottom: 10 }}>
          +1 credit / hr taught
        </div>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 500,
            letterSpacing: '-0.03em',
            margin: 0,
            lineHeight: 1.02,
          }}
        >
          One <span style={{ fontStyle: 'italic' }}>simple</span>
          <br />
          economy.
          <br />
          <span style={{ color: m.accent }}>Hours.</span>
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: m.ink70, marginTop: 22, maxWidth: 380 }}>
          Every hour you teach earns you a credit. Spend it on anything else — Italian, jazz piano,
          sourdough. The exchange is the price.
        </p>
      </div>
      <div style={{ fontFamily: m.mono, fontSize: 11, color: m.ink50 }}>
        ↳ Diploma project · 2026
      </div>
    </div>
  );
}
