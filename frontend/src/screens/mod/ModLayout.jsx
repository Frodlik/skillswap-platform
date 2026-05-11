import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/theme.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import * as authApi from '../../api/auth.js';

const MOD_RED = '#d33b3b';

const NAV_TABS = [
  { labelKey: 'mod.nav.queue', to: '/mod/queue' },
  { labelKey: 'mod.nav.users', to: '/mod/users' },
];

export default function ModLayout() {
  const { m, mode, setMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  function toggleLanguage() {
    const next = i18n.language?.startsWith('uk') ? 'en' : 'uk';
    i18n.changeLanguage(next);
  }
  const isUk = i18n.language?.startsWith('uk');

  const displayName = email ? email.split('@')[0] : '?';
  const initial = displayName.charAt(0).toUpperCase();

  async function handleLogout() {
    await authApi.logout();
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div style={{ minHeight: '100vh', background: m.bg, color: m.ink, fontFamily: m.font }}>
      {/* ── ModNav ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: `1px solid ${m.ink10}`,
        background: m.bg,
      }}>
        {/* Left: logo + MOD badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: m.ink }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: m.ink, display: 'grid', placeItems: 'center',
              color: m.bg, fontFamily: m.mono, fontSize: 13,
            }}>⇄</div>
            skillswap
          </div>
          <span style={{
            fontFamily: m.mono, fontSize: 10.5,
            padding: '3px 8px', borderRadius: 4,
            background: MOD_RED, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>{t('mod.badge')}</span>
        </div>

        {/* Center: tab links */}
        <div style={{ display: 'flex', gap: 28, fontSize: 13.5 }}>
          {NAV_TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              style={({ isActive }) => ({
                color: isActive ? m.ink : m.ink70,
                fontWeight: isActive ? 500 : 400,
                position: 'relative',
                textDecoration: 'none',
                paddingBottom: 22,
              })}
            >
              {({ isActive }) => (
                <>
                  {t(tab.labelKey)}
                  {isActive && (
                    <span style={{
                      position: 'absolute', left: 0, right: 0,
                      bottom: 0, height: 1.5, background: m.ink,
                    }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right: lang + theme toggle + identity + logout */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            onClick={toggleLanguage}
            title={t('nav.switchLanguage')}
            style={{
              background: m.ink10, border: 'none', borderRadius: 999,
              padding: '5px 12px', cursor: 'pointer',
              fontFamily: m.mono, fontSize: 12, color: m.ink70,
            }}
          >
            {isUk ? 'EN' : 'УК'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            title={mode === 'dark' ? t('nav.switchLight') : t('nav.switchDark')}
            style={{
              background: m.ink10, border: 'none', borderRadius: 999,
              padding: '5px 12px', cursor: 'pointer',
              fontFamily: m.mono, fontSize: 12, color: m.ink70,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            {mode === 'dark' ? '☀' : '☾'}
            <span>{mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              color: m.ink70, fontFamily: m.mono, fontSize: 12,
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            {t('mod.nav.identity', { name: displayName })}
          </button>
          <div style={{
            width: 28, height: 28, borderRadius: 999,
            background: m.accent, color: '#fff',
            display: 'grid', placeItems: 'center',
            fontSize: 12, fontWeight: 600,
          }}>{initial}</div>
        </div>
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
