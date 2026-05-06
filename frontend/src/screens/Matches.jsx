import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as matchesApi from '../api/matches.js';
import * as usersApi from '../api/users.js';
import * as sessionsApi from '../api/sessions.js';
import AvailabilityCalendar from '../components/AvailabilityCalendar.jsx';

// THE main thesis screen: weighted matching with a transparent breakdown.
// Adapted from frontend/directions/minimal-screens.jsx · MinMatch.
//
// Three-pane layout:
//   Left    — weights of the algorithm (educational; explains the scoring)
//   Middle  — ranked list of candidates returned by matching-service
//   Right   — score-by-score breakdown of the selected candidate
//
// Data flow on mount:
//   1. GET /matches/suggestions/{me}        → list of MatchSuggestion
//   2. For each suggestion, GET /users/{candidateId}  (parallel, errors swallowed)
//   3. Merge profiles into the suggestions  → render
//
// Selected candidate is local UI state. First in the list is selected by default.
// Accept/Decline send POST and remove the row from the list.

// Map from backend scorer.name → human-readable label for the UI.
const SCORER_LABELS = {
  'skill-match':  'Skill match',
  'jaccard':      'Tag overlap',
  'reciprocity':  'Reciprocity',
  'availability': 'Schedule overlap',
  'language':     'Language',
  'rating':       'Rating',
  'timezone':     'Timezone',
};

// Default weights from matching-service application.yml. Used in the LEFT pane
// to teach the user how the algorithm is balanced. If the user changes
// `MATCHING_W_*` env vars on the backend, this will drift — for the diploma
// MVP we accept that. A future improvement is exposing the weights via an
// API endpoint and reading them dynamically.
const DEFAULT_WEIGHTS = [
  { name: 'skill-match',  weight: 0.30 },
  { name: 'jaccard',      weight: 0.20 },
  { name: 'availability', weight: 0.15 },
  { name: 'reciprocity',  weight: 0.10 },
  { name: 'language',     weight: 0.10 },
  { name: 'rating',       weight: 0.10 },
  { name: 'timezone',     weight: 0.05 },
];

export default function Matches() {
  const { m } = useTheme();
  const { user } = useAuth();
  const userId = user?.sub;

  const [suggestions, setSuggestions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(false);   // accept/decline in flight
  const [scheduleModal, setScheduleModal] = useState(null); // suggestion to book

  // Fetch on mount + whenever the logged-in userId changes.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const list = await matchesApi.getSuggestions(userId, 10);
        // Enrich each candidate with its profile (parallel, fault-tolerant)
        const profiles = await usersApi.getProfiles(list.map((s) => s.userId));
        const enriched = list.map((s, i) => ({ ...s, profile: profiles[i] }));
        if (!cancelled) {
          setSuggestions(enriched);
          setSelectedId(enriched[0]?.matchId || null);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    // Cleanup: if the component unmounts mid-fetch (user navigates away),
    // we set `cancelled = true` so the fetch result is ignored.
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Accept the match AND open the scheduling modal in one click.
  // (Accepting a match without booking would leave it in a half-state.)
  async function handleAcceptAndSchedule(suggestion) {
    setActing(true);
    try {
      await matchesApi.acceptMatch(suggestion.matchId);
      setScheduleModal(suggestion);
    } catch (err) {
      // 409 means it was already accepted earlier — still let them schedule.
      if (err.response?.status === 409) {
        setScheduleModal(suggestion);
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setActing(false);
    }
  }

  function handleScheduled(suggestion) {
    setScheduleModal(null);
    removeRow(suggestion.matchId);
  }

  async function handleDecline(matchId) {
    setActing(true);
    try {
      await matchesApi.declineMatch(matchId);
      removeRow(matchId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  }

  function removeRow(matchId) {
    setSuggestions((prev) => {
      const next = prev.filter((s) => s.matchId !== matchId);
      // If we just removed the selected row, jump to the new top of the list.
      setSelectedId((curr) => (curr === matchId ? next[0]?.matchId || null : curr));
      return next;
    });
  }

  // ─── Render branches ─────────────────────────────────────────
  if (loading) return <CenteredMessage m={m} title="Loading matches…" />;
  if (error) return <CenteredMessage m={m} title="Couldn't load matches" subtitle={error} />;
  if (suggestions.length === 0) return <EmptyState m={m} />;

  const selected = suggestions.find((s) => s.matchId === selectedId) || suggestions[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 380px', minHeight: 'calc(100vh - 65px)' }}>
      <LeftPane m={m} count={suggestions.length} />
      <CandidatesList
        m={m}
        suggestions={suggestions}
        selectedId={selected.matchId}
        onSelect={setSelectedId}
      />
      <SelectedDetail
        m={m}
        suggestion={selected}
        acting={acting}
        onAccept={() => handleAcceptAndSchedule(selected)}
        onDecline={() => handleDecline(selected.matchId)}
      />

      {scheduleModal && (
        <ScheduleSessionModal
          m={m}
          suggestion={scheduleModal}
          userId={userId}
          onClose={() => setScheduleModal(null)}
          onScheduled={() => handleScheduled(scheduleModal)}
        />
      )}
    </div>
  );
}

// ─── Schedule session modal ─────────────────────────────────────

function ScheduleSessionModal({ m, suggestion, userId, onClose, onScheduled }) {
  // Pick a sensible default datetime: tomorrow at 17:00 local time, formatted
  // for <input type="datetime-local"> which wants `YYYY-MM-DDTHH:mm`.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 0, 0, 0);
  const defaultDateTime = toDatetimeLocalString(tomorrow);

  const [role, setRole] = useState('learn');         // 'learn' | 'teach'
  const [skillName, setSkillName] = useState('');
  const [scheduledAt, setScheduledAt] = useState(defaultDateTime);
  const [duration, setDuration] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Calendar context — fetched on mount, never refetched (modal is short-lived).
  const [busySlots, setBusySlots] = useState([]);
  const [theirSchedule, setTheirSchedule] = useState(null);

  // Pull the OTHER user's busy slots and availability schedule once.
  // We grab a 7-day window starting today (matching the calendar grid).
  // Both fetches are .catch'd to null/empty so the calendar still renders
  // — degraded — if a service is down.
  useEffect(() => {
    let cancelled = false;
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);

    async function load() {
      const [slots, prefs] = await Promise.all([
        sessionsApi.getBusySlots(suggestion.userId, from, to).catch(() => []),
        usersApi.getPreferences(suggestion.userId).catch(() => null),
      ]);
      if (cancelled) return;
      setBusySlots(slots || []);
      // availabilitySchedule is stored as a JSON string. Parse here so the
      // calendar component receives a ready-made object.
      try {
        if (prefs?.availabilitySchedule) {
          setTheirSchedule(JSON.parse(prefs.availabilitySchedule));
        }
      } catch { /* malformed JSON — leave schedule null, treated as always-available */ }
    }
    load();
    return () => { cancelled = true; };
  }, [suggestion.userId]);

  // Esc closes modal
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // When the user clicks a calendar cell, we update both the ISO state for
  // submit AND the datetime-local string fed into the <input>.
  function handleCalendarPick(date) {
    setScheduledAt(toDatetimeLocalString(date));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const teacherId = role === 'learn' ? suggestion.userId : userId;
      const learnerId = role === 'learn' ? userId : suggestion.userId;
      // proposerId is always the current user — they're the one clicking
      // the button. The OTHER participant becomes the invitee on the
      // backend side and must accept the proposal before the session
      // becomes SCHEDULED.
      await sessionsApi.createSession({
        matchId: suggestion.matchId,
        teacherId,
        learnerId,
        proposerId: userId,
        skillName: skillName.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationTokens: duration,
      });
      onScheduled();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSubmitting(false);
    }
  }

  const otherName = suggestion.profile?.displayName || `user-${suggestion.userId.slice(0, 8)}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          // Vertical layout with the form scrolling between a fixed header
          // and a sticky footer of action buttons. Without this the modal
          // overflows on FullHD laptops once the calendar is added — Submit
          // ends up below the fold and is impossible to reach.
          width: 540,
          maxWidth: '92vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: m.panel,
          color: m.ink,
          fontFamily: m.font,
          borderRadius: 12,
          boxShadow: `0 20px 60px ${m.ink20}`,
          overflow: 'hidden',  // children handle their own scroll
        }}
      >
        {/* Fixed header — eyebrow + title + error banner */}
        <div style={{ padding: '24px 28px 8px' }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: m.mono,
              color: m.ink50,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            Schedule a session
          </div>
          <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 500, margin: '0 0 8px' }}>
            With <span style={{ fontStyle: 'italic' }}>{otherName}</span>
          </h3>

          {error && (
            <div
              role="alert"
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: '#fee',
                color: '#902020',
                border: '1px solid #f3c0c0',
                fontSize: 13,
                marginTop: 10,
              }}
            >
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
        >
          {/* Scrollable middle. minHeight:0 + flex:1 + overflowY:auto is the
              flex idiom for "fill available space, scroll if too tall". */}
          <div style={{ padding: '8px 28px 18px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {/* Role toggle */}
          <FormLabel m={m}>Your role</FormLabel>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: m.ink10, borderRadius: 9, width: 'fit-content', marginBottom: 14 }}>
            <RoleOption m={m} active={role === 'learn'} onClick={() => setRole('learn')} label={`I'll learn from ${otherName.split(' ')[0]}`} />
            <RoleOption m={m} active={role === 'teach'} onClick={() => setRole('teach')} label={`I'll teach ${otherName.split(' ')[0]}`} />
          </div>

          {/* Skill name */}
          <FormLabel m={m}>What's being taught</FormLabel>
          <input
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            required
            placeholder="e.g. Conversational Spanish"
            style={inputStyle(m)}
          />

          {/* When + how long */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <FormLabel m={m}>Date & time</FormLabel>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                style={inputStyle(m)}
              />
            </div>
            <div>
              <FormLabel m={m}>Duration</FormLabel>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={inputStyle(m)}
              >
                {[1, 2, 3, 4].map((h) => (
                  <option key={h} value={h}>{h}h ({h} {h === 1 ? 'token' : 'tokens'})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar — shows when the other user is busy + when they marked
              themselves available. Click a green cell to populate the datetime
              input above. Visual is the headline UX fix that makes scheduling
              not feel blind. */}
          <div style={{ marginTop: 14 }}>
            <FormLabel m={m}>Their week</FormLabel>
            <AvailabilityCalendar
              busySlots={busySlots}
              schedule={theirSchedule}
              selected={scheduledAt ? new Date(scheduledAt) : null}
              durationHours={duration}
              onPick={handleCalendarPick}
            />
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: m.ink50, fontFamily: m.mono }}>
            {role === 'learn'
              ? `${duration} ${duration === 1 ? 'token' : 'tokens'} will be HELD from your wallet, transferred on completion.`
              : `${duration} ${duration === 1 ? 'token' : 'tokens'} will be HELD from ${otherName}'s wallet, paid to you on completion.`}
          </div>
          </div>{/* /scrollable middle */}

          {/* Sticky footer — buttons always visible regardless of how tall the
              form gets. Top border provides a clear separation when content
              above is mid-scroll. */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '14px 28px',
              borderTop: `1px solid ${m.ink10}`,
              background: m.panel,
            }}
          >
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                background: m.ink,
                color: m.bg,
                border: 'none',
                padding: '11px',
                borderRadius: 8,
                fontSize: 13.5,
                fontWeight: 500,
                fontFamily: m.font,
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Sending…' : 'Send invitation →'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                color: m.ink,
                border: `1px solid ${m.ink20}`,
                padding: '11px 14px',
                borderRadius: 8,
                fontSize: 13.5,
                fontFamily: m.font,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleOption({ m, active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? m.panel : 'transparent',
        color: m.ink,
        border: 'none',
        padding: '7px 14px',
        borderRadius: 6,
        cursor: 'pointer',
        fontFamily: m.font,
        fontWeight: 500,
        fontSize: 13,
        boxShadow: active ? `0 1px 2px ${m.ink10}` : 'none',
      }}
    >
      {label}
    </button>
  );
}

function FormLabel({ m, children }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: 11,
        fontFamily: m.mono,
        color: m.ink50,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

function inputStyle(m) {
  return {
    width: '100%',
    padding: '10px 12px',
    background: m.bg,
    color: m.ink,
    border: `1px solid ${m.ink20}`,
    borderRadius: 8,
    fontSize: 13.5,
    fontFamily: m.font,
    outline: 'none',
  };
}

// Convert a Date → "YYYY-MM-DDTHH:mm" string for <input type="datetime-local">.
// Browser expects local time, no timezone.
function toDatetimeLocalString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

// ─── LEFT PANE ──────────────────────────────────────────────────
// Educational. Shows the weights of every scorer so the user
// understands what the algorithm cares about.

function LeftPane({ m, count }) {
  return (
    <div style={{ borderRight: `1px solid ${m.ink10}`, padding: '24px 22px' }}>
      <Eyebrow m={m}>Algorithm weights</Eyebrow>
      <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>
        Why these matches
      </div>
      <div style={{ fontSize: 13, color: m.ink70, marginBottom: 22 }}>
        Each candidate is scored on seven factors. Sum of weights = 1.0.
      </div>

      {DEFAULT_WEIGHTS.map((w) => (
        <div key={w.name} style={{ marginBottom: 12, fontSize: 12.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: m.ink70 }}>{SCORER_LABELS[w.name] || w.name}</span>
            <span style={{ fontFamily: m.mono, color: m.ink50 }}>{w.weight.toFixed(2)}</span>
          </div>
          <Bar m={m} value={w.weight / 0.30 /* normalise to widest bar */} />
        </div>
      ))}

      <div style={{ height: 1, background: m.ink10, margin: '20px 0' }} />
      <div style={{ fontSize: 12, color: m.ink50, lineHeight: 1.5 }}>
        Showing top <span style={{ color: m.ink, fontFamily: m.mono }}>{count}</span> candidates by total score.
        Manage your skills on{' '}
        <Link to="/skills" style={{ color: m.accent }}>/skills</Link> to refine matches.
      </div>
    </div>
  );
}

// ─── MIDDLE: candidates list ────────────────────────────────────

function CandidatesList({ m, suggestions, selectedId, onSelect }) {
  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>
          {suggestions.length} {suggestions.length === 1 ? 'match' : 'matches'}
        </h2>
        <div style={{ fontSize: 12, fontFamily: m.mono, color: m.ink50 }}>
          ranked by total score
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {suggestions.map((s) => (
          <CandidateCard
            key={s.matchId}
            m={m}
            suggestion={s}
            isSelected={s.matchId === selectedId}
            onClick={() => onSelect(s.matchId)}
          />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({ m, suggestion, isSelected, onClick }) {
  const name = suggestion.profile?.displayName || shortId(suggestion.userId);
  const initials = nameToInitials(name);
  const topScorer = suggestion.breakdown.details
    .slice()
    .sort((a, b) => b.weight * b.value - a.weight * a.value)[0];
  const matchPct = Math.round(suggestion.totalScore * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        background: isSelected ? m.panel : 'transparent',
        border: `1px solid ${isSelected ? m.accent : m.ink10}`,
        borderRadius: 10,
        padding: 14,
        display: 'grid',
        gridTemplateColumns: '40px 1fr auto',
        gap: 14,
        alignItems: 'center',
        boxShadow: isSelected ? `0 0 0 3px ${m.accentSoft}` : 'none',
        cursor: 'pointer',
        fontFamily: m.font,
        color: m.ink,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: m.ink10,
          display: 'grid',
          placeItems: 'center',
          fontFamily: m.mono,
          fontSize: 13,
          color: m.ink70,
        }}
      >
        {initials}
      </div>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 500, marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono, marginBottom: 4 }}>
          {suggestion.profile?.location || '—'}
          {suggestion.profile?.rating != null && (
            <> · ★ {Number(suggestion.profile.rating).toFixed(1)}</>
          )}
        </div>
        {/* Compact skill summary — comma-separated names so the card stays one row tall.
            Falls back to nothing if matching-service couldn't reach skill-service
            (circuit breaker returned an empty list — see SkillServiceClient.emptySkills). */}
        {suggestion.theirOffers?.length > 0 && (
          <div style={{ fontSize: 12, color: m.ink70, marginBottom: 2 }}>
            <span style={{ color: m.accent, fontFamily: m.mono, fontSize: 11 }}>TEACHES </span>
            {suggestion.theirOffers.map((s) => s.name).join(', ')}
          </div>
        )}
        {suggestion.theirWants?.length > 0 && (
          <div style={{ fontSize: 12, color: m.ink70, marginBottom: 4 }}>
            <span style={{ color: m.ink50, fontFamily: m.mono, fontSize: 11 }}>WANTS  </span>
            {suggestion.theirWants.map((s) => s.name).join(', ')}
          </div>
        )}
        <div style={{ fontSize: 12.5, color: m.ink70 }}>↳ {topScorer?.explanation}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: m.mono, fontSize: 18, color: m.accent, fontWeight: 500 }}>
          {matchPct}
        </div>
        <div style={{ fontFamily: m.mono, fontSize: 10, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          match
        </div>
      </div>
    </button>
  );
}

// ─── RIGHT: selected detail ─────────────────────────────────────

function SelectedDetail({ m, suggestion, acting, onAccept, onDecline }) {
  const name = suggestion.profile?.displayName || shortId(suggestion.userId);

  return (
    <div style={{ borderLeft: `1px solid ${m.ink10}`, padding: '24px 22px', background: m.panel }}>
      <Eyebrow m={m}>Best match · {Math.round(suggestion.totalScore * 100)}%</Eyebrow>
      <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>
        <Link
          to={`/users/${suggestion.userId}`}
          style={{ color: m.ink, textDecoration: 'none', borderBottom: `1px dashed ${m.ink20}` }}
        >
          {name}
        </Link>
      </div>
      <div style={{ fontSize: 12.5, color: m.ink70, marginBottom: 8 }}>
        {suggestion.profile?.bio || 'No bio yet.'}
      </div>
      <Link
        to={`/users/${suggestion.userId}`}
        style={{ fontSize: 12, fontFamily: m.mono, color: m.accent, textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}
      >
        View full profile →
      </Link>
      <div style={{ height: 18 }} />

      {/* Skill summary — pills version, more readable than comma-list at this size.
          Hidden entirely when both lists are empty so the layout doesn't show
          a blank "What they bring" header. */}
      {(suggestion.theirOffers?.length > 0 || suggestion.theirWants?.length > 0) && (
        <>
          <Eyebrow m={m}>What they bring</Eyebrow>
          {suggestion.theirOffers?.length > 0 && (
            <SkillPillRow m={m} label="Can teach" skills={suggestion.theirOffers} accent />
          )}
          {suggestion.theirWants?.length > 0 && (
            <SkillPillRow m={m} label="Wants to learn" skills={suggestion.theirWants} />
          )}
          <div style={{ height: 18 }} />
        </>
      )}

      {/* Score breakdown — the heart of the demo */}
      <Eyebrow m={m}>Score breakdown</Eyebrow>
      <div style={{ marginBottom: 18 }}>
        {suggestion.breakdown.details.map((d) => (
          <ScoreBar key={d.name} m={m} detail={d} />
        ))}
      </div>

      {/* "Why matched" — explanations from each scorer */}
      <Eyebrow m={m}>Why matched</Eyebrow>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 12.5, color: m.ink70, lineHeight: 1.5 }}>
        {suggestion.breakdown.details.map((d) => {
          const positive = d.value >= 0.5;
          return (
            <li key={d.name} style={{ paddingLeft: 14, position: 'relative', marginBottom: 4 }}>
              <span style={{ position: 'absolute', left: 0, color: positive ? m.accent : m.ink50 }}>
                {positive ? '+' : '·'}
              </span>
              <span style={{ color: m.ink }}>{SCORER_LABELS[d.name] || d.name}:</span> {d.explanation}
            </li>
          );
        })}
      </ul>

      <div style={{ marginTop: 22, display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={onAccept}
          disabled={acting}
          style={{
            flex: 1,
            background: m.ink,
            color: m.bg,
            border: 'none',
            padding: '11px',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 500,
            fontFamily: m.font,
            cursor: acting ? 'wait' : 'pointer',
            opacity: acting ? 0.6 : 1,
          }}
        >
          Accept & schedule →
        </button>
        <button
          type="button"
          onClick={onDecline}
          disabled={acting}
          style={{
            background: 'transparent',
            color: m.ink,
            border: `1px solid ${m.ink20}`,
            padding: '11px 14px',
            borderRadius: 8,
            fontSize: 13.5,
            fontFamily: m.font,
            cursor: acting ? 'wait' : 'pointer',
            opacity: acting ? 0.6 : 1,
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}

function ScoreBar({ m, detail }) {
  const contribution = detail.weight * detail.value; // 0..0.30
  return (
    <div style={{ marginBottom: 10, fontSize: 12.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: m.ink70 }}>{SCORER_LABELS[detail.name] || detail.name}</span>
        <span style={{ fontFamily: m.mono, color: m.ink50 }}>
          {detail.value.toFixed(2)} × {detail.weight.toFixed(2)} = {contribution.toFixed(3)}
        </span>
      </div>
      <Bar m={m} value={detail.value} />
    </div>
  );
}

// ─── Shared atoms ───────────────────────────────────────────────

function Bar({ m, value }) {
  // value is 0..1; clamp just in case.
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div style={{ height: 4, borderRadius: 2, background: m.ink10, overflow: 'hidden' }}>
      <div style={{ width: `${clamped * 100}%`, height: '100%', background: m.accent }} />
    </div>
  );
}

// Pill-row used in the right pane to display a candidate's offers / wants.
// `accent` flag colours the pills with the brand colour to make "Can teach"
// visually distinct from the more neutral "Wants to learn" — at a glance
// the user can tell which side is the supply and which is the demand.
function SkillPillRow({ m, label, skills, accent = false }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {skills.map((s, i) => (
          <span
            key={`${s.name}-${i}`}
            title={s.tags?.length ? `tags: ${s.tags.join(', ')}` : undefined}
            style={{
              fontSize: 11.5,
              fontFamily: m.mono,
              padding: '3px 8px',
              borderRadius: 999,
              background: accent ? m.accentSoft : m.ink10,
              color: accent ? m.accent : m.ink70,
              whiteSpace: 'nowrap',
            }}
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

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

function CenteredMessage({ m, title, subtitle }) {
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

function EmptyState({ m }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '120px 40px' }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 10 }}>
          No matches yet.
        </div>
        <div style={{ fontSize: 14, color: m.ink70, marginBottom: 18, lineHeight: 1.5 }}>
          The matching algorithm needs at least one skill you can teach
          <br />
          (an offer) and one you'd like to learn (a want).
        </div>
        <Link
          to="/skills"
          style={{
            display: 'inline-block',
            background: m.ink,
            color: m.bg,
            padding: '11px 18px',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          List your first skill →
        </Link>
      </div>
    </div>
  );
}

// ─── helpers ────────────────────────────────────────────────────

function shortId(uuid) {
  if (!uuid) return '?';
  return 'user-' + uuid.slice(0, 8);
}

function nameToInitials(name) {
  if (!name) return '??';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
