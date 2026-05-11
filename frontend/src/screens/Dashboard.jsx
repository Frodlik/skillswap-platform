import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as sessionsApi from '../api/sessions.js';
import * as skillsApi from '../api/skills.js';
import * as matchesApi from '../api/matches.js';
import * as usersApi from '../api/users.js';
import { formatWhen } from '../utils/format.js';

// /dashboard — single-screen overview. Pulls top-level numbers from every
// service so the user has one place to "see where they stand". Each card is
// a clickable link into the detail screen for that data.

export default function Dashboard() {
  const { m } = useTheme();
  const { t } = useTranslation();
  const { user, email } = useAuth();
  const userId = user?.sub;

  const [data, setData] = useState({ balance: null, skills: [], sessions: [], matches: [], profile: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [balance, skills, sessionsPage, matches, profile] = await Promise.all([
          sessionsApi.getBalance(userId).catch(() => null),
          skillsApi.getUserSkills(userId).catch(() => []),
          sessionsApi.getUserSessions(userId).catch(() => ({ content: [] })),
          matchesApi.getSuggestions(userId, 3).catch(() => []),
          usersApi.getProfile(userId).catch(() => null),
        ]);
        if (cancelled) return;
        setData({
          balance,
          skills,
          sessions: sessionsPage.content || [],
          matches,
          profile,
        });
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <Centered m={m} title={t('dashboard.loading')} />;
  if (error) return <Centered m={m} title={t('dashboard.loadError')} subtitle={error} />;

  const offers = data.skills.filter((s) => s.type === 'OFFER').length;
  const wants = data.skills.filter((s) => s.type === 'WANT').length;
  const upcoming = data.sessions.filter(
    (s) => s.status === 'SCHEDULED' || s.status === 'ACTIVE' || s.status === 'PROPOSED'
  );
  const completed = data.sessions.filter((s) => s.status === 'COMPLETED').length;
  const pendingForMe = data.sessions.filter(
    (s) => s.status === 'PROPOSED' && s.proposerId !== userId
  ).length;

  return (
    <div style={{ padding: '24px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <Welcome m={m} t={t} name={data.profile?.displayName || email} />

      {/* Top row — 4 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard
          m={m}
          to="/wallet"
          eyebrow={t('dashboard.card.balance')}
          big={data.balance ? data.balance.balance : 0}
          unit={t('dashboard.card.balanceUnit')}
          sub={
            data.balance
              ? t('dashboard.card.balanceSub', { count: data.balance.heldBalance })
              : t('dashboard.card.balanceInactive')
          }
          accent
        />
        <StatCard
          m={m}
          to="/skills"
          eyebrow={t('dashboard.card.skills')}
          big={offers + wants}
          unit={t('dashboard.card.skillsUnit')}
          sub={t('dashboard.card.skillsSub', { count: offers, offers, wants })}
        />
        <StatCard
          m={m}
          to="/sessions"
          eyebrow={t('dashboard.card.upcoming')}
          big={upcoming.length}
          unit={t('dashboard.card.upcomingUnit', { count: upcoming.length })}
          sub={
            pendingForMe > 0
              ? t('dashboard.card.upcomingPending', { count: pendingForMe })
              : t('dashboard.card.upcomingCompleted', { count: completed })
          }
        />
        <StatCard
          m={m}
          to="/matches"
          eyebrow={t('dashboard.card.matches')}
          big={data.matches.length}
          unit={t('dashboard.card.matchesUnit')}
          sub={
            data.matches[0]
              ? t('dashboard.card.matchesBest', { pct: Math.round(data.matches[0].totalScore * 100) })
              : t('dashboard.card.matchesEmpty')
          }
        />
      </div>

      {/* Bottom — two side-by-side panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Panel m={m} title={t('dashboard.calendarTitle')} linkTo="/sessions" linkLabel={t('dashboard.calendarLink')}>
          {upcoming.length === 0 ? (
            <Empty m={m} text={t('dashboard.noUpcoming')} />
          ) : (
            upcoming.slice(0, 4).map((s) => <UpcomingRow key={s.id} m={m} t={t} session={s} userId={userId} />)
          )}
        </Panel>

        <Panel m={m} title={t('dashboard.topMatchesTitle')} linkTo="/matches" linkLabel={t('dashboard.topMatchesLink')}>
          {data.matches.length === 0 ? (
            <Empty m={m} text={t('dashboard.noMatches')} />
          ) : (
            data.matches.slice(0, 3).map((s) => <MatchRow key={s.matchId} m={m} t={t} suggestion={s} />)
          )}
        </Panel>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function Welcome({ m, t, name }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>
        {t('dashboard.welcome')} <span style={{ fontStyle: 'italic', color: m.accent }}>{name}</span>
      </h2>
      <div style={{ fontSize: 13, color: m.ink50, marginTop: 4 }}>
        {t('dashboard.whereYouStand')}
      </div>
    </div>
  );
}

function StatCard({ m, to, eyebrow, big, unit, sub, accent }) {
  return (
    <Link
      to={to}
      style={{
        background: m.panel,
        border: `1px solid ${m.ink10}`,
        borderRadius: 12,
        padding: 18,
        textDecoration: 'none',
        color: m.ink,
        display: 'block',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontFamily: m.mono,
          color: m.ink50,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontSize: 36,
            fontFamily: m.mono,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: accent ? m.accent : m.ink,
          }}
        >
          {big}
        </span>
        <span style={{ fontSize: 12, color: m.ink70, fontFamily: m.mono }}>{unit}</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: m.ink50, fontFamily: m.mono }}>
        {sub}
      </div>
    </Link>
  );
}

function Panel({ m, title, linkTo, linkLabel, children }) {
  return (
    <div
      style={{
        background: m.panel,
        border: `1px solid ${m.ink10}`,
        borderRadius: 12,
        padding: 18,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
        <Link
          to={linkTo}
          style={{ fontSize: 12, fontFamily: m.mono, color: m.accent, textDecoration: 'none' }}
        >
          {linkLabel}
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

function UpcomingRow({ m, t, session, userId }) {
  const isTeacher = session.teacherId === userId;
  const isProposed = session.status === 'PROPOSED';
  const isMyInvite = isProposed && session.proposerId === userId;
  const isIncoming = isProposed && session.proposerId !== userId;

  const badge = isIncoming
    ? { bg: '#fff5d8', color: '#8a6d00', label: t('dashboard.badge.respond') }
    : isMyInvite
    ? { bg: m.ink10, color: m.ink50, label: t('dashboard.badge.pending') }
    : session.status === 'ACTIVE'
    ? { bg: m.accent, color: '#fff', label: t('dashboard.badge.live') }
    : { bg: m.ink, color: m.bg, label: t('dashboard.badge.upcoming') };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        padding: '10px 12px',
        background: isIncoming ? '#fffdf0' : m.bg,
        border: `1px solid ${isIncoming ? '#e8d87a' : m.ink10}`,
        borderRadius: 8,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>
          {session.skillName}{' '}
          <span style={{ color: m.ink50, fontFamily: m.mono, fontSize: 11.5 }}>
            · {isTeacher ? t('dashboard.youTeach') : t('dashboard.youLearn')}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>
          {isProposed ? `${t('dashboard.proposed')} · ` : ''}{formatWhen(session.scheduledAt)} · {session.durationTokens}h
        </div>
      </div>
      <span
        style={{
          fontSize: 10,
          fontFamily: m.mono,
          padding: '3px 8px',
          borderRadius: 4,
          background: badge.bg,
          color: badge.color,
          letterSpacing: '0.06em',
        }}
      >
        {badge.label}
      </span>
    </div>
  );
}

function MatchRow({ m, t, suggestion }) {
  const pct = Math.round(suggestion.totalScore * 100);
  const top = suggestion.breakdown.details
    .slice()
    .sort((a, b) => b.weight * b.value - a.weight * a.value)[0];
  return (
    <Link
      to="/matches"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        padding: '10px 12px',
        background: m.bg,
        border: `1px solid ${m.ink10}`,
        borderRadius: 8,
        textDecoration: 'none',
        color: m.ink,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>
          user-{suggestion.userId.slice(0, 8)}
        </div>
        <div style={{ fontSize: 11.5, color: m.ink50 }}>
          ↳ {top?.explanation || t('dashboard.multiFactor')}
        </div>
      </div>
      <span style={{ fontFamily: m.mono, fontSize: 16, color: m.accent, fontWeight: 500 }}>
        {pct}
      </span>
    </Link>
  );
}

function Empty({ m, text }) {
  return (
    <div
      style={{
        border: `1px dashed ${m.ink20}`,
        borderRadius: 8,
        padding: 24,
        textAlign: 'center',
        fontSize: 13,
        color: m.ink50,
      }}
    >
      {text}
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
