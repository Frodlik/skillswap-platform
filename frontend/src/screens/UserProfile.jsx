import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as usersApi from '../api/users.js';
import * as skillsApi from '../api/skills.js';
import * as sessionsApi from '../api/sessions.js';

// /users/:userId — read-only public profile of another platform member.
//
// Distinct from /profile (Profile.jsx), which is the SELF-edit screen.
// We land here from clickable user names in /matches, /sessions, /browse.
//
// Data is aggregated client-side from three services because there is no
// single "public profile" endpoint — adding one would mean cross-service
// joining inside user-service, which is a heavier change for the same
// visible result. Three parallel calls is fine for a profile view.

export default function UserProfile() {
  const { userId } = useParams();
  const { m } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [sessionsCount, setSessionsCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bounce away if someone hits /users/:myOwnId — they should be on /profile
  // (which has the editable form). Redirect rather than rendering this
  // read-only view of yourself.
  useEffect(() => {
    if (userId && user?.sub === userId) {
      navigate('/profile', { replace: true });
    }
  }, [userId, user, navigate]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Promise.all + .catch per call so a failed skills fetch doesn't
        // hide the profile entirely — partial data is better than a blank.
        const [p, sk, ss] = await Promise.all([
          usersApi.getProfile(userId).catch(() => null),
          skillsApi.getUserSkills(userId).catch(() => []),
          // size=1 — we only need totalElements; the single content row
          // is discarded. Avoids fetching pages of someone else's data.
          sessionsApi.getUserSessions(userId, 0, 1).catch(() => null),
        ]);
        if (!cancelled) {
          setProfile(p);
          setSkills(sk || []);
          setSessionsCount(ss?.totalElements ?? null);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <Centered m={m} title="Loading profile…" />;
  if (error || !profile) {
    return (
      <Centered
        m={m}
        title="Profile not found"
        subtitle={error || `No profile exists for userId ${userId}`}
      />
    );
  }

  const offers = skills.filter((s) => s.type === 'OFFER');
  const wants  = skills.filter((s) => s.type === 'WANT');
  const memberSince = profile.createdAt ? new Date(profile.createdAt) : null;

  return (
    <div style={{ padding: '24px 40px', maxWidth: 880 }}>
      {/* Header — avatar, name, location, member-since */}
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', marginBottom: 26 }}>
        <Avatar m={m} name={profile.displayName} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            {profile.displayName || `user-${userId.slice(0, 8)}`}
          </h2>
          <div style={{ fontSize: 13, color: m.ink70, fontFamily: m.mono }}>
            {profile.location && <span>{profile.location}</span>}
            {profile.location && profile.timezone && <span style={{ color: m.ink20 }}> · </span>}
            {profile.timezone && <span>{profile.timezone}</span>}
            {profile.language && (
              <>
                <span style={{ color: m.ink20 }}> · </span>
                <span>speaks {profile.language}</span>
              </>
            )}
          </div>
          {memberSince && (
            <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono, marginTop: 4 }}>
              member since {memberSince.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
            </div>
          )}
        </div>
        {/* Rating badge — top-right, lifted up so it visually pairs with the avatar */}
        {profile.rating != null && (
          <RatingBadge m={m} rating={Number(profile.rating)} />
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div
          style={{
            background: m.panel,
            border: `1px solid ${m.ink10}`,
            borderRadius: 12,
            padding: 18,
            fontSize: 14,
            lineHeight: 1.6,
            color: m.ink,
            marginBottom: 22,
          }}
        >
          {profile.bio}
        </div>
      )}

      {/* Three-up stat row: completed sessions, offered skills, wanted skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 22 }}>
        <StatCard m={m}
          label="Sessions"
          value={sessionsCount ?? '—'}
          hint="all-time, any role" />
        <StatCard m={m}
          label="Can teach"
          value={offers.length}
          hint={offers.length === 1 ? 'one offered skill' : 'offered skills'} />
        <StatCard m={m}
          label="Wants to learn"
          value={wants.length}
          hint={wants.length === 1 ? 'one wanted skill' : 'wanted skills'} />
      </div>

      {/* Skills sections */}
      {offers.length > 0 && (
        <SkillsSection m={m} title="Can teach" skills={offers} accent />
      )}
      {wants.length > 0 && (
        <SkillsSection m={m} title="Wants to learn" skills={wants} />
      )}
      {offers.length === 0 && wants.length === 0 && (
        <div
          style={{
            border: `1px dashed ${m.ink20}`,
            borderRadius: 10,
            padding: 28,
            textAlign: 'center',
            color: m.ink50,
            fontSize: 13.5,
          }}
        >
          This member hasn't listed any skills yet.
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function Avatar({ m, name }) {
  const initials = (name || '??')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '??';
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 999,
        background: m.ink10,
        display: 'grid',
        placeItems: 'center',
        fontFamily: m.mono,
        fontSize: 22,
        color: m.ink70,
      }}
    >
      {initials}
    </div>
  );
}

function RatingBadge({ m, rating }) {
  return (
    <div
      style={{
        background: m.accentSoft,
        color: m.accent,
        padding: '8px 14px',
        borderRadius: 10,
        textAlign: 'center',
        minWidth: 78,
      }}
    >
      <div style={{ fontFamily: m.mono, fontSize: 22, fontWeight: 500, lineHeight: 1 }}>
        ★ {rating.toFixed(1)}
      </div>
      <div style={{ fontSize: 10, fontFamily: m.mono, color: m.accent, opacity: 0.7, marginTop: 2 }}>
        rating
      </div>
    </div>
  );
}

function StatCard({ m, label, value, hint }) {
  return (
    <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: m.ink50, marginTop: 2 }}>{hint}</div>
    </div>
  );
}

function SkillsSection({ m, title, skills, accent = false }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        {title} · {skills.length}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {skills.map((s) => (
          <SkillRow key={s.id} m={m} skill={s} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function SkillRow({ m, skill, accent }) {
  return (
    <div
      style={{
        background: m.panel,
        border: `1px solid ${m.ink10}`,
        borderRadius: 10,
        padding: '12px 16px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 500 }}>{skill.name}</div>
        <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono, marginTop: 2 }}>
          {skill.categoryName}
          {skill.tags?.length > 0 && (
            <>
              <span style={{ color: m.ink20 }}> · </span>
              {skill.tags.map((t, i) => (
                <span key={t}>
                  {i > 0 && ', '}
                  {t}
                </span>
              ))}
            </>
          )}
        </div>
        {skill.description && (
          <div style={{ fontSize: 12.5, color: m.ink70, marginTop: 4, lineHeight: 1.5 }}>
            {skill.description}
          </div>
        )}
      </div>
      <LevelBadge m={m} level={skill.level} accent={accent} />
    </div>
  );
}

// 5 dots, filled up to `level`. Compact way to show 1-5 self-assessed
// proficiency without taking up a full progress bar.
function LevelBadge({ m, level, accent }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      <span style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, marginRight: 4 }}>L{level}</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: n <= level ? (accent ? m.accent : m.ink70) : m.ink10,
          }}
        />
      ))}
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
