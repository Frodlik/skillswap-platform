import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/theme.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';

const MOD_RED = '#d33b3b';

const NAV_TABS = [
  { label: 'Queue', to: '/mod/queue' },
  { label: 'Users', to: '/mod/users' },
];

export default function ModLayout() {
  const { m } = useTheme();
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = email ? email.split('@')[0] : '?';
  const initial = displayName.charAt(0).toUpperCase();

  function handleLogout() {
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
          }}>MOD</span>
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
                  {tab.label}
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

        {/* Right: identity + logout on click */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              color: m.ink70, fontFamily: m.mono, fontSize: 12,
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            {displayName} · mod
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
