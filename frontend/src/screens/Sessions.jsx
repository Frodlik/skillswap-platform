import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as sessionsApi from '../api/sessions.js';
import { formatWhen, durationLabel } from '../utils/format.js';

// /sessions — list of all sessions where I'm either teacher or learner.
// Adapted from frontend/directions/minimal-account.jsx · MinMySessions.
//
// Status flow:   SCHEDULED → ACTIVE → COMPLETED
//                       └→ CANCELLED  (terminal)
//
// SessionLifecycleScheduler in session-service auto-flips SCHEDULED→ACTIVE
// when scheduledAt is in the past, and ACTIVE→COMPLETED after duration.
// We can also force COMPLETED manually (useful for the demo) and CANCEL
// any non-terminal session.
//
// Per-row actions (driven by status):
//   SCHEDULED → [Cancel]
//   ACTIVE    → [Mark complete]
//   COMPLETED → [Leave review]   (backend rejects duplicates with 409)
//   CANCELLED → —

const FILTERS = [
  { key: 'upcoming',  labelKey: 'sessions.filter.upcoming',  statuses: ['PROPOSED', 'SCHEDULED', 'ACTIVE'] },
  { key: 'completed', labelKey: 'sessions.filter.completed', statuses: ['COMPLETED'] },
  { key: 'cancelled', labelKey: 'sessions.filter.cancelled', statuses: ['CANCELLED', 'REJECTED'] },
  { key: 'all',       labelKey: 'sessions.filter.all',       statuses: null },
];

export default function Sessions() {
  const { m } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.sub;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('upcoming');
  const [reviewModal, setReviewModal] = useState(null); // session being reviewed
  const [reportModal, setReportModal] = useState(null); // session being reported

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const page = await sessionsApi.getUserSessions(userId);
        if (!cancelled) setSessions(page.content || []);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const filtered = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter);
    if (!f?.statuses) return sessions;
    return sessions.filter((s) => f.statuses.includes(s.status));
  }, [sessions, filter]);

  const counts = useMemo(() => {
    const c = {};
    for (const f of FILTERS) {
      c[f.key] = f.statuses
        ? sessions.filter((s) => f.statuses.includes(s.status)).length
        : sessions.length;
    }
    return c;
  }, [sessions]);

  async function handleStatusChange(sessionId, newStatus) {
    try {
      const updated = await sessionsApi.updateSessionStatus(sessionId, newStatus, userId);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  // Opens the Jitsi Meet room in a new tab. Both teacher and learner hitting
  // this endpoint get the same deterministic URL → they land in the same room.
  async function handleJoin(sessionId) {
    try {
      const { url } = await sessionsApi.getRoom(sessionId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  // Consent flow: invitee responds to a PROPOSED session.
  async function handleAccept(sessionId) {
    try {
      const updated = await sessionsApi.acceptProposal(sessionId, userId);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleDecline(sessionId) {
    try {
      const updated = await sessionsApi.declineProposal(sessionId, userId);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  async function handleReviewSubmitted(reviewedSession) {
    setReviewModal(null);
    // No flag on SessionResponse for "I reviewed it" — we just close the modal.
    // Backend rejects duplicates with 409, so retrying is safe.
  }

  if (loading) return <Centered m={m} title={t('sessions.loading')} />;
  if (error) return <Centered m={m} title={t('sessions.loadError')} subtitle={error} />;

  return (
    <div style={{ padding: '24px 40px' }}>
      <Header m={m} t={t} counts={counts} filter={filter} onFilter={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState m={m} t={t} filter={filter} totalSessions={sessions.length} />
      ) : (
        <SessionsTable
          m={m}
          t={t}
          sessions={filtered}
          userId={userId}
          onJoin={handleJoin}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onCancel={(id) => handleStatusChange(id, 'CANCELLED')}
          onComplete={(id) => handleStatusChange(id, 'COMPLETED')}
          onReview={(s) => setReviewModal(s)}
          onReport={(s) => setReportModal(s)}
        />
      )}

      {reviewModal && (
        <ReviewModal
          m={m}
          t={t}
          session={reviewModal}
          userId={userId}
          onClose={() => setReviewModal(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      {reportModal && (
        <ReportModal
          m={m}
          t={t}
          session={reportModal}
          userId={userId}
          onClose={() => setReportModal(null)}
          onSubmitted={() => setReportModal(null)}
        />
      )}
    </div>
  );
}

// ─── Header + filter tabs ───────────────────────────────────────

function Header({ m, t, counts, filter, onFilter }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>
          {t('sessions.title')}
        </h2>
        <div style={{ display: 'flex', gap: 6, fontSize: 12, fontFamily: m.mono }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilter(f.key)}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                background: filter === f.key ? m.ink10 : 'transparent',
                color: filter === f.key ? m.ink : m.ink70,
                border: 'none',
                cursor: 'pointer',
                fontFamily: m.mono,
                fontSize: 12,
              }}
            >
              {t(f.labelKey)} <span style={{ color: m.ink50 }}>{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 13, color: m.ink50, marginBottom: 18 }}>
        {t('sessions.summary', { all: counts.all, up: counts.upcoming, done: counts.completed })}
      </div>
    </>
  );
}

// ─── Table ──────────────────────────────────────────────────────

const COLS = '110px 200px 1fr 100px 130px 220px';

function SessionsTable({ m, t, sessions, userId, onJoin, onAccept, onDecline, onCancel, onComplete, onReview, onReport }) {
  return (
    <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: COLS,
          padding: '10px 18px',
          background: m.bg,
          fontSize: 11,
          fontFamily: m.mono,
          color: m.ink50,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderBottom: `1px solid ${m.ink10}`,
        }}
      >
        <span>{t('sessions.table.status')}</span>
        <span>{t('sessions.table.when')}</span>
        <span>{t('sessions.table.skill')}</span>
        <span>{t('sessions.table.cost')}</span>
        <span>{t('sessions.table.tokens')}</span>
        <span style={{ textAlign: 'right' }}>{t('sessions.table.action')}</span>
      </div>
      {sessions.map((s, i) => (
        <SessionRow
          key={s.id}
          m={m}
          t={t}
          session={s}
          userId={userId}
          isLast={i === sessions.length - 1}
          onJoin={() => onJoin(s.id)}
          onAccept={() => onAccept(s.id)}
          onDecline={() => onDecline(s.id)}
          onCancel={() => onCancel(s.id)}
          onComplete={() => onComplete(s.id)}
          onReview={() => onReview(s)}
          onReport={() => onReport(s)}
        />
      ))}
    </div>
  );
}

function SessionRow({ m, t, session, userId, isLast, onJoin, onAccept, onDecline, onCancel, onComplete, onReview, onReport }) {
  const isTeacher = session.teacherId === userId;
  const roleText = isTeacher ? t('sessions.table.youRoleTeach') : t('sessions.table.youRoleLearn');
  const otherUserId = isTeacher ? session.learnerId : session.teacherId;
  const cost = isTeacher ? `+${session.durationTokens}` : `−${session.durationTokens}`;
  const costColor = isTeacher ? m.accent : m.ink;
  const st = STATUS_STYLE(m, session.status, t);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLS,
        padding: '14px 18px',
        alignItems: 'center',
        fontSize: 13.5,
        borderBottom: isLast ? 'none' : `1px solid ${m.ink10}`,
      }}
    >
      <span
        style={{
          fontFamily: m.mono,
          fontSize: 10,
          padding: '3px 8px',
          borderRadius: 4,
          background: st.bg,
          color: st.color,
          justifySelf: 'start',
          letterSpacing: '0.06em',
        }}
      >
        {st.label}
      </span>
      <div>
        <div style={{ fontSize: 13.5 }}>{formatWhen(session.scheduledAt)}</div>
        <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>
          {durationLabel(session.durationTokens)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 13.5 }}>
          {session.skillName}{' '}
          <span style={{ color: m.ink50, fontFamily: m.mono, fontSize: 11.5 }}>
            · {roleText}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>
          {t('sessions.table.with')}{' '}
          <Link
            to={`/users/${otherUserId}`}
            style={{ color: m.ink70, textDecoration: 'none', borderBottom: `1px dashed ${m.ink20}` }}
          >
            {shortId(otherUserId)}
          </Link>
        </div>
      </div>
      <span style={{ fontFamily: m.mono, fontSize: 13, color: costColor }}>{cost} {t('sessions.table.creditsShort')}</span>
      <span style={{ fontFamily: m.mono, fontSize: 11.5, color: m.ink70 }}>
        {t('common.tokens', { count: session.durationTokens })}
      </span>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
        {session.status === 'PROPOSED' && session.proposerId === userId && (
          <>
            <span style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, alignSelf: 'center' }}>
              {t('sessions.action.awaiting')}
            </span>
            <button type="button" onClick={onCancel} style={btnSecondary(m)}>
              {t('sessions.action.cancel')}
            </button>
          </>
        )}
        {session.status === 'PROPOSED' && session.proposerId !== userId && (
          <>
            <button type="button" onClick={onAccept} style={btnPrimary(m)}>
              {t('sessions.action.accept')}
            </button>
            <button type="button" onClick={onDecline} style={btnSecondary(m)}>
              {t('sessions.action.decline')}
            </button>
          </>
        )}
        {(session.status === 'SCHEDULED' || session.status === 'ACTIVE') && (
          <button type="button" onClick={onJoin} style={btnPrimary(m)}>
            {t('sessions.action.join')}
          </button>
        )}
        {session.status === 'SCHEDULED' && (
          <button type="button" onClick={onCancel} style={btnSecondary(m)}>
            {t('sessions.action.cancel')}
          </button>
        )}
        {session.status === 'ACTIVE' && (
          <button type="button" onClick={onComplete} style={btnSecondary(m)}>
            {t('sessions.action.complete')}
          </button>
        )}
        {session.status === 'ACTIVE' && isTeacher && (
          <button type="button" onClick={onCancel} style={btnSecondary(m)}>
            {t('sessions.action.cancel')}
          </button>
        )}
        {session.status === 'COMPLETED' && (
          <button type="button" onClick={onReview} style={btnPrimary(m)}>
            {t('sessions.action.review')}
          </button>
        )}
        {(session.status === 'COMPLETED' || session.status === 'CANCELLED' || session.status === 'REJECTED') && (
          <button type="button" onClick={onReport} style={btnReport(m)} title={t('sessions.action.reportTitle')}>
            {t('sessions.action.report')}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Review modal ───────────────────────────────────────────────

function ReviewModal({ m, t, session, userId, onClose, onSubmitted }) {
  const isTeacher = session.teacherId === userId;
  const revieweeId = isTeacher ? session.learnerId : session.teacherId;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await sessionsApi.submitReview(session.id, {
        reviewerId: userId,
        revieweeId,
        rating,
        comment: comment.trim(),
      });
      onSubmitted(session);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSubmitting(false);
    }
  }

  // Esc closes
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalStyle(m)}>
        <Eyebrow m={m}>{t('sessions.review.eyebrow')}</Eyebrow>
        <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 500, margin: '0 0 6px' }}>
          {isTeacher ? t('sessions.review.howTeaching') : t('sessions.review.howLearning')}{' '}
          <span style={{ fontStyle: 'italic' }}>{session.skillName}?</span>
        </h3>
        <p style={{ fontSize: 13.5, color: m.ink70, margin: '0 0 22px' }}>
          {isTeacher ? t('sessions.review.bodyTeacher') : t('sessions.review.bodyLearner')}
        </p>

        {error && <ErrorBanner m={m} message={error} />}

        <form onSubmit={handleSubmit}>
          {/* Star rating */}
          <Eyebrow m={m}>{t('sessions.review.rating')}</Eyebrow>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 22 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 30,
                  lineHeight: 1,
                  color: n <= rating ? m.accent : m.ink20,
                }}
              >
                ★
              </button>
            ))}
            <span style={{ fontFamily: m.mono, fontSize: 13, color: m.ink70, marginLeft: 8 }}>
              {t('sessions.review.ratingLabel', { rating, label: t(`sessions.review.ratingLabels.${rating}`) })}
            </span>
          </div>

          <Eyebrow m={m}>{t('sessions.review.commentLabel')}</Eyebrow>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder={t('sessions.review.commentPlaceholder')}
            style={textareaStyle(m)}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...btnPrimary(m),
                flex: 1,
                padding: '12px',
                fontSize: 14,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'wait' : 'pointer',
              }}
            >
              {submitting ? t('sessions.review.submitting') : t('sessions.review.submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ ...btnSecondary(m), padding: '12px 16px', fontSize: 14 }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Report modal ───────────────────────────────────────────────
//
// Trust & Safety: lets a participant flag the OTHER side of a session for
// abuse, no-shows, etc. The platform does NOT record calls (privacy +
// GDPR), so reports are user-driven and reviewed by a human moderator.
//
// Backend rejects:
//   - reports on SCHEDULED/ACTIVE sessions (status check) → 409
//   - duplicate reports from the same reporter on same session → 409
//   - reports from a non-participant → 400

const REPORT_REASON_KEYS = [
  'HARASSMENT',
  'HATE_SPEECH',
  'INAPPROPRIATE',
  'NO_SHOW',
  'OFF_TOPIC',
  'SCAM',
  'OTHER',
];

function ReportModal({ m, t, session, userId, onClose, onSubmitted }) {
  const isTeacher = session.teacherId === userId;
  const otherUserId = isTeacher ? session.learnerId : session.teacherId;

  const [reason, setReason] = useState('HARASSMENT');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await sessionsApi.submitReport(session.id, {
        reporterId: userId,
        reason,
        comment: comment.trim(),
      });
      onSubmitted(session);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSubmitting(false);
    }
  }

  // Esc closes
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalStyle(m)}>
        <Eyebrow m={m}>{t('sessions.report.eyebrow')}</Eyebrow>
        <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 500, margin: '0 0 6px' }}>
          {t('sessions.report.title', { user: `user-${otherUserId.slice(0, 8)}` })}
        </h3>
        <p style={{ fontSize: 13.5, color: m.ink70, margin: '0 0 22px', lineHeight: 1.5 }}>
          {t('sessions.report.body')}
        </p>

        {error && <ErrorBanner m={m} message={error} />}

        <form onSubmit={handleSubmit}>
          <Eyebrow m={m}>{t('sessions.report.reason')}</Eyebrow>
          <div style={{ display: 'grid', gap: 6, marginBottom: 22 }}>
            {REPORT_REASON_KEYS.map((k) => (
              <label
                key={k}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${reason === k ? m.ink : m.ink20}`,
                  background: reason === k ? m.ink10 : 'transparent',
                  cursor: 'pointer',
                  fontSize: 13.5,
                }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={k}
                  checked={reason === k}
                  onChange={() => setReason(k)}
                  style={{ accentColor: m.ink, margin: 0 }}
                />
                <span>{t(`sessions.report.reasons.${k}`)}</span>
              </label>
            ))}
          </div>

          <Eyebrow m={m}>{t('sessions.report.commentLabel')}</Eyebrow>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder={t('sessions.report.commentPlaceholder')}
            style={textareaStyle(m)}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...btnPrimary(m),
                flex: 1,
                padding: '12px',
                fontSize: 14,
                background: '#902020',
                color: '#fff',
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'wait' : 'pointer',
              }}
            >
              {submitting ? t('sessions.report.submitting') : t('sessions.report.submit')}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ ...btnSecondary(m), padding: '12px 16px', fontSize: 14 }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────

function EmptyState({ m, t, filter, totalSessions }) {
  if (totalSessions === 0) {
    return (
      <div
        style={{
          border: `1px dashed ${m.ink20}`,
          borderRadius: 10,
          padding: 48,
          textAlign: 'center',
          color: m.ink50,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 500, color: m.ink, marginBottom: 6 }}>
          {t('sessions.empty.noneTitle')}
        </div>
        <div style={{ fontSize: 13.5, color: m.ink70, lineHeight: 1.5 }}>
          {t('sessions.empty.noneBody')}
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        border: `1px dashed ${m.ink20}`,
        borderRadius: 10,
        padding: 32,
        textAlign: 'center',
        color: m.ink50,
        fontSize: 13.5,
      }}
    >
      {t('sessions.empty.filterMismatch', { filter: t(`sessions.filter.${filter}`) })}
    </div>
  );
}

// ─── Atoms / helpers ────────────────────────────────────────────

function Eyebrow({ m, children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontFamily: m.mono,
        color: m.ink50,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
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
      }}
    >
      {message}
    </div>
  );
}

function Centered({ m, title, subtitle }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '160px 40px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 500, color: m.ink }}>{title}</div>
        {subtitle && (
          <div style={{ marginTop: 8, fontSize: 13, color: m.ink50, fontFamily: m.mono }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function STATUS_STYLE(m, status, t) {
  const label = t ? t(`sessions.badge.${status}`, status) : status;
  switch (status) {
    case 'PROPOSED':
      return { bg: '#fff5d8', color: '#8a6d00', label };
    case 'ACTIVE':
      return { bg: m.accent, color: '#fff', label };
    case 'SCHEDULED':
      return { bg: m.ink, color: m.bg, label };
    case 'COMPLETED':
      return { bg: m.ink10, color: m.ink, label };
    case 'REJECTED':
      return { bg: 'transparent', color: m.ink50, label };
    case 'CANCELLED':
      return { bg: 'transparent', color: m.ink50, label };
    default:
      return { bg: m.ink10, color: m.ink70, label };
  }
}

function shortId(uuid) {
  return uuid ? `user-${uuid.slice(0, 8)}` : '?';
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 100,
};

const modalStyle = (m) => ({
  width: 560,
  maxWidth: '92vw',
  background: m.panel,
  color: m.ink,
  fontFamily: m.font,
  borderRadius: 12,
  boxShadow: `0 20px 60px ${m.ink20}`,
  padding: 28,
});

const textareaStyle = (m) => ({
  width: '100%',
  padding: '12px 14px',
  background: m.bg,
  color: m.ink,
  border: `1px solid ${m.ink20}`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: m.font,
  outline: 'none',
  resize: 'vertical',
  minHeight: 90,
  lineHeight: 1.5,
});

const btnPrimary = (m) => ({
  background: m.ink,
  color: m.bg,
  border: 'none',
  padding: '6px 12px',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: m.font,
  fontWeight: 500,
  cursor: 'pointer',
});

const btnSecondary = (m) => ({
  background: m.panel,
  color: m.ink,
  border: `1px solid ${m.ink20}`,
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: m.font,
  cursor: 'pointer',
});

// Tertiary "report" button — visually subdued (not red) so it doesn't compete
// with the primary action. Hover state would highlight; we skip that for
// simplicity since we use inline styles, not CSS.
const btnReport = (m) => ({
  background: 'transparent',
  color: m.ink50,
  border: `1px solid ${m.ink10}`,
  padding: '6px 10px',
  borderRadius: 6,
  fontSize: 11,
  fontFamily: m.mono,
  cursor: 'pointer',
});
