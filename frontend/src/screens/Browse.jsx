import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../theme/theme.jsx';
import * as skillsApi from '../api/skills.js';
import * as usersApi from '../api/users.js';

// /browse — public catalogue of skills offered across the platform.
// Adapted from frontend/directions/minimal-v2.jsx · MinBrowse.
//
// Backend endpoint: GET /skills/search?tag=&category=
//   Returns: List<SkillResponse>  (all types — we filter to OFFER on the client
//   for the "what others are teaching" view).
//
// Side panel = categories list (with counts) and a tag filter input.
// Main grid = skill cards with poster's name (resolved via getProfile).

const LEVEL_LABELS = ['—', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

export default function Browse() {
  const { m } = useTheme();

  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [profiles, setProfiles] = useState({});         // userId -> ProfileResponse
  const [tag, setTag] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load: categories once, skills once (then refetched on filter change).
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [cats, allSkills] = await Promise.all([
          skillsApi.getCategories(),
          skillsApi.searchSkills({}),
        ]);
        if (cancelled) return;
        setCategories(cats);
        const offers = allSkills.filter((s) => s.type === 'OFFER');
        setSkills(offers);
        // Pull profiles for every unique poster (parallel, fault-tolerant)
        const userIds = [...new Set(offers.map((s) => s.userId))];
        const profs = await usersApi.getProfiles(userIds);
        if (cancelled) return;
        const map = {};
        userIds.forEach((id, i) => { map[id] = profs[i]; });
        setProfiles(map);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Refetch when filter changes (debounced via timeout)
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(async () => {
      try {
        const list = await skillsApi.searchSkills({
          tag: tag || undefined,
          category: activeCategory || undefined,
        });
        setSkills(list.filter((s) => s.type === 'OFFER'));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [tag, activeCategory]);   // eslint-disable-line react-hooks/exhaustive-deps

  const flatCats = useMemo(() => skillsApi.flattenCategories(categories), [categories]);
  const counts = useMemo(() => {
    const c = {};
    for (const s of skills) c[s.categoryId] = (c[s.categoryId] || 0) + 1;
    return c;
  }, [skills]);

  if (loading) return <Centered m={m} title="Loading catalogue…" />;
  if (error) return <Centered m={m} title="Couldn't load skills" subtitle={error} />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr' }}>
      <Sidebar
        m={m}
        categories={flatCats}
        counts={counts}
        total={skills.length}
        activeCategory={activeCategory}
        onCategory={setActiveCategory}
      />
      <div style={{ padding: '20px 28px' }}>
        <SearchBar m={m} tag={tag} setTag={setTag} count={skills.length} />
        {skills.length === 0 ? (
          <EmptyState m={m} hasFilter={tag || activeCategory} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {skills.map((s) => (
              <SkillCard key={s.id} m={m} skill={s} profile={profiles[s.userId]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────

function Sidebar({ m, categories, counts, total, activeCategory, onCategory }) {
  return (
    <div style={{ borderRight: `1px solid ${m.ink10}`, padding: '20px 18px', minHeight: '100vh' }}>
      <Eyebrow m={m}>Categories</Eyebrow>
      <CategoryRow
        m={m}
        label="All"
        count={total}
        active={!activeCategory}
        onClick={() => onCategory(null)}
      />
      {categories.map((c) => (
        <CategoryRow
          key={c.id}
          m={m}
          label={c.label}
          count={counts[c.id] || 0}
          active={activeCategory === c.id}
          onClick={() => onCategory(c.id)}
        />
      ))}
    </div>
  );
}

function CategoryRow({ m, label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '6px 8px',
        borderRadius: 6,
        fontSize: 13.5,
        background: active ? m.ink10 : 'transparent',
        fontWeight: active ? 500 : 400,
        color: m.ink,
        border: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: m.font,
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <span style={{ color: m.ink50, fontFamily: m.mono, fontSize: 12 }}>{count}</span>
    </button>
  );
}

// ─── Search bar ─────────────────────────────────────────────────

function SearchBar({ m, tag, setTag, count }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          background: m.panel,
          border: `1px solid ${m.ink10}`,
          borderRadius: 8,
          width: 420,
          fontSize: 13,
        }}
      >
        <span style={{ color: m.ink50 }}>⌕</span>
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Filter by tag (e.g. spring, watercolor)"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: m.ink,
            fontFamily: m.font,
            fontSize: 13,
          }}
        />
      </div>
      <div style={{ fontSize: 12, fontFamily: m.mono, color: m.ink50 }}>
        {count} {count === 1 ? 'skill' : 'skills'}
      </div>
    </div>
  );
}

// ─── Skill card ─────────────────────────────────────────────────

function SkillCard({ m, skill, profile }) {
  const teacherName = profile?.displayName || `user-${skill.userId.slice(0, 8)}`;
  const teacherLocation = profile?.location || profile?.timezone || '—';
  return (
    <div
      style={{
        background: m.panel,
        border: `1px solid ${m.ink10}`,
        borderRadius: 12,
        padding: 16,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: m.mono,
            color: m.ink50,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {skill.categoryName}
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: m.mono,
            padding: '2px 6px',
            background: m.accentSoft,
            color: m.accent,
            borderRadius: 4,
          }}
        >
          {LEVEL_LABELS[skill.level]?.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 10, lineHeight: 1.2 }}>
        {skill.name}
      </div>
      {skill.description && (
        <div style={{ fontSize: 13, color: m.ink70, marginBottom: 12, lineHeight: 1.4 }}>
          {skill.description}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{teacherName}</div>
          <div style={{ fontSize: 11.5, color: m.ink50 }}>{teacherLocation}</div>
        </div>
        {profile?.rating != null && (
          <div style={{ fontFamily: m.mono, fontSize: 12, color: m.ink70 }}>
            ★ {Number(profile.rating).toFixed(1)}
          </div>
        )}
      </div>
      {skill.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {skill.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                padding: '2px 7px',
                borderRadius: 4,
                background: m.ink10,
                color: m.ink70,
                fontFamily: m.mono,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Atoms ──────────────────────────────────────────────────────

function Eyebrow({ m, children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontFamily: m.mono,
        color: m.ink50,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function EmptyState({ m, hasFilter }) {
  return (
    <div
      style={{
        border: `1px dashed ${m.ink20}`,
        borderRadius: 10,
        padding: 48,
        textAlign: 'center',
        color: m.ink50,
        fontSize: 13.5,
      }}
    >
      {hasFilter
        ? 'No skills match your filters. Try clearing them.'
        : 'No public skills yet — be the first to list one on /skills.'}
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
