import { useEffect, useMemo, useState } from 'react';
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
  { key: 'all',       label: 'All',       statuses: null },
  { key: 'upcoming',  label: 'Upcoming',  statuses: ['SCHEDULED', 'ACTIVE'] },
  { key: 'completed', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED'] },
];

export default function Sessions() {
  const { m } = useTheme();
  const { user } = useAuth();
  const userId = user?.sub;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
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
    const c = { all: sessions.length };
    for (const f of FILTERS.slice(1)) {
      c[f.key] = sessions.filter((s) => f.statuses.includes(s.status)).length;
    }
    return c;
  }, [sessions]);

  async function handleStatusChange(sessionId, newStatus) {
    try {
      const updated = await sessionsApi.updateSessionStatus(sessionId, newStatus);
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

  async function handleReviewSubmitted(reviewedSession) {
    setReviewModal(null);
    // No flag on SessionResponse for "I reviewed it" — we just close the modal.
    // Backend rejects duplicates with 409, so retrying is safe.
  }

  if (loading) return <Centered m={m} title="Loading sessions…" />;
  if (error) return <Centered m={m} title="Couldn't load sessions" subtitle={error} />;

  return (
    <div style={{ padding: '24px 40px' }}>
      <Header m={m} counts={counts} filter={filter} onFilter={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState m={m} filter={filter} totalSessions={sessions.length} />
      ) : (
        <SessionsTable
          m={m}
          sessions={filtered}
          userId={userId}
          onJoin={handleJoin}
          onCancel={(id) => handleStatusChange(id, 'CANCELLED')}
          onComplete={(id) => handleStatusChange(id, 'COMPLETED')}
          onReview={(s) => setReviewModal(s)}
          onReport={(s) => setReportModal(s)}
        />
      )}

      {reviewModal && (
        <ReviewModal
          m={m}
          session={reviewModal}
          userId={userId}
          onClose={() => setReviewModal(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      {reportModal && (
        <ReportModal
          m={m}
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

function Header({ m, counts, filter, onFilter }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>
          My sessions
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
              {f.label} <span style={{ color: m.ink50 }}>{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 13, color: m.ink50, marginBottom: 18 }}>
        {counts.all} total · {counts.upcoming} upcoming · {counts.completed} completed
      </div>
    </>
  );
}

// ─── Table ──────────────────────────────────────────────────────

const COLS = '110px 200px 1fr 100px 130px 220px';

function SessionsTable({ m, sessions, userId, onJoin, onCancel, onComplete, onReview, onReport }) {
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
        <span>Status</span>
        <span>When</span>
        <span>Skill / role</span>
        <span>Cost</span>
        <span>Tokens</span>
        <span style={{ textAlign: 'right' }}>Action</span>
      </div>
      {sessions.map((s, i) => (
        <SessionRow
          key={s.id}
          m={m}
          session={s}
          userId={userId}
          isLast={i === sessions.length - 1}
          onJoin={() => onJoin(s.id)}
          onCancel={() => onCancel(s.id)}
          onComplete={() => onComplete(s.id)}
          onReview={() => onReview(s)}
          onReport={() => onReport(s)}
        />
      ))}
    </div>
  );
}

function SessionRow({ m, session, userId, isLast, onJoin, onCancel, onComplete, onReview, onReport }) {
  const isTeacher = session.teacherId === userId;
  const role = isTeacher ? 'teach' : 'learn';
  const otherUserId = isTeacher ? session.learnerId : session.teacherId;
  const cost = isTeacher ? `+${session.durationTokens}` : `−${session.durationTokens}`;
  const costColor = isTeacher ? m.accent : m.ink;
  const st = STATUS_STYLE(m, session.status);

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
            · you {role}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>
          with {shortId(otherUserId)}
        </div>
      </div>
      <span style={{ fontFamily: m.mono, fontSize: 13, color: costColor }}>{cost} cr</span>
      <span style={{ fontFamily: m.mono, fontSize: 11.5, color: m.ink70 }}>
        {session.durationTokens} {session.durationTokens === 1 ? 'token' : 'tokens'}
      </span>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
        {(session.status === 'SCHEDULED' || session.status === 'ACTIVE') && (
          <button type="button" onClick={onJoin} style={btnPrimary(m)}>
            Join call →
          </button>
        )}
        {session.status === 'SCHEDULED' && (
          <button type="button" onClick={onCancel} style={btnSecondary(m)}>
            Cancel
          </button>
        )}
        {session.status === 'ACTIVE' && (
          <button type="button" onClick={onComplete} style={btnSecondary(m)}>
            Complete
          </button>
        )}
        {session.status === 'COMPLETED' && (
          <button type="button" onClick={onReview} style={btnPrimary(m)}>
            Leave review →
          </button>
        )}
        {(session.status === 'COMPLETED' || session.status === 'CANCELLED') && (
          <button type="button" onClick={onReport} style={btnReport(m)} title="Report incident">
            Report
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Review modal ───────────────────────────────────────────────

function ReviewModal({ m, session, userId, onClose, onSubmitted }) {
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
        <Eyebrow m={m}>Session completed · leave a review</Eyebrow>
        <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 500, margin: '0 0 6px' }}>
          How was {isTeacher ? 'teaching' : 'learning'}{' '}
          <span style={{ fontStyle: 'italic' }}>{session.skillName}?</span>
        </h3>
        <p style={{ fontSize: 13.5, color: m.ink70, margin: '0 0 22px' }}>
          {isTeacher
            ? 'Your review helps the learner build a reputation.'
            : 'Reviews update the teacher\'s rating, which feeds back into the matching algorithm.'}
        </p>

        {error && <ErrorBanner m={m} message={error} />}

        <form onSubmit={handleSubmit}>
          {/* Star rating */}
          <Eyebrow m={m}>Rating</Eyebrow>
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
              {rating} / 5 — {RATING_LABELS[rating]}
            </span>
          </div>

          <Eyebrow m={m}>Comment (optional · 2000 chars max)</Eyebrow>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="What went well? What could improve?"
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
              {submitting ? 'Submitting…' : 'Submit review →'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ ...btnSecondary(m), padding: '12px 16px', fontSize: 14 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const RATING_LABELS = { 1: 'poor', 2: 'fair', 3: 'good', 4: 'great', 5: 'excellent' };

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

const REPORT_REASONS = [
  { value: 'HARASSMENT',    label: 'Harassment / threats / intimidation' },
  { value: 'HATE_SPEECH',   label: 'Hate speech / racism / discrimination' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate content (sexual, violent)' },
  { value: 'NO_SHOW',       label: 'Did not show up or left immediately' },
  { value: 'OFF_TOPIC',     label: 'Different skill than agreed' },
  { value: 'SCAM',          label: 'Scam / off-platform payment request' },
  { value: 'OTHER',         label: 'Other (please describe in comment)' },
];

function ReportModal({ m, session, userId, onClose, onSubmitted }) {
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
        <Eyebrow m={m}>Trust &amp; safety · report incident</Eyebrow>
        <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 500, margin: '0 0 6px' }}>
          Report user-{otherUserId.slice(0, 8)}
        </h3>
        <p style={{ fontSize: 13.5, color: m.ink70, margin: '0 0 22px', lineHeight: 1.5 }}>
          Reports are reviewed by a moderator. Repeated reports against the same user
          lead to account flagging. We do not record calls — your description below is
          all the moderator sees.
        </p>

        {error && <ErrorBanner m={m} message={error} />}

        <form onSubmit={handleSubmit}>
          <Eyebrow m={m}>Reason</Eyebrow>
          <div style={{ display: 'grid', gap: 6, marginBottom: 22 }}>
            {REPORT_REASONS.map((r) => (
              <label
                key={r.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${reason === r.value ? m.ink : m.ink20}`,
                  background: reason === r.value ? m.ink10 : 'transparent',
                  cursor: 'pointer',
                  fontSize: 13.5,
                }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  style={{ accentColor: m.ink, margin: 0 }}
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          <Eyebrow m={m}>What happened? (optional · 2000 chars)</Eyebrow>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="A brief description helps the moderator decide quickly."
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
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ ...btnSecondary(m), padding: '12px 16px', fontSize: 14 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────

function EmptyState({ m, filter, totalSessions }) {
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
          No sessions yet.
        </div>
        <div style={{ fontSize: 13.5, color: m.ink70, lineHeight: 1.5 }}>
          Once you accept a match, the partner books a session
          <br />
          and it appears here.
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
      No sessions match the "{filter}" filter.
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

function STATUS_STYLE(m, status) {
  switch (status) {
    case 'ACTIVE':
      return { bg: m.accent, color: '#fff', label: '● LIVE' };
    case 'SCHEDULED':
      return { bg: m.ink, color: m.bg, label: 'UPCOMING' };
    case 'COMPLETED':
      return { bg: m.ink10, color: m.ink, label: 'COMPLETED' };
    case 'CANCELLED':
      return { bg: 'transparent', color: m.ink50, label: 'CANCELLED' };
    default:
      return { bg: m.ink10, color: m.ink70, label: status };
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
