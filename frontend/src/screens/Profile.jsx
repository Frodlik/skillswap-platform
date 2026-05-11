import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as usersApi from '../api/users.js';

// ─── Static data ─────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'uk', name: 'Ukrainian' },
  { code: 'ru', name: 'Russian' }, { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },   { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' }, { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },  { code: 'fi', name: 'Finnish' },
  { code: 'cs', name: 'Czech' },   { code: 'sk', name: 'Slovak' },
  { code: 'hu', name: 'Hungarian' },{ code: 'ro', name: 'Romanian' },
  { code: 'bg', name: 'Bulgarian' },{ code: 'hr', name: 'Croatian' },
  { code: 'el', name: 'Greek' },   { code: 'tr', name: 'Turkish' },
  { code: 'ar', name: 'Arabic' },  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },   { code: 'bn', name: 'Bengali' },
  { code: 'zh', name: 'Chinese' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },    { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },   { code: 'ka', name: 'Georgian' },
  { code: 'hy', name: 'Armenian' },{ code: 'az', name: 'Azerbaijani' },
  { code: 'kk', name: 'Kazakh' },  { code: 'uz', name: 'Uzbek' },
  { code: 'lt', name: 'Lithuanian' },{ code: 'lv', name: 'Latvian' },
  { code: 'et', name: 'Estonian' },{ code: 'sw', name: 'Swahili' },
  { code: 'fa', name: 'Persian' }, { code: 'ur', name: 'Urdu' },
];

const TIMEZONES = (() => {
  try { return Intl.supportedValuesOf('timeZone'); } catch { return []; }
})();

const FALLBACK_TIMEZONES = [
  'UTC','Europe/Kyiv','Europe/Warsaw','Europe/Berlin','Europe/Paris',
  'Europe/London','Europe/Madrid','Europe/Rome','Europe/Amsterdam',
  'Europe/Lisbon','Europe/Stockholm','Europe/Helsinki','Europe/Athens',
  'Europe/Moscow','Europe/Minsk','America/New_York','America/Chicago',
  'America/Denver','America/Los_Angeles','America/Toronto','America/Mexico_City',
  'America/Sao_Paulo','America/Buenos_Aires','Asia/Dubai','Asia/Karachi',
  'Asia/Kolkata','Asia/Dhaka','Asia/Bangkok','Asia/Singapore','Asia/Shanghai',
  'Asia/Tokyo','Asia/Seoul','Australia/Sydney','Pacific/Auckland',
];

const TZ_LIST = TIMEZONES.length > 0 ? TIMEZONES : FALLBACK_TIMEZONES;

// ─── Availability helpers ────────────────────────────────────────

const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const GRID_HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06–23

function parseSchedule(json) {
  const sel = new Set();
  if (!json) return sel;
  try {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    for (const [day, ranges] of Object.entries(obj)) {
      for (const { from, to } of (ranges || [])) {
        for (let h = from; h < to; h++) sel.add(`${day}-${h}`);
      }
    }
  } catch { /* ignore */ }
  return sel;
}

function serializeSchedule(sel) {
  const result = {};
  for (const day of DAYS) {
    const hours = GRID_HOURS.filter((h) => sel.has(`${day}-${h}`)).sort((a, b) => a - b);
    if (!hours.length) continue;
    const ranges = [];
    let start = hours[0], prev = hours[0];
    for (let i = 1; i < hours.length; i++) {
      if (hours[i] === prev + 1) { prev = hours[i]; }
      else { ranges.push({ from: start, to: prev + 1 }); start = hours[i]; prev = hours[i]; }
    }
    ranges.push({ from: start, to: prev + 1 });
    result[day] = ranges;
  }
  return Object.keys(result).length ? JSON.stringify(result) : '';
}

// ─── Main component ──────────────────────────────────────────────

export default function Profile() {
  const { m } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.sub;

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio]                 = useState('');
  const [language, setLanguage]       = useState('en');
  const [timezone, setTimezone]       = useState('UTC');
  const [location, setLocation]       = useState('');

  // Preference fields
  const [preferredLanguages, setPreferredLanguages]         = useState([]); // string[]
  const [preferredTimezoneRange, setPreferredTimezoneRange] = useState('');
  const [scheduleSelected, setScheduleSelected]             = useState(new Set());

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [p, prefs] = await Promise.all([
          usersApi.getProfile(userId),
          usersApi.getPreferences(userId).catch(() => null),
        ]);
        if (cancelled) return;
        setProfile(p);
        setDisplayName(p.displayName || '');
        setBio(p.bio || '');
        setLanguage(p.language || 'en');
        setTimezone(p.timezone || 'UTC');
        setLocation(p.location || '');
        if (prefs) {
          setPreferredLanguages(prefs.preferredLanguages || []);
          setPreferredTimezoneRange(prefs.preferredTimezoneRange || '');
          setScheduleSelected(parseSchedule(prefs.availabilitySchedule));
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

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setSaved(false); setError(null);
    try {
      const updatedProfile = await usersApi.updateProfile(userId, {
        displayName: displayName.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: profile?.avatarUrl || null,
        language: language || null,
        timezone: timezone || null,
        location: location.trim() || null,
      });
      setProfile(updatedProfile);

      const prefsPayload = {};
      if (preferredLanguages.length) prefsPayload.preferredLanguages = preferredLanguages;
      if (preferredTimezoneRange.trim()) prefsPayload.preferredTimezoneRange = preferredTimezoneRange.trim();
      const scheduleJson = serializeSchedule(scheduleSelected);
      if (scheduleJson) prefsPayload.availabilitySchedule = scheduleJson;

      if (Object.keys(prefsPayload).length) {
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

  if (loading) return <Centered m={m} title={t('profile.loading')} />;
  if (error && !profile) return <Centered m={m} title={t('profile.loadError')} subtitle={error} />;

  return (
    <div style={{ padding: '24px 40px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>{t('profile.title')}</h2>
          <div style={{ fontSize: 13, color: m.ink50, marginTop: 2 }}>{t('profile.subtitle')}</div>
        </div>
        <RatingBadge m={m} t={t} rating={profile?.rating} />
      </div>

      {error && <ErrorBanner m={m} message={error} />}
      {saved && <SuccessBanner m={m} message={t('profile.savedBanner')} />}

      <form onSubmit={handleSave}>

        <Section m={m} title={t('profile.section.identity')}>
          <Row>
            <Field m={m} label={t('profile.field.displayName')}>
              <Input m={m} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('profile.field.displayNamePlaceholder')} />
            </Field>
            <Field m={m} label={t('profile.field.location')}>
              <Input m={m} value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('profile.field.locationPlaceholder')} />
            </Field>
          </Row>
          <Field m={m} label={t('profile.field.bio')} hint={t('profile.field.bioHint')}>
            <Textarea m={m} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280}
              placeholder={t('profile.field.bioPlaceholder')} />
          </Field>
        </Section>

        <Section m={m} title={t('profile.section.locale')}>
          <Row>
            <Field m={m} label={t('profile.field.primaryLanguage')}>
              <LanguageSelect m={m} t={t} value={language} onChange={setLanguage} />
            </Field>
            <Field m={m} label={t('profile.field.timezone')}>
              <TimezoneSelect m={m} t={t} value={timezone} onChange={setTimezone} />
            </Field>
          </Row>
        </Section>

        <Section m={m} title={t('profile.section.preferences')}>
          <Field m={m} label={t('profile.field.otherLanguages')}>
            <LanguageMultiSelect m={m} t={t} value={preferredLanguages} onChange={setPreferredLanguages} />
          </Field>
          <Field m={m} label={t('profile.field.preferredTzRange')} hint={t('profile.field.preferredTzRangeHint')}>
            <TimezoneRangeSelect m={m} t={t} value={preferredTimezoneRange} onChange={setPreferredTimezoneRange} />
          </Field>
        </Section>

        <Section m={m} title={t('profile.section.availability')}>
          <div style={{ fontSize: 12, color: m.ink50, marginBottom: 12, lineHeight: 1.5 }}>
            {t('profile.availabilityHint')}
          </div>
          <AvailabilityGrid m={m} t={t} selected={scheduleSelected} onChange={setScheduleSelected} />
        </Section>

        <div style={{ marginTop: 24 }}>
          <button
            type="submit" disabled={saving}
            style={{
              background: m.ink, color: m.bg, border: 'none',
              padding: '11px 22px', borderRadius: 8, fontSize: 14,
              fontFamily: m.font, fontWeight: 500,
              cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? t('profile.saving') : t('profile.save')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── LanguageSelect ──────────────────────────────────────────────

function LanguageSelect({ m, t, value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const selected = LANGUAGES.find((l) => l.code === value);
  const filtered = LANGUAGES.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.code.includes(search.toLowerCase()),
  );

  useClickOutside(ref, () => { setOpen(false); setSearch(''); });

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(''); }}
        style={selectBtnStyle(m)}
      >
        <span>{selected ? `${selected.name} (${selected.code})` : value || t('profile.selectLanguage')}</span>
        <span style={{ fontSize: 10, color: m.ink50 }}>▾</span>
      </button>
      {open && (
        <Dropdown m={m}>
          <DropdownSearch m={m} value={search} onChange={setSearch} placeholder={t('profile.searchPlaceholder')} />
          {filtered.length === 0
            ? <DropdownEmpty m={m} />
            : filtered.map((l) => (
              <DropdownItem
                key={l.code} m={m}
                active={l.code === value}
                onClick={() => { onChange(l.code); setOpen(false); setSearch(''); }}
              >
                {l.name} <span style={{ fontFamily: m.mono, color: m.ink50, fontSize: 11 }}>({l.code})</span>
              </DropdownItem>
            ))}
        </Dropdown>
      )}
    </div>
  );
}

// ─── TimezoneSelect ──────────────────────────────────────────────

function TimezoneSelect({ m, t, value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const filtered = TZ_LIST.filter((tz) => tz.toLowerCase().includes(search.toLowerCase()));

  useClickOutside(ref, () => { setOpen(false); setSearch(''); });

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(''); }}
        style={selectBtnStyle(m)}
      >
        <span style={{ fontFamily: m.mono, fontSize: 13 }}>{value || t('profile.selectTimezone')}</span>
        <span style={{ fontSize: 10, color: m.ink50 }}>▾</span>
      </button>
      {open && (
        <Dropdown m={m} maxH={220}>
          <DropdownSearch m={m} value={search} onChange={setSearch} placeholder={t('profile.tzSearchPlaceholder')} mono />
          {filtered.length === 0
            ? <DropdownEmpty m={m} />
            : filtered.slice(0, 100).map((tz) => (
              <DropdownItem
                key={tz} m={m}
                active={tz === value}
                onClick={() => { onChange(tz); setOpen(false); setSearch(''); }}
              >
                <span style={{ fontFamily: m.mono, fontSize: 12.5 }}>{tz}</span>
              </DropdownItem>
            ))}
        </Dropdown>
      )}
    </div>
  );
}

// ─── LanguageMultiSelect ─────────────────────────────────────────

function LanguageMultiSelect({ m, t, value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const filtered = LANGUAGES.filter(
    (l) =>
      !value.includes(l.code) &&
      (l.name.toLowerCase().includes(search.toLowerCase()) || l.code.includes(search.toLowerCase())),
  );

  useClickOutside(ref, () => { setOpen(false); setSearch(''); });

  function remove(code) {
    onChange(value.filter((c) => c !== code));
  }

  function add(code) {
    onChange([...value, code]);
    setSearch('');
  }

  return (
    <div ref={ref}>
      {/* Chips row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {value.map((code) => {
          const lang = LANGUAGES.find((l) => l.code === code);
          return (
            <span key={code} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 999,
              background: m.ink10, fontSize: 12, fontFamily: m.mono,
            }}>
              {lang ? lang.name : code}
              <button
                type="button"
                onClick={() => remove(code)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.ink50, padding: 0, fontSize: 12, lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          );
        })}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            style={{
              padding: '3px 10px', borderRadius: 999,
              background: 'transparent', border: `1px dashed ${m.ink20}`,
              color: m.ink50, cursor: 'pointer', fontSize: 12, fontFamily: m.mono,
            }}
          >
            {t('profile.addLanguage')}
          </button>
          {open && (
            <Dropdown m={m} left={0} maxH={200}>
              <DropdownSearch m={m} value={search} onChange={setSearch} placeholder={t('profile.searchPlaceholder')} />
              {filtered.length === 0
                ? <DropdownEmpty m={m} text={search ? t('profile.noMatch') : t('profile.allAdded')} />
                : filtered.map((l) => (
                  <DropdownItem key={l.code} m={m} onClick={() => add(l.code)}>
                    {l.name} <span style={{ fontFamily: m.mono, color: m.ink50, fontSize: 11 }}>({l.code})</span>
                  </DropdownItem>
                ))}
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TimezoneRangeSelect ─────────────────────────────────────────

const TZ_RANGES = [
  'UTC-12 to UTC-9', 'UTC-8 to UTC-5', 'UTC-4 to UTC-1',
  'UTC+0 to UTC+2',  'UTC+2 to UTC+4', 'UTC+4 to UTC+6',
  'UTC+5 to UTC+7',  'UTC+8 to UTC+10','UTC+10 to UTC+14',
];

function TimezoneRangeSelect({ m, t, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', padding: '10px 12px',
        background: m.bg, color: m.ink,
        border: `1px solid ${m.ink20}`, borderRadius: 8,
        fontSize: 13.5, fontFamily: m.font, outline: 'none',
        appearance: 'none',
      }}
    >
      <option value="">{t('profile.anyTimezone')}</option>
      {TZ_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
    </select>
  );
}

// ─── AvailabilityGrid ────────────────────────────────────────────

function AvailabilityGrid({ m, t, selected, onChange }) {
  const dragging  = useRef(false);
  const dragAction = useRef('add'); // 'add' | 'remove'

  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  function applyCell(day, hour, forceAction) {
    const key = `${day}-${hour}`;
    const action = forceAction ?? (selected.has(key) ? 'remove' : 'add');
    onChange((prev) => {
      const next = new Set(prev);
      action === 'remove' ? next.delete(key) : next.add(key);
      return next;
    });
    return action;
  }

  function handleMouseDown(day, hour) {
    dragging.current = true;
    dragAction.current = applyCell(day, hour);
  }

  function handleMouseEnter(day, hour) {
    if (!dragging.current) return;
    applyCell(day, hour, dragAction.current);
  }

  // Quick row-fill: click day header to toggle whole day
  function toggleDay(day) {
    const allOn = GRID_HOURS.every((h) => selected.has(`${day}-${h}`));
    onChange((prev) => {
      const next = new Set(prev);
      GRID_HOURS.forEach((h) => allOn ? next.delete(`${day}-${h}`) : next.add(`${day}-${h}`));
      return next;
    });
  }

  // Quick column-fill: click hour label to toggle that hour across all days
  function toggleHour(hour) {
    const allOn = DAYS.every((d) => selected.has(`${d}-${hour}`));
    onChange((prev) => {
      const next = new Set(prev);
      DAYS.forEach((d) => allOn ? next.delete(`${d}-${hour}`) : next.add(`${d}-${hour}`));
      return next;
    });
  }

  function clearAll() { onChange(new Set()); }

  // Summary
  const totalHours = selected.size;
  const daysActive = DAYS.filter((d) => GRID_HOURS.some((h) => selected.has(`${d}-${h}`))).length;

  const CELL_W = 36;
  const CELL_H = 22;

  return (
    <div>
      {/* Header stats + clear button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontFamily: m.mono, color: m.ink50 }}>
          {totalHours > 0
            ? t('profile.availabilitySummary', { count: totalHours, days: daysActive })
            : t('profile.availabilityNone')}
        </div>
        {totalHours > 0 && (
          <button
            type="button" onClick={clearAll}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: m.mono, color: m.ink50 }}
          >
            {t('profile.availabilityClear')}
          </button>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(7, ${CELL_W}px)`, gap: 2, userSelect: 'none' }}>
        {/* Corner cell */}
        <div />
        {/* Day headers */}
        {DAYS.map((day, i) => (
          <button
            key={day} type="button"
            onClick={() => toggleDay(day)}
            title={t('profile.toggleDay', { day: t(`profile.days.${day}`) })}
            style={{
              background: m.ink10, border: 'none', cursor: 'pointer',
              borderRadius: 4, height: 22,
              fontSize: 10, fontFamily: m.mono, color: m.ink70,
              textTransform: 'uppercase',
            }}
          >
            {t(`profile.days.${day}`)}
          </button>
        ))}

        {/* Hour rows */}
        {GRID_HOURS.map((hour) => (
          <>
            {/* Hour label (clickable to toggle whole row) */}
            <button
              key={`lbl-${hour}`}
              type="button"
              onClick={() => toggleHour(hour)}
              title={t('profile.toggleHour', { hour: String(hour).padStart(2, '0') })}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'right', paddingRight: 6,
                fontSize: 10, fontFamily: m.mono, color: m.ink50,
                height: CELL_H,
              }}
            >
              {String(hour).padStart(2, '0')}
            </button>

            {/* Day cells */}
            {DAYS.map((day) => {
              const key = `${day}-${hour}`;
              const on = selected.has(key);
              return (
                <div
                  key={key}
                  onMouseDown={() => handleMouseDown(day, hour)}
                  onMouseEnter={() => handleMouseEnter(day, hour)}
                  style={{
                    height: CELL_H,
                    borderRadius: 3,
                    background: on ? m.accent : m.ink10,
                    cursor: 'pointer',
                    transition: 'background 80ms',
                    opacity: on ? 1 : 0.55,
                  }}
                />
              );
            })}
          </>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 11, color: m.ink50, fontFamily: m.mono }}>
        {t('profile.availabilityFooter')}
      </div>
    </div>
  );
}

function day_label(code) {
  return DAY_SHORT[DAYS.indexOf(code)] || code;
}

// ─── Dropdown primitives ─────────────────────────────────────────

function Dropdown({ m, children, left = 0, maxH = 260 }) {
  return (
    <div style={{
      position: 'absolute', top: '100%', left, zIndex: 200, marginTop: 4,
      minWidth: 220, maxHeight: maxH, overflowY: 'auto',
      background: m.panel, border: `1px solid ${m.ink20}`, borderRadius: 8,
      boxShadow: `0 8px 24px ${m.ink10}`,
    }}>
      {children}
    </div>
  );
}

function DropdownSearch({ m, value, onChange, placeholder, mono }) {
  return (
    <div style={{ padding: '8px 8px 4px', position: 'sticky', top: 0, background: m.panel }}>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '6px 10px', boxSizing: 'border-box',
          background: m.bg, color: m.ink, border: `1px solid ${m.ink20}`,
          borderRadius: 6, fontSize: 12.5, fontFamily: mono ? m.mono : m.font,
          outline: 'none',
        }}
      />
    </div>
  );
}

function DropdownItem({ m, children, onClick, active }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '8px 12px', cursor: 'pointer', fontSize: 13,
        background: active ? m.accentSoft : 'transparent',
        color: active ? m.accent : m.ink,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = m.ink10; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = active ? m.accentSoft : 'transparent'; }}
    >
      {children}
    </div>
  );
}

function DropdownEmpty({ m, text }) {
  return (
    <div style={{ padding: '10px 12px', fontSize: 12, color: m.ink50, fontFamily: m.mono }}>
      {text || 'No results'}
    </div>
  );
}

// ─── Shared form atoms ───────────────────────────────────────────

function selectBtnStyle(m) {
  return {
    width: '100%', padding: '10px 12px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: m.bg, color: m.ink, border: `1px solid ${m.ink20}`,
    borderRadius: 8, fontSize: 13.5, fontFamily: m.font,
    cursor: 'pointer', textAlign: 'left',
  };
}

function Section({ m, title, children }) {
  return (
    <div style={{
      background: m.panel, border: `1px solid ${m.ink10}`,
      borderRadius: 12, padding: 22, marginBottom: 14,
    }}>
      <div style={{
        fontSize: 11, fontFamily: m.mono, color: m.ink50,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 2 }}>{children}</div>;
}

function Field({ m, label, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
    <input {...rest} style={{
      width: '100%', padding: '10px 12px',
      background: m.bg, color: m.ink, border: `1px solid ${m.ink20}`,
      borderRadius: 8, fontSize: 13.5, fontFamily: m.font, outline: 'none',
    }} />
  );
}

function Textarea({ m, rows = 3, ...rest }) {
  return (
    <textarea {...rest} rows={rows} style={{
      width: '100%', padding: '10px 12px',
      background: m.bg, color: m.ink, border: `1px solid ${m.ink20}`,
      borderRadius: 8, fontSize: 13.5, fontFamily: m.font,
      outline: 'none', resize: 'vertical', lineHeight: 1.5,
    }} />
  );
}

function RatingBadge({ m, t, rating }) {
  if (rating == null) return <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono }}>{t('profile.noReviews')}</div>;
  return (
    <div style={{ background: m.accentSoft, color: m.accent, padding: '6px 12px', borderRadius: 8, fontFamily: m.mono, fontSize: 13 }}>
      ★ {Number(rating).toFixed(2)} / 5
    </div>
  );
}

function ErrorBanner({ m, message }) {
  return (
    <div role="alert" style={{
      padding: '10px 14px', borderRadius: 8,
      background: '#fee', color: '#902020', border: '1px solid #f3c0c0',
      fontSize: 13, marginBottom: 14,
    }}>
      {message}
    </div>
  );
}

function SuccessBanner({ m, message }) {
  return (
    <div role="status" style={{
      padding: '10px 14px', borderRadius: 8,
      background: m.accentSoft, color: m.accent, border: `1px solid ${m.accent}`,
      fontSize: 13, marginBottom: 14,
    }}>
      {message}
    </div>
  );
}

function Centered({ m, title, subtitle }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '160px 40px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 500, color: m.ink }}>{title}</div>
        {subtitle && <div style={{ marginTop: 8, fontSize: 13, color: m.ink50, fontFamily: m.mono }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────

function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (ref.current && !ref.current.contains(e.target)) handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}
