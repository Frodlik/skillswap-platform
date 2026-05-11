import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/theme.jsx';
import * as modApi from '../../api/moderation.js';
import * as usersApi from '../../api/users.js';

const MOD_RED = '#d33b3b';

const STATUS_TABS = [
  { key: 'OPEN' },
  { key: 'RESOLVED' },
  { key: 'DISMISSED' },
  { key: 'ALL' },
];

const ACTIONS = [
  { key: 'warning', sanctionType: 'WARNING' },
  { key: 'suspend', sanctionType: 'TEMP_BAN' },
  { key: 'permban', sanctionType: 'PERMANENT_BAN' },
];

function severity(reason) {
  if (['HATE_SPEECH', 'HARASSMENT', 'INAPPROPRIATE'].includes(reason)) return 'high';
  if (['NO_SHOW', 'OFF_TOPIC', 'SCAM'].includes(reason))               return 'med';
  return 'low';
}

function sevColor(s) {
  return s === 'high' ? MOD_RED : s === 'med' ? '#c98a3b' : null;
}

function sevBg(s, m) {
  return s === 'high' ? 'rgba(211,59,59,0.12)' : s === 'med' ? 'rgba(201,138,59,0.14)' : m.ink10;
}

function timeAgo(iso) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function ModQueue() {
  const { m } = useTheme();
  const { t } = useTranslation();

  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeTab, setActiveTab]     = useState('OPEN');
  const [selectedId, setSelectedId]   = useState(null);
  const [profiles, setProfiles]       = useState({});
  const [notes, setNotes]             = useState('');
  const [actions, setActions]         = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await modApi.getReports();
        if (cancelled) return;
        setReports(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Fetch profiles for all reporter/reported IDs
  useEffect(() => {
    if (reports.length === 0) return;
    let cancelled = false;
    async function loadProfiles() {
      const ids = [...new Set(reports.flatMap((r) => [r.reporterId, r.reportedUserId]))];
      const missing = ids.filter((id) => !profiles[id]);
      if (missing.length === 0) return;
      const settled = await Promise.allSettled(missing.map((id) => usersApi.getProfile(id)));
      if (cancelled) return;
      const next = { ...profiles };
      missing.forEach((id, i) => {
        if (settled[i].status === 'fulfilled') next[id] = settled[i].value;
      });
      setProfiles(next);
    }
    loadProfiles();
    return () => { cancelled = true; };
  }, [reports]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (activeTab === 'ALL') return reports;
    return reports.filter((r) => r.status === activeTab);
  }, [reports, activeTab]);

  const counts = useMemo(() => {
    const c = { ALL: reports.length };
    STATUS_TABS.slice(0, 3).forEach(({ key }) => {
      c[key] = reports.filter((r) => r.status === key).length;
    });
    return c;
  }, [reports]);

  const selected = reports.find((r) => r.id === selectedId) || null;

  useEffect(() => {
    setActions({});
    setNotes('');
    setSubmitError(null);
  }, [selectedId]);

  const handleResolve = useCallback(async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      for (const action of ACTIONS) {
        if (!actions[action.key]) continue;
        const payload = {
          userId: selected.reportedUserId,
          type: action.sanctionType,
          reason: notes || selected.reason,
        };
        if (action.sanctionType === 'TEMP_BAN') {
          const exp = new Date();
          exp.setDate(exp.getDate() + 7);
          payload.expiresAt = exp.toISOString();
        }
        await modApi.createSanction(payload);
      }
      await modApi.resolveReport(selected.id);
      setReports((prev) => prev.map((r) =>
        r.id === selected.id ? { ...r, status: 'RESOLVED' } : r
      ));
      const next = filtered.find((r) => r.id !== selected.id);
      setSelectedId(next?.id ?? null);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }, [selected, actions, notes, filtered]);

  const handleDismiss = useCallback(async () => {
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await modApi.dismissReport(selected.id);
      setReports((prev) => prev.map((r) =>
        r.id === selected.id ? { ...r, status: 'DISMISSED' } : r
      ));
      const next = filtered.find((r) => r.id !== selected.id);
      setSelectedId(next?.id ?? null);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  }, [selected, filtered]);

  if (loading) return <div style={{ padding: 40, color: m.ink50, fontFamily: m.mono, fontSize: 13 }}>{t('mod.queue.loading')}</div>;
  if (error)   return <div style={{ padding: 40, color: MOD_RED, fontFamily: m.mono, fontSize: 13 }}>{t('mod.queue.loadErrorPrefix')} {error}</div>;

  return (
    <div style={{ padding: '0 40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '24px 0 0' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{t('mod.queue.eyebrow')}</div>
          <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', margin: 0 }}>{t('mod.queue.title')}</h1>
        </div>
        <div style={{ fontFamily: m.mono, fontSize: 12, color: m.ink70 }}>{t('mod.queue.autoRefresh')}</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: '16px 0' }}>
        {[
          { l: t('mod.queue.stats.open'),      v: counts.OPEN,     accent: true },
          { l: t('mod.queue.stats.resolved'),  v: counts.RESOLVED  },
          { l: t('mod.queue.stats.dismissed'), v: counts.DISMISSED },
          { l: t('mod.queue.stats.total'),     v: counts.ALL       },
        ].map((s) => (
          <div key={s.l} style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 10.5, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.l}</div>
            <div style={{ fontSize: 28, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1, color: s.accent ? MOD_RED : m.ink }}>{s.v ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Split view */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 14, minHeight: 520 }}>
        {/* Left: queue list */}
        <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${m.ink10}` }}>
            <div style={{ display: 'flex', gap: 4, fontSize: 12, fontFamily: m.mono }}>
              {STATUS_TABS.map(({ key }) => (
                <button key={key} type="button" onClick={() => setActiveTab(key)} style={{
                  padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  background: activeTab === key ? m.ink10 : 'transparent',
                  color: activeTab === key ? m.ink : m.ink70,
                  fontFamily: m.mono, fontSize: 12,
                }}>
                  {t(`mod.queue.filter.${key}`)}{counts[key] != null ? ` ${counts[key]}` : ''}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 12, fontFamily: m.mono, color: m.ink70 }}>{t('mod.queue.severitySort')}</span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 && (
              <div style={{ padding: 24, color: m.ink50, fontSize: 13, fontFamily: m.mono }}>{t('mod.queue.empty')}</div>
            )}
            {[...filtered].sort((a, b) => {
              const order = { high: 0, med: 1, low: 2 };
              return order[severity(a.reason)] - order[severity(b.reason)];
            }).map((r, i) => {
              const sev = severity(r.reason);
              const reporter = profiles[r.reporterId];
              const sel = r.id === selectedId;
              return (
                <div key={r.id} onClick={() => setSelectedId(r.id)} style={{
                  display: 'grid', gridTemplateColumns: '60px 70px 1fr 70px',
                  gap: 10, padding: '12px 16px', alignItems: 'center',
                  background: sel ? m.accentSoft : 'transparent',
                  borderTop: i === 0 ? 'none' : `1px solid ${m.ink10}`,
                  borderLeft: sel ? `2px solid ${m.accent}` : '2px solid transparent',
                  cursor: 'pointer',
                }}>
                  <span style={{ fontFamily: m.mono, fontSize: 11, color: m.ink70 }}>{r.id.slice(0, 6).toUpperCase()}</span>
                  <span style={{
                    fontFamily: m.mono, fontSize: 10, padding: '2px 7px', borderRadius: 4,
                    background: sevBg(sev, m), color: sevColor(sev) ?? m.ink70,
                    justifySelf: 'start', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500,
                  }}>{sev}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: sel ? 500 : 400 }}>{r.reason.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono, marginTop: 2 }}>
                      {reporter?.displayName ?? r.reporterId.slice(0, 8)} · {r.status.toLowerCase()}
                    </div>
                  </div>
                  <span style={{ fontFamily: m.mono, fontSize: 11.5, color: m.ink70, textAlign: 'right' }}>{timeAgo(r.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: detail panel */}
        {selected ? (
          <DetailPanel
            m={m}
            t={t}
            report={selected}
            profiles={profiles}
            notes={notes}
            setNotes={setNotes}
            actions={actions}
            setActions={setActions}
            submitting={submitting}
            submitError={submitError}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
          />
        ) : (
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, display: 'grid', placeItems: 'center', color: m.ink50, fontFamily: m.mono, fontSize: 13 }}>
            {t('mod.queue.selectPrompt')}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailPanel({ m, t, report, profiles, notes, setNotes, actions, setActions, submitting, submitError, onResolve, onDismiss }) {
  const sev      = severity(report.reason);
  const reporter = profiles[report.reporterId];
  const reported = profiles[report.reportedUserId];

  return (
    <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontFamily: m.mono, fontSize: 11, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t('mod.queue.reportPrefix')} · {report.id.slice(0, 8).toUpperCase()}
        </span>
        <span style={{
          fontFamily: m.mono, fontSize: 10, padding: '3px 8px', borderRadius: 4,
          background: sevBg(sev, m), color: sevColor(sev) ?? m.ink70,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{sev} · {report.reason.replace(/_/g, ' ')}</span>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em', margin: '6px 0 4px' }}>
        {t('mod.queue.reportedSentence', {
          reporter: reporter?.displayName ?? t('mod.queue.unknownUser'),
          reported: reported?.displayName ?? t('mod.queue.unknownUser'),
        })}
      </h2>
      <div style={{ fontSize: 12.5, color: m.ink50, fontFamily: m.mono, marginBottom: 14 }}>
        {t('mod.queue.filedAgo', { ago: timeAgo(report.createdAt), date: new Date(report.createdAt).toLocaleDateString() })}
      </div>

      {/* Parties */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        <PartyCard m={m} label={t('mod.queue.reporter')} profile={reporter} userId={report.reporterId} />
        <PartyCard m={m} label={t('mod.queue.reported')} profile={reported} userId={report.reportedUserId} warn />
      </div>

      {/* Statement */}
      {report.comment && (
        <>
          <div style={{ fontSize: 10.5, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{t('mod.queue.statement')}</div>
          <div style={{ padding: 12, background: m.bg, border: `1px solid ${m.ink10}`, borderRadius: 8, fontSize: 13, lineHeight: 1.5, marginBottom: 14, fontStyle: 'italic' }}>
            "{report.comment}"
          </div>
        </>
      )}

      {/* Context */}
      <div style={{ fontSize: 10.5, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{t('mod.queue.context')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12.5, color: m.ink70, fontFamily: m.mono, marginBottom: 14 }}>
        <div>• {t('mod.queue.contextReason')} <span style={{ color: m.ink }}>{report.reason.replace(/_/g, ' ')}</span></div>
        <div>• {t('mod.queue.contextStatus')} <span style={{ color: m.ink }}>{report.status}</span></div>
        <div>• {t('mod.queue.contextSession')} <span style={{ color: m.ink }}>{report.sourceId.slice(0, 12)}…</span></div>
      </div>

      {/* Resolution (only for OPEN) */}
      {report.status === 'OPEN' && (
        <div style={{ marginTop: 'auto', borderTop: `1px solid ${m.ink10}`, paddingTop: 14 }}>
          <div style={{ fontSize: 10.5, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{t('mod.queue.resolution')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 10 }}>
            {ACTIONS.map((a) => (
              <label key={a.key} style={{
                display: 'grid', gridTemplateColumns: '16px 1fr', gap: 8,
                padding: '8px 10px',
                border: `1px solid ${actions[a.key] ? m.accent : m.ink10}`,
                background: actions[a.key] ? m.accentSoft : 'transparent',
                borderRadius: 6, fontSize: 12.5, alignItems: 'center', cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={!!actions[a.key]}
                  onChange={(e) => setActions((prev) => ({ ...prev, [a.key]: e.target.checked }))}
                  style={{ width: 14, height: 14, accentColor: m.accent }}
                />
                <span>
                  <div style={{ fontWeight: 500, color: actions[a.key] ? m.accent : m.ink }}>{t(`mod.queue.actions.${a.key}`)}</div>
                  <div style={{ fontSize: 11, color: m.ink50, fontFamily: m.mono, marginTop: 1 }}>{t(`mod.queue.actions.${a.key}Desc`)}</div>
                </span>
              </label>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('mod.queue.notesPlaceholder')}
            style={{
              width: '100%', padding: '10px 12px', background: m.bg,
              color: m.ink, border: `1px solid ${m.ink20}`, borderRadius: 8,
              fontSize: 12.5, fontFamily: m.font, outline: 'none',
              minHeight: 50, resize: 'vertical', lineHeight: 1.5, marginBottom: 10,
              boxSizing: 'border-box',
            }}
          />
          {submitError && <div style={{ color: MOD_RED, fontSize: 12, fontFamily: m.mono, marginBottom: 8 }}>{submitError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onResolve} disabled={submitting} style={{
              flex: 1, background: m.ink, color: m.bg, border: 'none',
              padding: 11, borderRadius: 7, fontSize: 13, fontFamily: m.font,
              fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
            }}>
              {submitting ? t('mod.queue.saving') : t('mod.queue.resolveCta')}
            </button>
            <button type="button" onClick={onDismiss} disabled={submitting} style={{
              background: 'transparent', color: m.ink,
              border: `1px solid ${m.ink20}`, padding: '11px 14px',
              borderRadius: 7, fontSize: 13, fontFamily: m.font,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}>
              {t('mod.queue.dismissCta')}
            </button>
          </div>
        </div>
      )}

      {report.status !== 'OPEN' && (
        <div style={{ marginTop: 'auto', borderTop: `1px solid ${m.ink10}`, paddingTop: 14, color: m.ink50, fontFamily: m.mono, fontSize: 12 }}>
          {t('mod.queue.reportClosed', { status: report.status.toLowerCase(), date: report.resolvedAt ? new Date(report.resolvedAt).toLocaleDateString() : '' })}
        </div>
      )}
    </div>
  );
}

function PartyCard({ m, label, profile, userId, warn }) {
  return (
    <div style={{ padding: 12, border: `1px solid ${m.ink10}`, borderRadius: 8 }}>
      <div style={{ fontSize: 10.5, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <Link to={`/mod/users/${userId}`} style={{ display: 'block', fontSize: 13.5, fontWeight: 500, marginTop: 4, color: m.ink, textDecoration: 'none' }}>
        {profile?.displayName ?? userId.slice(0, 8) + '…'}
      </Link>
      <div style={{ fontSize: 11.5, color: warn ? '#c98a3b' : m.ink50, fontFamily: m.mono }}>
        {profile?.rating != null ? `${Number(profile.rating).toFixed(1)} ★` : '—'}
      </div>
    </div>
  );
}
