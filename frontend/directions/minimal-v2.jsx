// Direction A v2 — Refined Minimal, themable (light/dark)
// All components accept implicit theme via window.minTheme (mutated by Tweaks).

const minTheme = window.minTheme || (window.minTheme = { mode: 'light', accent: 'oklch(0.58 0.22 285)' });

function makeMin() {
  const dark = minTheme.mode === 'dark';
  const accent = minTheme.accent;
  return {
    font: "'IBM Plex Sans', -apple-system, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, monospace",
    bg: dark ? '#0d0d0c' : '#fafaf7',
    panel: dark ? '#161614' : '#ffffff',
    ink: dark ? '#f5f4ef' : '#0e0e0c',
    ink70: dark ? 'rgba(245,244,239,0.7)' : 'rgba(14,14,12,0.7)',
    ink50: dark ? 'rgba(245,244,239,0.5)' : 'rgba(14,14,12,0.5)',
    ink20: dark ? 'rgba(245,244,239,0.16)' : 'rgba(14,14,12,0.12)',
    ink10: dark ? 'rgba(245,244,239,0.09)' : 'rgba(14,14,12,0.07)',
    accent,
    accentSoft: dark ? accent + '22' : accent + '15',
    accentInk: dark ? accent : accent,
  };
}

// Shared chrome ─────────────────────────────────────────────
function MinNav({ active = 'Browse' }) {
  const m = makeMin();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: `1px solid ${m.ink10}`, background: m.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: m.ink }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: m.ink, display: 'grid', placeItems: 'center', color: m.bg, fontFamily: m.mono, fontSize: 13 }}>⇄</div>
        skillswap
      </div>
      <div style={{ display: 'flex', gap: 28, fontSize: 13.5 }}>
        {['Browse', 'Matches', 'Schedule', 'Messages', 'Dashboard'].map(n => (
          <span key={n} style={{ color: n === active ? m.ink : m.ink70, fontWeight: n === active ? 500 : 400, position: 'relative' }}>
            {n}
            {n === active && <span style={{ position: 'absolute', left: 0, right: 0, bottom: -22, height: 1.5, background: m.ink }}></span>}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13.5, color: m.ink }}>
        <span style={{ color: m.ink70, fontFamily: m.mono, fontSize: 12 }}>Q · 24h</span>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: m.accent, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>Q</div>
      </div>
    </div>
  );
}

// 1 — LANDING (kept) ─────────────────────────────────────────
function MinLanding() {
  const m = makeMin();
  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font, position: 'relative', overflow: 'hidden', letterSpacing: '-0.01em' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: `1px solid ${m.ink10}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: m.ink, display: 'grid', placeItems: 'center', color: m.bg, fontFamily: m.mono, fontSize: 13 }}>⇄</div>
          skillswap
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 13.5, color: m.ink70 }}>
          <span>Browse</span><span>How it works</span><span>Communities</span><span>Pricing</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5 }}>
          <span style={{ color: m.ink70 }}>Sign in</span>
          <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '7px 14px', borderRadius: 7, fontSize: 13, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>Get started →</button>
        </div>
      </div>

      <div style={{ padding: '72px 40px 40px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: m.accentSoft, color: m.accent, borderRadius: 999, fontSize: 12, fontFamily: m.mono, marginBottom: 24 }}>
            <span style={{ width: 5, height: 5, borderRadius: 5, background: m.accent }}></span>
            v2.4 — Group sessions are live
          </div>
          <h1 style={{ fontSize: 72, lineHeight: 0.96, letterSpacing: '-0.035em', fontWeight: 500, margin: 0, marginBottom: 20 }}>
            Trade what you know<br/>for what you<br/>
            <span style={{ color: m.accent, fontStyle: 'italic', fontWeight: 400 }}>want to learn.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: m.ink70, maxWidth: 480, margin: 0, marginBottom: 32 }}>
            A peer-to-peer exchange where every hour you teach earns you an hour of learning. No money, no platform fees — just skills moving between people.
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
            <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: m.font, cursor: 'pointer' }}>Find your match →</button>
            <button style={{ background: 'transparent', color: m.ink, border: `1px solid ${m.ink20}`, padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: m.font, cursor: 'pointer' }}>List a skill</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, borderTop: `1px solid ${m.ink10}`, paddingTop: 20, fontFamily: m.mono }}>
            {[['12,408', 'active swaps this week'], ['184', 'skill categories'], ['96%', 'session completion']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{n}</div>
                <div style={{ fontSize: 11, color: m.ink50, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, fontFamily: m.mono, fontSize: 11, color: m.ink50, display: 'flex', justifyContent: 'space-between' }}>
            <span>// live exchange feed</span>
            <span>↓ paused</span>
          </div>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { a: 'Mira K.', as: 'Italian conversation', b: 'Dax R.', bs: 'Watercolor basics', mt: '94%' },
              { a: 'Jules', as: 'React performance', b: 'Sana W.', bs: 'Sourdough method', mt: '88%' },
              { a: 'Theo H.', as: 'Jazz piano', b: 'Anya P.', bs: 'Public speaking', mt: '82%' },
            ].map((r, i) => (
              <div key={i} style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 10, padding: 16, display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', alignItems: 'center', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.a}</div>
                  <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono }}>teaches {r.as}</div>
                </div>
                <div style={{ color: m.ink20, fontSize: 18 }}>⇄</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.b}</div>
                  <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono }}>teaches {r.bs}</div>
                </div>
                <div style={{ fontFamily: m.mono, fontSize: 11, color: m.accent, background: m.accentSoft, padding: '3px 8px', borderRadius: 5 }}>{r.mt}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, padding: 16, border: `1px dashed ${m.ink20}`, borderRadius: 10, fontFamily: m.mono, fontSize: 12, color: m.ink70, lineHeight: 1.55 }}>
            <div style={{ color: m.ink, marginBottom: 6 }}>Your offer</div>
            I can teach <span style={{ color: m.accent }}>Figma prototyping</span> for 4hr,<br/>
            looking for <span style={{ color: m.accent }}>conversational Spanish</span>.
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 40px', borderTop: `1px solid ${m.ink10}`, display: 'flex', justifyContent: 'space-between', fontFamily: m.mono, fontSize: 11, color: m.ink50 }}>
        <span>SKILLSWAP / 2026</span>
        <span>↳ Trusted by communities at MIT, RISD, Recurse Center +14 more</span>
        <span>EN · ES · DE · JA</span>
      </div>
    </div>
  );
}

// 2 — BROWSE ────────────────────────────────────────────────
function MinBrowse() {
  const m = makeMin();
  const skills = [
    { c: 'Languages', t: 'Conversational Japanese', who: 'Aiko T.', loc: 'Kyoto · remote', rate: '1hr / 1hr', tags: ['N3+', 'beginner-friendly'], match: 94 },
    { c: 'Music', t: 'Jazz piano fundamentals', who: 'Theo H.', loc: 'Berlin', rate: '1hr / 1hr', tags: ['voicings', 'theory'] },
    { c: 'Code', t: 'React performance audits', who: 'Jules M.', loc: 'remote', rate: '1hr / 1.5hr', tags: ['profiler', 'memo'] },
    { c: 'Craft', t: 'Sourdough from scratch', who: 'Sana W.', loc: 'Lisbon', rate: '2hr / 1hr', tags: ['levain', 'shaping'] },
    { c: 'Design', t: 'Figma prototyping', who: 'Quinn L.', loc: 'remote', rate: '1hr / 1hr', tags: ['variables', 'auto-layout'] },
    { c: 'Wellness', t: 'Vinyasa yoga', who: 'Priya R.', loc: 'NYC', rate: '1hr / 1hr', tags: ['flow', 'beginner'] },
  ];
  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font, display: 'grid', gridTemplateColumns: '240px 1fr' }}>
      <div style={{ borderRight: `1px solid ${m.ink10}`, padding: '20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 28 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: m.ink, color: m.bg, display: 'grid', placeItems: 'center', fontFamily: m.mono, fontSize: 12 }}>⇄</div>
          skillswap
        </div>
        <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Categories</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
          {[['All', 184, true], ['Languages', 42], ['Music', 28], ['Code', 31], ['Craft', 19], ['Design', 24], ['Wellness', 22], ['Cooking', 18]].map(([n, c, active]) => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, fontSize: 13.5, background: active ? m.ink10 : 'transparent', fontWeight: active ? 500 : 400 }}>
              <span>{n}</span>
              <span style={{ color: m.ink50, fontFamily: m.mono, fontSize: 12 }}>{c}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Format</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, marginBottom: 24 }}>
          {['1-on-1 video', 'In-person', 'Async / recorded', 'Group class'].map((x, i) => (
            <label key={x} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, border: `1.5px solid ${m.ink20}`, borderRadius: 3, background: i < 2 ? m.ink : 'transparent' }}></span>
              {x}
            </label>
          ))}
        </div>
        <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Your offer</div>
        <div style={{ padding: 12, background: m.accentSoft, borderRadius: 8, fontSize: 12.5, lineHeight: 1.5, color: m.ink70 }}>
          Teaching <span style={{ color: m.accent, fontWeight: 600 }}>Figma</span><br/>Looking for <span style={{ color: m.accent, fontWeight: 600 }}>Spanish</span>
        </div>
      </div>

      <div style={{ padding: '20px 28px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 8, width: 420, fontSize: 13, color: m.ink50 }}>
            <span>⌕</span> Search 184 skills, 12k people…
            <span style={{ marginLeft: 'auto', fontFamily: m.mono, fontSize: 11, padding: '2px 6px', background: m.ink10, borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 12.5, fontFamily: m.mono, color: m.ink70 }}>
            <span style={{ padding: '4px 10px', borderRadius: 6, background: m.ink10, color: m.ink }}>Best match</span>
            <span style={{ padding: '4px 10px' }}>Newest</span>
            <span style={{ padding: '4px 10px' }}>Nearest</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {skills.map((s, i) => (
            <div key={i} style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.c}</span>
                {s.match && <span style={{ fontSize: 10, fontFamily: m.mono, padding: '2px 6px', background: m.accent, color: '#fff', borderRadius: 4 }}>{s.match}% MATCH</span>}
              </div>
              <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 16, lineHeight: 1.2 }}>{s.t}</div>
              <div style={{ height: 90, borderRadius: 8, marginBottom: 14, background: `repeating-linear-gradient(45deg, ${m.ink10}, ${m.ink10} 6px, transparent 6px, transparent 12px), ${m.bg}`, display: 'grid', placeItems: 'center', fontFamily: m.mono, fontSize: 11, color: m.ink50 }}>teacher photo</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.who}</div>
                  <div style={{ fontSize: 11.5, color: m.ink50 }}>{s.loc}</div>
                </div>
                <div style={{ fontFamily: m.mono, fontSize: 11, color: m.ink70 }}>{s.rate}</div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {s.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: m.ink10, color: m.ink70, fontFamily: m.mono }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { makeMin, MinNav, MinLanding, MinBrowse });
