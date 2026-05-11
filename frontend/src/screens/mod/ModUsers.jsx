import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/theme.jsx';
import * as usersApi from '../../api/users.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function ModUsers() {
  const { m } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    const q = query.trim();

    // If it's a valid UUID — navigate immediately, no search needed.
    if (UUID_RE.test(q)) {
      setResults([]);
      setError('');
      navigate(`/mod/users/${q}`);
      return;
    }

    // Clear results for very short input.
    if (q.length < 2) {
      setResults([]);
      setError('');
      return;
    }

    // Debounce the name search.
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setError('');
      try {
        const list = await usersApi.searchByName(q);
        setResults(list);
        if (list.length === 0) setError(t('mod.users.noResults'));
      } catch {
        setError(t('mod.users.searchFailed'));
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(debounceRef.current);
  }, [query, navigate, t]);

  return (
    <div style={{ padding: '40px', maxWidth: 600 }}>
      <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {t('mod.users.eyebrow')}
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 24px' }}>
        {t('mod.users.title')}
      </h1>

      <div style={{ position: 'relative' }}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('mod.users.searchPlaceholder')}
          style={{
            width: '100%',
            padding: '11px 14px',
            background: m.panel,
            color: m.ink,
            border: `1px solid ${m.ink20}`,
            borderRadius: 8,
            fontSize: 14,
            fontFamily: m.font,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {searching && (
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 11, fontFamily: m.mono, color: m.ink50,
          }}>
            {t('mod.users.searching')}
          </span>
        )}
      </div>

      <div style={{ marginTop: 6, fontSize: 12, color: m.ink50, fontFamily: m.mono }}>
        {t('mod.users.hint')}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={{
          marginTop: 14,
          border: `1px solid ${m.ink10}`,
          borderRadius: 10,
          overflow: 'hidden',
          background: m.panel,
        }}>
          {results.map((profile, i) => (
            <button
              key={profile.userId}
              type="button"
              onClick={() => navigate(`/mod/users/${profile.userId}`)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: i < results.length - 1 ? `1px solid ${m.ink10}` : 'none',
                cursor: 'pointer',
                fontFamily: m.font,
                color: m.ink,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.displayName}</div>
                <div style={{ fontSize: 12, color: m.ink50, marginTop: 2 }}>
                  {profile.location && <span>{profile.location} · </span>}
                  {profile.language && <span style={{ fontFamily: m.mono }}>{profile.language.toUpperCase()} · </span>}
                  {profile.rating != null && <span>★ {Number(profile.rating).toFixed(1)}</span>}
                </div>
              </div>
              <span style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50 }}>
                {profile.userId.slice(0, 8)}…
              </span>
            </button>
          ))}
        </div>
      )}

      {error && results.length === 0 && (
        <div style={{ marginTop: 12, fontSize: 13, color: m.ink50, fontFamily: m.mono }}>
          {error}
        </div>
      )}
    </div>
  );
}
