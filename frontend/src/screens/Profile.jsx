import { useEffect, useState } from 'react';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as usersApi from '../api/users.js';

// /profile — edit your own profile + preferences.
// Adapted from frontend/directions/minimal-account.jsx · MinMyProfile,
// trimmed to only the fields the backend actually accepts:
//
//   UpdateProfileRequest:    displayName, bio, avatarUrl, timezone, language, location
//   PreferenceUpdateRequest: preferredLanguages: string[], preferredTimezoneRange, availabilitySchedule
//
// availabilitySchedule is a raw JSON string (e.g. {"MON":[{"from":9,"to":17}]}).
// AvailabilityScorer in matching-service parses this format directly. We expose
// it as a textarea + a tiny preset for thesis demo, since proper week-grid UI
// is out of scope.

export default function Profile() {
  const { m } = useTheme();
  const { user } = useAuth();
  const userId = user?.sub;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile fields (controlled inputs)
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  const [location, setLocation] = useState('');

  // Preferences fields
  const [preferredLanguages, setPreferredLanguages] = useState('');
  const [preferredTimezoneRange, setPreferredTimezoneRange] = useState('');
  const [availabilitySchedule, setAvailabilitySchedule] = useState('');

  // Initial load
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const p = await usersApi.getProfile(userId);
        if (cancelled) return;
        setProfile(p);
        setDisplayName(p.displayName || '');
        setBio(p.bio || '');
        setLanguage(p.language || 'en');
        setTimezone(p.timezone || 'UTC');
        setLocation(p.location || '');
        // preferences are NOT in ProfileResponse; they live on a separate
        // table. For MVP we don't fetch them on load — user types fresh
        // values when they want to change them. (Future: GET /preferences
        // endpoint.)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      // 1. Profile (PUT)
      const updatedProfile = await usersApi.updateProfile(userId, {
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: profile?.avatarUrl || null,
        language: language.trim() || null,
        timezone: timezone.trim() || null,
        location: location.trim() || null,
      });
      setProfile(updatedProfile);

      // 2. Preferences (PATCH) — only send if user filled anything
      const prefsPayload = {};
      if (preferredLanguages.trim()) {
        prefsPayload.preferredLanguages = preferredLanguages
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean);
      }
      if (preferredTimezoneRange.trim()) {
        prefsPayload.preferredTimezoneRange = preferredTimezoneRange.trim();
      }
      if (availabilitySchedule.trim()) {
        // Validate JSON before sending — common error source
        try {
          JSON.parse(availabilitySchedule);
        } catch {
          throw new Error('Availability schedule is not valid JSON');
        }
        prefsPayload.availabilitySchedule = availabilitySchedule.trim();
      }
      if (Object.keys(prefsPayload).length > 0) {
        await usersApi.updatePreferences(userId, prefsPayload);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  }

  function applySchedulePreset(name) {
    const presets = {
      weekdays: '{"MON":[{"from":18,"to":22}],"TUE":[{"from":18,"to":22}],"WED":[{"from":18,"to":22}],"THU":[{"from":18,"to":22}],"FRI":[{"from":18,"to":22}]}',
      weekends: '{"SAT":[{"from":10,"to":18}],"SUN":[{"from":10,"to":18}]}',
      all: '{"MON":[{"from":9,"to":21}],"TUE":[{"from":9,"to":21}],"WED":[{"from":9,"to":21}],"THU":[{"from":9,"to":21}],"FRI":[{"from":9,"to":21}],"SAT":[{"from":10,"to":18}],"SUN":[{"from":10,"to":18}]}',
    };
    setAvailabilitySchedule(presets[name] || '');
  }

  if (loading) return <Centered m={m} title="Loading profile…" />;
  if (error && !profile) return <Centered m={m} title="Couldn't load profile" subtitle={error} />;

  return (
    <div style={{ padding: '24px 40px', maxWidth: 920, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>
            Edit profile
          </h2>
          <div style={{ fontSize: 13, color: m.ink50, marginTop: 2 }}>
            Public — visible to anyone browsing skills.
          </div>
        </div>
        <RatingBadge m={m} rating={profile?.rating} />
      </div>

      {error && <ErrorBanner m={m} message={error} />}
      {saved && <SuccessBanner m={m} message="Profile saved" />}

      <form onSubmit={handleSave}>
        <Section m={m} title="Identity">
          <Row m={m}>
            <Field m={m} label="Display name">
              <Input m={m} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Quinn Lee" />
            </Field>
            <Field m={m} label="Location">
              <Input m={m} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Brooklyn, NY" />
            </Field>
          </Row>
          <Field m={m} label="Bio" hint="280 chars max">
            <Textarea
              m={m}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
              placeholder="A few sentences about you and what you're working on."
            />
          </Field>
        </Section>

        <Section m={m} title="Locale (used by the matcher)">
          <Row m={m}>
            <Field m={m} label="Primary language" hint="ISO code: en, uk, es…">
              <Input m={m} value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en" />
            </Field>
            <Field m={m} label="Timezone" hint="IANA: Europe/Kyiv, UTC, America/New_York">
              <Input m={m} value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Europe/Kyiv" />
            </Field>
          </Row>
        </Section>

        <Section m={m} title="Preferences (matching tuning)">
          <Field m={m} label="Other languages you speak" hint="comma-separated">
            <Input m={m} value={preferredLanguages} onChange={(e) => setPreferredLanguages(e.target.value)} placeholder="uk, ru, fr" />
          </Field>
          <Field m={m} label="Preferred timezone range" hint="optional, free-form">
            <Input m={m} value={preferredTimezoneRange} onChange={(e) => setPreferredTimezoneRange(e.target.value)} placeholder="UTC+0 to UTC+3" />
          </Field>
          <Field
            m={m}
            label="Availability schedule"
            hint="JSON · used by the AvailabilityScorer"
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <PresetButton m={m} onClick={() => applySchedulePreset('weekdays')}>Weekday evenings</PresetButton>
              <PresetButton m={m} onClick={() => applySchedulePreset('weekends')}>Weekends</PresetButton>
              <PresetButton m={m} onClick={() => applySchedulePreset('all')}>All week</PresetButton>
              <PresetButton m={m} onClick={() => setAvailabilitySchedule('')}>Clear</PresetButton>
            </div>
            <Textarea
              m={m}
              value={availabilitySchedule}
              onChange={(e) => setAvailabilitySchedule(e.target.value)}
              rows={4}
              monospace
              placeholder='{"MON":[{"from":18,"to":22}]}'
            />
          </Field>
        </Section>

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: m.ink,
              color: m.bg,
              border: 'none',
              padding: '11px 22px',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: m.font,
              fontWeight: 500,
              cursor: saving ? 'wait' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function Section({ m, title, children }) {
  return (
    <div
      style={{
        background: m.panel,
        border: `1px solid ${m.ink10}`,
        borderRadius: 12,
        padding: 22,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontFamily: m.mono,
          color: m.ink50,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>;
}

function Field({ m, label, hint, children }) {
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

function Textarea({ m, monospace, rows = 3, ...rest }) {
  return (
    <textarea
      {...rest}
      rows={rows}
      style={{
        width: '100%',
        padding: '10px 12px',
        background: m.bg,
        color: m.ink,
        border: `1px solid ${m.ink20}`,
        borderRadius: 8,
        fontSize: 13.5,
        fontFamily: monospace ? m.mono : m.font,
        outline: 'none',
        resize: 'vertical',
        minHeight: rows * 22 + 20,
        lineHeight: 1.5,
      }}
    />
  );
}

function PresetButton({ m, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: m.bg,
        color: m.ink70,
        border: `1px solid ${m.ink20}`,
        padding: '5px 10px',
        borderRadius: 6,
        fontSize: 11.5,
        fontFamily: m.mono,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function RatingBadge({ m, rating }) {
  if (rating == null) {
    return (
      <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono }}>
        no reviews yet
      </div>
    );
  }
  return (
    <div
      style={{
        background: m.accentSoft,
        color: m.accent,
        padding: '6px 12px',
        borderRadius: 8,
        fontFamily: m.mono,
        fontSize: 13,
      }}
    >
      ★ {Number(rating).toFixed(2)} / 5
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

function SuccessBanner({ m, message }) {
  return (
    <div
      role="status"
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: m.accentSoft,
        color: m.accent,
        border: `1px solid ${m.accent}`,
        fontSize: 13,
        marginBottom: 14,
        fontFamily: m.font,
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
