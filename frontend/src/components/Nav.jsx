import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as authApi from '../api/auth.js';

// Top navigation bar. Rendered by <Layout> on every authenticated screen.
//
// i18n: useTranslation() gives us:
//   - t('nav.browse')         — translated string
//   - i18n.language           — current language code: 'en' | 'uk'
//   - i18n.changeLanguage(lng) — switch; i18next-browser-languagedetector
//                                 persists the choice to localStorage automatically
//
// The NAV_ITEMS list now stores translation KEYS instead of literal strings,
// and the JSX calls t(item.labelKey) on render. This way switching language
// re-renders all components subscribed via useTranslation().

const NAV_ITEMS = [
  { labelKey: 'nav.browse',    to: '/browse'    },
  { labelKey: 'nav.matches',   to: '/matches'   },
  { labelKey: 'nav.skills',    to: '/skills'    },
  { labelKey: 'nav.sessions',  to: '/sessions'  },
  { labelKey: 'nav.wallet',    to: '/wallet'    },
  { labelKey: 'nav.dashboard', to: '/dashboard' },
];

export default function Nav() {
  const { m, mode, setMode } = useTheme();
  const { email, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Avatar dropdown open/closed state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the dropdown when the user clicks outside of it.
  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  async function handleLogout() {
    await authApi.logout();
    logout();
    navigate('/login', { replace: true });
  }

  // Language toggle — flips between 'en' and 'uk'. i18next persists the
  // choice via the LanguageDetector localStorage cache (see i18n.js).
  function toggleLanguage() {
    const next = i18n.language?.startsWith('uk') ? 'en' : 'uk';
    i18n.changeLanguage(next);
  }
  const isUk = i18n.language?.startsWith('uk');

  // First letter of the email goes into the avatar circle.
  const initial = (email || '?').trim().charAt(0).toUpperCase();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: `1px solid ${m.ink10}`,
        background: m.bg,
      }}
    >
      {/* ─── Logo ─── */}
      <Link
        to="/matches"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 15,
          fontWeight: 600,
          color: m.ink,
          textDecoration: 'none',
        }}
      >
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
      </Link>

      {/* ─── Nav links ─── */}
      <div style={{ display: 'flex', gap: 28, fontSize: 13.5 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            // The function form of `style` lets us read `isActive`
            // (set by NavLink based on the current URL).
            style={({ isActive }) => ({
              color: isActive ? m.ink : m.ink70,
              fontWeight: isActive ? 500 : 400,
              position: 'relative',
              textDecoration: 'none',
              paddingBottom: 22,    // space for the underline
            })}
          >
            {({ isActive }) => (
              <>
                {t(item.labelKey)}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 1.5,
                      background: m.ink,
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* ─── Language toggle ─── */}
      <button
        type="button"
        onClick={toggleLanguage}
        title={t('nav.switchLanguage')}
        style={{
          background: m.ink10,
          border: 'none',
          borderRadius: 999,
          padding: '5px 12px',
          cursor: 'pointer',
          fontFamily: m.mono,
          fontSize: 12,
          color: m.ink70,
          marginRight: 8,
        }}
      >
        {isUk ? 'EN' : 'УК'}
      </button>

      {/* ─── Theme toggle ─── */}
      <button
        type="button"
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        title={mode === 'dark' ? t('nav.switchLight') : t('nav.switchDark')}
        style={{
          background: m.ink10,
          border: 'none',
          borderRadius: 999,
          padding: '5px 12px',
          cursor: 'pointer',
          fontFamily: m.mono,
          fontSize: 12,
          color: m.ink70,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginRight: -8,
        }}
      >
        {mode === 'dark' ? '☀' : '☾'}
        <span>{mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}</span>
      </button>

      {/* ─── Avatar + dropdown ─── */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: m.font,
            color: m.ink,
            fontSize: 13.5,
          }}
        >
          {email && (
            <span
              style={{
                color: m.ink70,
                fontFamily: m.mono,
                fontSize: 12,
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email}
            </span>
          )}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: m.accent,
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {initial}
          </div>
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              minWidth: 180,
              background: m.panel,
              border: `1px solid ${m.ink10}`,
              borderRadius: 8,
              boxShadow: `0 4px 12px ${m.ink10}`,
              padding: 4,
              zIndex: 10,
            }}
          >
            <DropdownLink m={m} to="/profile" onClick={() => setMenuOpen(false)}>
              {t('nav.editProfile')}
            </DropdownLink>
            <DropdownLink m={m} to="/wallet" onClick={() => setMenuOpen(false)}>
              {t('nav.wallet')}
            </DropdownLink>
            <div style={{ height: 1, background: m.ink10, margin: '4px 0' }} />
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                background: 'transparent',
                border: 'none',
                color: m.ink,
                fontFamily: m.font,
                fontSize: 13.5,
                cursor: 'pointer',
                borderRadius: 6,
              }}
            >
              {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DropdownLink({ m, to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: 'block',
        padding: '8px 10px',
        color: m.ink,
        textDecoration: 'none',
        fontSize: 13.5,
        borderRadius: 6,
      }}
    >
      {children}
    </Link>
  );
}
