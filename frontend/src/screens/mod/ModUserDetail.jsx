import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/theme.jsx';
import * as usersApi from '../../api/users.js';
import * as modApi from '../../api/moderation.js';

const SANCTION_TYPES = ['WARNING', 'TEMP_BAN', 'PERMANENT_BAN'];

const TYPE_COLOR = {
  WARNING:       '#c98a3b',
  TEMP_BAN:      '#c98a3b',
  PERMANENT_BAN: '#d33b3b',
};

function sanctionStatus(s) {
  if (s.liftedAt) return 'LIFTED';
  if (s.type === 'TEMP_BAN' && s.expiresAt && new Date(s.expiresAt) < new Date()) return 'EXPIRED';
  return 'ACTIVE';
}

export default function ModUserDetail() {
  const { m } = useTheme();
  const { t } = useTranslation();
  const { userId } = useParams();

  const [profile, setProfile]     = useState(null);
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Sanction form
  const [type, setType]           = useState('WARNING');
  const [reason, setReason]       = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [formError, setFormError] = useState('');
  const [formBusy, setFormBusy]   = useState(false);

  // Edit profile
  const [editOpen, setEditOpen]   = useState(false);
  const [editName, setEditName]   = useState('');
  const [editBio, setEditBio]     = useState('');
  const [editBusy, setEditBusy]   = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [prof, sancs] = await Promise.all([
          usersApi.getProfile(userId),
          modApi.getUserSanctions(userId),
        ]);
        if (cancelled) return;
        setProfile(prof);
        setSanctions(sancs);
        setEditName(prof.displayName ?? '');
        setEditBio(prof.bio ?? '');
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const handleLiftSanction = useCallback(async (sanctionId) => {
    try {
      await modApi.liftSanction(sanctionId);
      setSanctions((prev) => prev.map((s) =>
        s.id === sanctionId ? { ...s, liftedAt: new Date().toISOString() } : s
      ));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }, []);

  async function handleIssueSanction(e) {
    e.preventDefault();
    if (!reason.trim()) { setFormError(t('mod.userDetail.reasonRequired')); return; }
    if (type === 'TEMP_BAN' && !expiresAt) { setFormError(t('mod.userDetail.expiresRequired')); return; }
    if (type === 'TEMP_BAN' && new Date(expiresAt) <= new Date()) { setFormError(t('mod.userDetail.expiresFuture')); return; }
    setFormError('');
    setFormBusy(true);
    try {
      const payload = { userId, type, reason: reason.trim() };
      if (type === 'TEMP_BAN') payload.expiresAt = new Date(expiresAt).toISOString();
      const created = await modApi.createSanction(payload);
      setSanctions((prev) => [created, ...prev]);
      setReason('');
      setExpiresAt('');
      setType('WARNING');
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setFormBusy(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setEditBusy(true);
    setEditError('');
    try {
      await modApi.moderatorPatchProfile(userId, {
        displayName: editName || undefined,
        bio: editBio || undefined,
      });
      setProfile((prev) => ({ ...prev, displayName: editName, bio: editBio }));
      setEditOpen(false);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message);
    } finally {
      setEditBusy(false);
    }
  }

  if (loading) return <div style={{ padding: 40, color: 'rgba(14,14,12,0.5)', fontFamily: 'IBM Plex Mono', fontSize: 13 }}>{t('mod.userDetail.loading')}</div>;
  if (error)   return <div style={{ padding: 40, color: '#d33b3b', fontFamily: 'IBM Plex Mono', fontSize: 13 }}>{t('mod.userDetail.errorPrefix')} {error}</div>;

  const initial = (profile?.displayName ?? '?').charAt(0).toUpperCase();

  return (
    <div style={{ padding: '32px 40px', maxWidth: 860 }}>
      <Link to="/mod/queue" style={{ fontSize: 13, color: 'rgba(14,14,12,0.7)', textDecoration: 'none', fontFamily: 'IBM Plex Mono', display: 'block', marginBottom: 24 }}>
        {t('mod.userDetail.back')}
      </Link>

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, background: m.accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 600 }}>
            {initial}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: m.ink }}>{profile?.displayName ?? '—'}</div>
            <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono, marginTop: 2 }}>{userId}</div>
            {profile?.rating != null && (
              <div style={{ fontSize: 13, color: m.ink70, marginTop: 4 }}>{Number(profile.rating).toFixed(1)} ★</div>
            )}
          </div>
        </div>
        <button type="button" onClick={() => setEditOpen((v) => !v)} style={{
          padding: '8px 16px', background: 'transparent',
          border: `1px solid ${m.ink20}`, borderRadius: 7,
          fontSize: 13, fontFamily: m.font, color: m.ink, cursor: 'pointer',
        }}>
          {editOpen ? t('mod.userDetail.cancel') : t('mod.userDetail.editProfile')}
        </button>
      </div>

      {/* Edit profile form */}
      {editOpen && (
        <form onSubmit={handleSaveProfile} style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 10, padding: 20, marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{t('mod.userDetail.editTitle')}</div>
          <label style={{ display: 'block', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontFamily: m.mono, color: m.ink70, marginBottom: 6 }}>{t('mod.userDetail.displayName')}</div>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{
              width: '100%', padding: '9px 12px', background: m.bg, color: m.ink,
              border: `1px solid ${m.ink20}`, borderRadius: 7, fontSize: 13,
              fontFamily: m.font, outline: 'none', boxSizing: 'border-box',
            }} />
          </label>
          <label style={{ display: 'block', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontFamily: m.mono, color: m.ink70, marginBottom: 6 }}>{t('mod.userDetail.bio')}</div>
            <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} style={{
              width: '100%', padding: '9px 12px', background: m.bg, color: m.ink,
              border: `1px solid ${m.ink20}`, borderRadius: 7, fontSize: 13,
              fontFamily: m.font, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
            }} />
          </label>
          {editError && <div style={{ color: '#d33b3b', fontFamily: m.mono, fontSize: 12, marginBottom: 10 }}>{editError}</div>}
          <button type="submit" disabled={editBusy} style={{
            padding: '9px 20px', background: m.ink, color: m.bg, border: 'none',
            borderRadius: 7, fontSize: 13, fontFamily: m.font, fontWeight: 500,
            cursor: editBusy ? 'not-allowed' : 'pointer',
          }}>
            {editBusy ? t('mod.userDetail.saving') : t('mod.userDetail.save')}
          </button>
        </form>
      )}

      {/* Sanction history */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{t('mod.userDetail.sanctionHistory')}</div>
        {sanctions.length === 0 ? (
          <div style={{ color: m.ink50, fontFamily: m.mono, fontSize: 13 }}>{t('mod.userDetail.noSanctions')}</div>
        ) : (
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 10, overflow: 'hidden' }}>
            {sanctions.map((s, i) => {
              const st = sanctionStatus(s);
              return (
                <div key={s.id} style={{
                  display: 'grid', gridTemplateColumns: '130px 1fr 100px 80px 80px',
                  gap: 12, padding: '12px 16px', alignItems: 'center',
                  borderTop: i === 0 ? 'none' : `1px solid ${m.ink10}`,
                  fontSize: 13,
                }}>
                  <span style={{
                    fontFamily: m.mono, fontSize: 10.5, padding: '2px 7px', borderRadius: 4,
                    background: TYPE_COLOR[s.type] + '22', color: TYPE_COLOR[s.type],
                    textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500,
                    display: 'inline-block',
                  }}>{s.type.replace(/_/g, ' ')}</span>
                  <span style={{ color: m.ink70, fontSize: 12.5 }}>{s.reason}</span>
                  <span style={{ fontFamily: m.mono, fontSize: 11.5, color: m.ink50 }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{
                    fontFamily: m.mono, fontSize: 11, padding: '2px 6px', borderRadius: 4,
                    background: st === 'ACTIVE' ? 'rgba(211,59,59,0.12)' : m.ink10,
                    color: st === 'ACTIVE' ? '#d33b3b' : m.ink50,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    display: 'inline-block',
                  }}>{t(`mod.userDetail.status.${st}`, st)}</span>
                  {st === 'ACTIVE' ? (
                    <button type="button" onClick={() => handleLiftSanction(s.id)} style={{
                      padding: '5px 10px', background: 'transparent',
                      border: `1px solid ${m.ink20}`, borderRadius: 6,
                      fontSize: 12, fontFamily: m.font, color: m.ink, cursor: 'pointer',
                    }}>
                      {t('mod.userDetail.lift')}
                    </button>
                  ) : <span />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Issue sanction form */}
      <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>{t('mod.userDetail.issueSanction')}</div>
        <form onSubmit={handleIssueSanction}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {SANCTION_TYPES.map((st) => (
              <label key={st} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 6, cursor: 'pointer',
                border: `1px solid ${type === st ? m.accent : m.ink10}`,
                background: type === st ? m.accentSoft : 'transparent',
                fontSize: 12.5, fontFamily: m.mono,
              }}>
                <input
                  type="radio" name="sanctionType" value={st}
                  checked={type === st}
                  onChange={() => { setType(st); setExpiresAt(''); setFormError(''); }}
                  style={{ accentColor: m.accent }}
                />
                {st.replace(/_/g, ' ')}
              </label>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontFamily: m.mono, color: m.ink70, marginBottom: 6 }}>{t('mod.userDetail.reason')} <span style={{ color: '#d33b3b' }}>*</span></div>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setFormError(''); }}
              rows={2}
              placeholder={t('mod.userDetail.reasonPlaceholder')}
              style={{
                width: '100%', padding: '9px 12px', background: m.bg, color: m.ink,
                border: `1px solid ${formError && !reason ? '#d33b3b' : m.ink20}`,
                borderRadius: 7, fontSize: 13, fontFamily: m.font,
                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>

          {type === 'TEMP_BAN' && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontFamily: m.mono, color: m.ink70, marginBottom: 6 }}>{t('mod.userDetail.expiresAt')} <span style={{ color: '#d33b3b' }}>*</span></div>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => { setExpiresAt(e.target.value); setFormError(''); }}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                style={{
                  padding: '9px 12px', background: m.bg, color: m.ink,
                  border: `1px solid ${formError && !expiresAt ? '#d33b3b' : m.ink20}`,
                  borderRadius: 7, fontSize: 13, fontFamily: m.mono, outline: 'none',
                }}
              />
            </div>
          )}

          {formError && <div style={{ color: '#d33b3b', fontFamily: m.mono, fontSize: 12, marginBottom: 10 }}>{formError}</div>}

          <button type="submit" disabled={formBusy} style={{
            padding: '10px 22px', background: m.ink, color: m.bg, border: 'none',
            borderRadius: 7, fontSize: 13, fontFamily: m.font, fontWeight: 500,
            cursor: formBusy ? 'not-allowed' : 'pointer', opacity: formBusy ? 0.6 : 1,
          }}>
            {formBusy ? t('mod.userDetail.issuing') : t('mod.userDetail.issueButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
