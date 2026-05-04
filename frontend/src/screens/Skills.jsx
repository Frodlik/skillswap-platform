import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as skillsApi from '../api/skills.js';

// /skills — manage what you teach (Offers) and what you want to learn (Wants).
// Adapted from frontend/directions/minimal-account.jsx · MinMySkills with:
//   - "live"/"draft" status removed (backend has no such state)
//   - "sessions taught" counter removed (skill-service doesn't track it)
//   - Edit removed; only Add + Delete (backend has no PATCH endpoint)
//
// Two columns: left = your offers (skill-match weight 0.30), right = your wants.
// "Add" opens an inline modal with the create form.

const LEVEL_LABELS = ['—', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

export default function Skills() {
  const { m } = useTheme();
  const { user } = useAuth();
  const userId = user?.sub;

  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | 'OFFER' | 'WANT'

  // Initial load: skills + categories in parallel
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [s, c] = await Promise.all([
          skillsApi.getUserSkills(userId),
          skillsApi.getCategories(),
        ]);
        if (!cancelled) {
          setSkills(s);
          setCategories(c);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Split skills into offers/wants. useMemo recomputes only when the source changes.
  const { offers, wants } = useMemo(() => {
    const offers = skills.filter((s) => s.type === 'OFFER');
    const wants = skills.filter((s) => s.type === 'WANT');
    return { offers, wants };
  }, [skills]);

  async function handleCreate(payload) {
    const fn = modal === 'OFFER' ? skillsApi.addOffer : skillsApi.addWant;
    const created = await fn(userId, payload);
    setSkills((prev) => [...prev, created]);
    setModal(null);
  }

  async function handleDelete(skillId) {
    if (!confirm('Delete this skill?')) return;
    try {
      await skillsApi.deleteSkill(skillId);
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  }

  if (loading) return <Centered m={m} title="Loading skills…" />;
  if (error) return <Centered m={m} title="Couldn't load skills" subtitle={error} />;

  return (
    <div style={{ padding: '24px 40px' }}>
      <Header m={m} count={skills.length} offers={offers.length} wants={wants.length} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Column
          m={m}
          eyebrow={`You teach · ${offers.length} ${offers.length === 1 ? 'offer' : 'offers'}`}
          ctaLabel="+ Add offer"
          ctaSolid
          onCta={() => setModal('OFFER')}
          items={offers}
          emptyText="You haven't listed anything to teach yet."
          accent={false}
          onDelete={handleDelete}
        />
        <Column
          m={m}
          eyebrow={`You want · ${wants.length} ${wants.length === 1 ? 'want' : 'wants'}`}
          ctaLabel="+ Add want"
          ctaSolid={false}
          onCta={() => setModal('WANT')}
          items={wants}
          emptyText="You haven't listed anything to learn yet."
          accent
          onDelete={handleDelete}
        />
      </div>

      {modal && (
        <SkillModal
          m={m}
          type={modal}
          categories={categories}
          onCancel={() => setModal(null)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}

// ─── header ─────────────────────────────────────────────────────

function Header({ m, count, offers, wants }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
      <div>
        <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>
          My skills
        </h2>
        <div style={{ fontSize: 13, color: m.ink50, marginTop: 2 }}>
          What you teach, what you'd like to learn. Both feed the matcher.
        </div>
      </div>
      <div style={{ fontFamily: m.mono, fontSize: 12, color: m.ink70 }}>
        {offers} offer{offers === 1 ? '' : 's'} · {wants} want{wants === 1 ? '' : 's'}
      </div>
    </div>
  );
}

// ─── one column (offers OR wants) ───────────────────────────────

function Column({ m, eyebrow, ctaLabel, ctaSolid, onCta, items, emptyText, accent, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: m.mono,
            color: m.ink50,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {eyebrow}
        </div>
        <button
          type="button"
          onClick={onCta}
          style={{
            background: ctaSolid ? m.ink : m.panel,
            color: ctaSolid ? m.bg : m.ink,
            border: ctaSolid ? 'none' : `1px solid ${m.ink20}`,
            padding: '7px 12px',
            borderRadius: 6,
            fontSize: 12.5,
            fontFamily: m.font,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {ctaLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            border: `1px dashed ${m.ink20}`,
            borderRadius: 10,
            padding: 24,
            textAlign: 'center',
            color: m.ink50,
            fontSize: 13.5,
          }}
        >
          {emptyText}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((s) => (
            <SkillCard key={s.id} m={m} skill={s} accent={accent} onDelete={() => onDelete(s.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── one skill card ─────────────────────────────────────────────

function SkillCard({ m, skill, accent, onDelete }) {
  return (
    <div
      style={{
        background: m.panel,
        border: `1px solid ${accent ? m.accent : m.ink10}`,
        borderLeft: accent ? `3px solid ${m.accent}` : `1px solid ${m.ink10}`,
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{skill.name}</div>
        <div style={{ fontSize: 11, color: m.ink50, fontFamily: m.mono }}>
          {skill.categoryName}
        </div>
      </div>
      <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono, marginBottom: 10 }}>
        {LEVEL_LABELS[skill.level] || `Level ${skill.level}`}
      </div>
      {skill.description && (
        <p style={{ margin: '0 0 10px', fontSize: 13, color: m.ink70, lineHeight: 1.5 }}>
          {skill.description}
        </p>
      )}
      {skill.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
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
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={onDelete}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            color: m.ink50,
            border: 'none',
            padding: '6px 4px',
            fontSize: 12,
            fontFamily: m.font,
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── add modal ──────────────────────────────────────────────────

function SkillModal({ m, type, categories, onCancel, onSubmit }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [level, setLevel] = useState(3);
  const [tags, setTags] = useState('');           // comma-separated
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const flatCategories = useMemo(() => skillsApi.flattenCategories(categories), [categories]);

  // Pre-select first category once they load.
  useEffect(() => {
    if (!categoryId && flatCategories[0]) setCategoryId(flatCategories[0].id);
  }, [flatCategories, categoryId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        categoryId,
        level,
        tags: tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        description: description.trim() || null,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSubmitting(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
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
          width: 520,
          maxWidth: '92vw',
          background: m.panel,
          color: m.ink,
          fontFamily: m.font,
          borderRadius: 12,
          boxShadow: `0 20px 60px ${m.ink20}`,
          padding: 28,
        }}
      >
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
          {type === 'OFFER' ? 'You teach' : 'You want'}
        </div>
        <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 500, margin: '0 0 18px' }}>
          {type === 'OFFER' ? 'Add a new offer' : 'Add a new want'}
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
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Field m={m} label="Name" required>
            <Input
              m={m}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Conversational Spanish"
              required
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field m={m} label="Category" required>
              <Select
                m={m}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field m={m} label="Level (1–5)" required>
              <Select
                m={m}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                required
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} — {LEVEL_LABELS[n]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field m={m} label="Tags" hint="comma-separated; e.g. spring, jpa, hibernate">
            <Input
              m={m}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="java, spring"
            />
          </Field>

          <Field m={m} label="Description" hint="optional · 280 chars">
            <Textarea
              m={m}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={280}
              rows={3}
            />
          </Field>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
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
                fontFamily: m.font,
                fontWeight: 500,
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Saving…' : type === 'OFFER' ? 'Add offer →' : 'Add want →'}
            </button>
            <button
              type="button"
              onClick={onCancel}
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

// ─── tiny form atoms ────────────────────────────────────────────

function Field({ m, label, hint, required, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label
          style={{
            fontSize: 11,
            fontFamily: m.mono,
            color: m.ink50,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
          {required && <span style={{ color: m.accent, marginLeft: 4 }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: 11, color: m.ink50, fontFamily: m.mono }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Input({ m, ...rest }) {
  return (
    <input
      {...rest}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: m.bg,
        color: m.ink,
        border: `1px solid ${m.ink20}`,
        borderRadius: 8,
        fontSize: 13.5,
        fontFamily: m.font,
        outline: 'none',
      }}
    />
  );
}

function Textarea({ m, ...rest }) {
  return (
    <textarea
      {...rest}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: m.bg,
        color: m.ink,
        border: `1px solid ${m.ink20}`,
        borderRadius: 8,
        fontSize: 13.5,
        fontFamily: m.font,
        outline: 'none',
        resize: 'vertical',
        minHeight: 70,
      }}
    />
  );
}

function Select({ m, children, ...rest }) {
  return (
    <select
      {...rest}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: m.bg,
        color: m.ink,
        border: `1px solid ${m.ink20}`,
        borderRadius: 8,
        fontSize: 13.5,
        fontFamily: m.font,
        outline: 'none',
      }}
    >
      {children}
    </select>
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
