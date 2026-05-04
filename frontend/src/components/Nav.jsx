import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

// Top navigation bar. Rendered by <Layout> on every authenticated screen.
// Adapted from frontend/directions/minimal-v2.jsx · MinNav with:
//   - "Messages" dropped (out of MVP scope)
//   - real react-router <NavLink>s instead of static spans
//   - avatar dropdown wired to AuthContext.logout()

const NAV_ITEMS = [
  { label: 'Browse',    to: '/browse'    },
  { label: 'Matches',   to: '/matches'   },
  { label: 'Skills',    to: '/skills'    },
  { label: 'Sessions',  to: '/sessions'  },
  { label: 'Wallet',    to: '/wallet'    },
  { label: 'Dashboard', to: '/dashboard' },
];

export default function Nav() {
  const { m } = useTheme();
  const { email, logout } = useAuth();
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

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

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
                {item.label}
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
              Edit profile
            </DropdownLink>
            <DropdownLink m={m} to="/wallet" onClick={() => setMenuOpen(false)}>
              Wallet
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
              Log out
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
