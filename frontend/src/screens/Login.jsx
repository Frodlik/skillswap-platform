import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      const authResponse = await fn(email, password);
      setAuth(authResponse, email);
      const { role } = authResponse;
      const defaultDest = (role === 'MODERATOR' || role === 'ADMIN') ? '/mod/queue' : '/matches';
      navigate(redirectTo === '/matches' ? defaultDest : redirectTo, { replace: true });
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
            ['register', t('login.tabRegister')],
            ['login', t('login.tabLogin')],
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
              {t('login.headlineRegister')}{' '}
              <span style={{ fontStyle: 'italic', color: m.accent }}>{t('login.headlineRegisterAccent')}</span>
            </>
          ) : (
            <>
              {t('login.headlineLogin')}{' '}
              <span style={{ fontStyle: 'italic', color: m.accent }}>{t('login.headlineLoginAccent')}</span>
            </>
          )}
        </h1>
        <p style={{ fontSize: 14.5, color: m.ink70, margin: 0, marginBottom: 32 }}>
          {tab === 'register' ? t('login.subtitleRegister') : t('login.subtitleLogin')}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && <ErrorBanner m={m} message={error} />}

          <Field m={m} label={t('login.email')} htmlFor="email">
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
            label={t('login.password')}
            htmlFor="password"
            hint={tab === 'register' ? t('login.hintMinChars') : null}
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
                ? t('login.submittingRegister')
                : t('login.submittingLogin')
              : tab === 'register'
                ? t('login.submitRegister')
                : t('login.submitLogin')}
          </button>
        </form>

        <div style={{ fontSize: 12.5, color: m.ink50, fontFamily: m.mono }}>
          {tab === 'register' ? (
            <>
              {t('login.alreadyMember')}{' '}
              <span
                onClick={() => switchTab('login')}
                style={{ color: m.accent, cursor: 'pointer' }}
              >
                {t('login.alreadyMemberCta')}
              </span>
            </>
          ) : (
            <>
              {t('login.newHere')}{' '}
              <span
                onClick={() => switchTab('register')}
                style={{ color: m.accent, cursor: 'pointer' }}
              >
                {t('login.newHereCta')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ─── RIGHT: marketing visual ─────────────────────────── */}
      <SidePanel m={m} t={t} />
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

function SidePanel({ m, t }) {
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
        <span>{t('login.marketingEyebrow')}</span>
        <span>v0.1</span>
      </div>
      <div>
        <div style={{ fontFamily: m.mono, fontSize: 12, color: m.accent, marginBottom: 10 }}>
          {t('login.marketingCredit')}
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
          {t('login.marketingHeadline1')} <span style={{ fontStyle: 'italic' }}>{t('login.marketingHeadline1Italic')}</span>
          <br />
          {t('login.marketingHeadline2')}
          <br />
          <span style={{ color: m.accent }}>{t('login.marketingHeadline3')}</span>
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: m.ink70, marginTop: 22, maxWidth: 380 }}>
          {t('login.marketingBody')}
        </p>
      </div>
      <div style={{ fontFamily: m.mono, fontSize: 11, color: m.ink50 }}>
        {t('login.marketingFooter')}
      </div>
    </div>
  );
}
