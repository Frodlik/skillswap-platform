import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/theme.jsx';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ModUsers() {
  const { m } = useTheme();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  function handleLookup(e) {
    e.preventDefault();
    const val = input.trim();
    if (!val) { setError('Enter a user ID.'); return; }
    if (!UUID_RE.test(val)) { setError('Must be a valid UUID (e.g. a1b2c3d4-…).'); return; }
    setError('');
    navigate(`/mod/users/${val}`);
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Trust & Safety</div>
      <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 24px' }}>User lookup</h1>

      <form onSubmit={handleLookup} style={{ maxWidth: 480 }}>
        <label style={{ fontSize: 12, fontFamily: m.mono, color: m.ink70, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
          User ID (UUID)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            style={{
              flex: 1, padding: '10px 14px',
              background: m.panel, color: m.ink,
              border: `1px solid ${error ? '#d33b3b' : m.ink20}`,
              borderRadius: 8, fontSize: 13, fontFamily: m.mono,
              outline: 'none',
            }}
          />
          <button type="submit" style={{
            padding: '10px 20px', background: m.ink, color: m.bg,
            border: 'none', borderRadius: 8, fontSize: 13,
            fontFamily: m.font, fontWeight: 500, cursor: 'pointer',
          }}>
            Look up →
          </button>
        </div>
        {error && <div style={{ marginTop: 8, fontSize: 12, color: '#d33b3b', fontFamily: m.mono }}>{error}</div>}
        <div style={{ marginTop: 10, fontSize: 12, color: m.ink50, fontFamily: m.mono }}>
          Tip: click any user name in the Queue to jump directly to their profile.
        </div>
      </form>
    </div>
  );
}
