// Direction A — Refined Minimal ("Linear-ish")
// Near-monochrome warm gray with a single electric violet accent.
// IBM Plex Sans + Plex Mono. Tight grid, dense info, restrained motion.

const minStyles = {
  font: "'IBM Plex Sans', -apple-system, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
  bg: '#fafaf7',
  ink: '#0e0e0c',
  ink70: 'rgba(14,14,12,0.7)',
  ink50: 'rgba(14,14,12,0.5)',
  ink20: 'rgba(14,14,12,0.12)',
  ink10: 'rgba(14,14,12,0.07)',
  accent: 'oklch(0.58 0.22 285)', // electric violet
  accentSoft: 'oklch(0.96 0.04 285)',
};

function MinLanding() {
  return (
    <div style={{
      width: 1280, height: 880, background: minStyles.bg, color: minStyles.ink,
      fontFamily: minStyles.font, position: 'relative', overflow: 'hidden',
      letterSpacing: '-0.01em',
    }}>
      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: `1px solid ${minStyles.ink10}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, background: minStyles.ink,
            display: 'grid', placeItems: 'center', color: minStyles.bg,
            fontFamily: minStyles.mono, fontSize: 13,
          }}>⇄</div>
          skillswap
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 13.5, color: minStyles.ink70 }}>
          <span>Browse</span><span>How it works</span><span>Communities</span><span>Pricing</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5 }}>
          <span style={{ color: minStyles.ink70 }}>Sign in</span>
          <button style={{
            background: minStyles.ink, color: minStyles.bg, border: 'none',
            padding: '7px 14px', borderRadius: 7, fontSize: 13, fontFamily: minStyles.font,
            fontWeight: 500, cursor: 'pointer',
          }}>Get started →</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '72px 40px 40px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 64 }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px',
            background: minStyles.accentSoft, color: minStyles.accent,
            borderRadius: 999, fontSize: 12, fontFamily: minStyles.mono, marginBottom: 24,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 5, background: minStyles.accent }}></span>
            v2.4 — Group sessions are live
          </div>
          <h1 style={{
            fontSize: 72, lineHeight: 0.96, letterSpacing: '-0.035em',
            fontWeight: 500, margin: 0, marginBottom: 20,
          }}>
            Trade what you know<br/>
            for what you<br/>
            <span style={{ color: minStyles.accent, fontStyle: 'italic', fontWeight: 400 }}>want to learn.</span>
          </h1>
          <p style={{
            fontSize: 17, lineHeight: 1.5, color: minStyles.ink70,
            maxWidth: 480, margin: 0, marginBottom: 32,
          }}>
            A peer-to-peer exchange where every hour you teach earns you an hour of learning. No money, no platform fees — just skills moving between people.
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
            <button style={{
              background: minStyles.ink, color: minStyles.bg, border: 'none',
              padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              fontFamily: minStyles.font, cursor: 'pointer',
            }}>Find your match →</button>
            <button style={{
              background: 'transparent', color: minStyles.ink, border: `1px solid ${minStyles.ink20}`,
              padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500,
              fontFamily: minStyles.font, cursor: 'pointer',
            }}>List a skill</button>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0,
            borderTop: `1px solid ${minStyles.ink10}`, paddingTop: 20,
            fontFamily: minStyles.mono,
          }}>
            {[['12,408', 'active swaps this week'], ['184', 'skill categories'], ['96%', 'session completion']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{n}</div>
                <div style={{ fontSize: 11, color: minStyles.ink50, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: live match card */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            fontFamily: minStyles.mono, fontSize: 11, color: minStyles.ink50,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>// live exchange feed</span>
            <span>↓ paused</span>
          </div>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { a: 'Mira K.', as: 'Italian conversation', b: 'Dax R.', bs: 'Watercolor basics', m: '94%' },
              { a: 'Jules', as: 'React performance', b: 'Sana W.', bs: 'Sourdough method', m: '88%' },
              { a: 'Theo H.', as: 'Jazz piano', b: 'Anya P.', bs: 'Public speaking', m: '82%' },
            ].map((r, i) => (
              <div key={i} style={{
                background: '#fff', border: `1px solid ${minStyles.ink10}`,
                borderRadius: 10, padding: 16, display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto', alignItems: 'center', gap: 14,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.a}</div>
                  <div style={{ fontSize: 12, color: minStyles.ink50, fontFamily: minStyles.mono }}>teaches {r.as}</div>
                </div>
                <div style={{ color: minStyles.ink20, fontSize: 18 }}>⇄</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.b}</div>
                  <div style={{ fontSize: 12, color: minStyles.ink50, fontFamily: minStyles.mono }}>teaches {r.bs}</div>
                </div>
                <div style={{
                  fontFamily: minStyles.mono, fontSize: 11, color: minStyles.accent,
                  background: minStyles.accentSoft, padding: '3px 8px', borderRadius: 5,
                }}>{r.m}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 18, padding: 16, border: `1px dashed ${minStyles.ink20}`,
            borderRadius: 10, fontFamily: minStyles.mono, fontSize: 12,
            color: minStyles.ink70, lineHeight: 1.55,
          }}>
            <div style={{ color: minStyles.ink, marginBottom: 6 }}>Your offer</div>
            I can teach <span style={{ color: minStyles.accent }}>Figma prototyping</span> for 4hr,<br/>
            looking for <span style={{ color: minStyles.accent }}>conversational Spanish</span>.
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 40px', borderTop: `1px solid ${minStyles.ink10}`,
        display: 'flex', justifyContent: 'space-between', fontFamily: minStyles.mono,
        fontSize: 11, color: minStyles.ink50,
      }}>
        <span>SKILLSWAP / 2026</span>
        <span>↳ Trusted by communities at MIT, RISD, Recurse Center +14 more</span>
        <span>EN · ES · DE · JA</span>
      </div>
    </div>
  );
}

function MinBrowse() {
  const skills = [
    { c: 'Languages', t: 'Conversational Japanese', who: 'Aiko T.', loc: 'Kyoto · remote', rate: '1hr / 1hr', tags: ['N3+', 'beginner-friendly'], color: minStyles.accent },
    { c: 'Music', t: 'Jazz piano fundamentals', who: 'Theo H.', loc: 'Berlin', rate: '1hr / 1hr', tags: ['voicings', 'theory'] },
    { c: 'Code', t: 'React performance audits', who: 'Jules M.', loc: 'remote', rate: '1hr / 1.5hr', tags: ['profiler', 'memo'] },
    { c: 'Craft', t: 'Sourdough from scratch', who: 'Sana W.', loc: 'Lisbon', rate: '2hr / 1hr', tags: ['levain', 'shaping'] },
    { c: 'Design', t: 'Figma prototyping', who: 'Quinn L.', loc: 'remote', rate: '1hr / 1hr', tags: ['variables', 'auto-layout'] },
    { c: 'Wellness', t: 'Vinyasa yoga', who: 'Priya R.', loc: 'NYC', rate: '1hr / 1hr', tags: ['flow', 'beginner'] },
  ];
  return (
    <div style={{
      width: 1280, height: 880, background: minStyles.bg, color: minStyles.ink,
      fontFamily: minStyles.font, display: 'grid', gridTemplateColumns: '240px 1fr',
    }}>
      {/* Sidebar */}
      <div style={{ borderRight: `1px solid ${minStyles.ink10}`, padding: '20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 28 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: minStyles.ink, color: minStyles.bg, display: 'grid', placeItems: 'center', fontFamily: minStyles.mono, fontSize: 12 }}>⇄</div>
          skillswap
        </div>
        <div style={{ fontSize: 11, fontFamily: minStyles.mono, color: minStyles.ink50, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Categories</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
          {[['All', 184, true], ['Languages', 42], ['Music', 28], ['Code', 31], ['Craft', 19], ['Design', 24], ['Wellness', 22], ['Cooking', 18]].map(([n, c, active]) => (
            <div key={n} style={{
              display: 'flex', justifyContent: 'space-between', padding: '6px 8px',
              borderRadius: 6, fontSize: 13.5,
              background: active ? minStyles.ink10 : 'transparent',
              fontWeight: active ? 500 : 400,
            }}>
              <span>{n}</span>
              <span style={{ color: minStyles.ink50, fontFamily: minStyles.mono, fontSize: 12 }}>{c}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, fontFamily: minStyles.mono, color: minStyles.ink50, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Format</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13.5, marginBottom: 24 }}>
          {['1-on-1 video', 'In-person', 'Async / recorded', 'Group class'].map((x, i) => (
            <label key={x} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, border: `1.5px solid ${minStyles.ink20}`, borderRadius: 3, background: i < 2 ? minStyles.ink : 'transparent' }}></span>
              {x}
            </label>
          ))}
        </div>
        <div style={{ fontSize: 11, fontFamily: minStyles.mono, color: minStyles.ink50, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Your offer</div>
        <div style={{ padding: 12, background: minStyles.accentSoft, borderRadius: 8, fontSize: 12.5, lineHeight: 1.5, color: minStyles.ink70 }}>
          Teaching <span style={{ color: minStyles.accent, fontWeight: 600 }}>Figma</span><br/>Looking for <span style={{ color: minStyles.accent, fontWeight: 600 }}>Spanish</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: '20px 28px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            background: '#fff', border: `1px solid ${minStyles.ink10}`, borderRadius: 8,
            width: 420, fontSize: 13, color: minStyles.ink50,
          }}>
            <span>⌕</span> Search 184 skills, 12k people…
            <span style={{ marginLeft: 'auto', fontFamily: minStyles.mono, fontSize: 11, padding: '2px 6px', background: minStyles.ink10, borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 12.5, fontFamily: minStyles.mono, color: minStyles.ink70 }}>
            <span style={{ padding: '4px 10px', borderRadius: 6, background: minStyles.ink10, color: minStyles.ink }}>Best match</span>
            <span style={{ padding: '4px 10px' }}>Newest</span>
            <span style={{ padding: '4px 10px' }}>Nearest</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {skills.map((s, i) => (
            <div key={i} style={{
              background: '#fff', border: `1px solid ${minStyles.ink10}`, borderRadius: 12,
              padding: 16, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontFamily: minStyles.mono, color: minStyles.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.c}</span>
                {i === 0 && <span style={{ fontSize: 10, fontFamily: minStyles.mono, padding: '2px 6px', background: minStyles.accent, color: '#fff', borderRadius: 4 }}>94% MATCH</span>}
              </div>
              <div style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 16, lineHeight: 1.2 }}>{s.t}</div>
              {/* placeholder */}
              <div style={{
                height: 90, borderRadius: 8, marginBottom: 14,
                background: `repeating-linear-gradient(45deg, ${minStyles.ink10}, ${minStyles.ink10} 6px, transparent 6px, transparent 12px), ${minStyles.bg}`,
                display: 'grid', placeItems: 'center', fontFamily: minStyles.mono, fontSize: 11, color: minStyles.ink50,
              }}>teacher photo</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.who}</div>
                  <div style={{ fontSize: 11.5, color: minStyles.ink50 }}>{s.loc}</div>
                </div>
                <div style={{ fontFamily: minStyles.mono, fontSize: 11, color: minStyles.ink70 }}>{s.rate}</div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {s.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: minStyles.ink10, color: minStyles.ink70, fontFamily: minStyles.mono }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MinSwap() {
  return (
    <div style={{
      width: 720, height: 880, background: minStyles.bg, color: minStyles.ink,
      fontFamily: minStyles.font, padding: 32, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ fontFamily: minStyles.mono, fontSize: 11, color: minStyles.ink50, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Step 02 / 03 — Propose a swap</div>
      <h2 style={{ fontSize: 36, letterSpacing: '-0.025em', fontWeight: 500, margin: 0, marginBottom: 6, lineHeight: 1.05 }}>
        Define the trade with <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Aiko.</span>
      </h2>
      <p style={{ fontSize: 14.5, color: minStyles.ink70, margin: 0, marginBottom: 28 }}>Both sides commit hours; the system holds them in escrow until each session is marked complete.</p>

      {/* You give / You get */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 14, alignItems: 'center', marginBottom: 24 }}>
        {[{ side: 'You teach', who: 'Quinn (you)', skill: 'Figma prototyping', hrs: 4 }, null, { side: 'You learn', who: 'Aiko T.', skill: 'Conversational Japanese', hrs: 4 }].map((c, i) => {
          if (!c) return <div key={i} style={{ width: 28, height: 28, borderRadius: 28, background: minStyles.ink, color: minStyles.bg, display: 'grid', placeItems: 'center', fontFamily: minStyles.mono }}>⇄</div>;
          return (
            <div key={i} style={{ background: '#fff', border: `1px solid ${minStyles.ink10}`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontFamily: minStyles.mono, fontSize: 11, color: minStyles.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{c.side}</div>
              <div style={{ fontSize: 13, color: minStyles.ink70, marginBottom: 4 }}>{c.who}</div>
              <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 12 }}>{c.skill}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: minStyles.mono }}>
                <span style={{ fontSize: 32, color: minStyles.accent }}>{c.hrs}</span>
                <span style={{ fontSize: 12, color: minStyles.ink50 }}>hours total</span>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} style={{ flex: 1, height: 6, borderRadius: 3, background: n <= c.hrs ? minStyles.accent : minStyles.ink10 }}></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule */}
      <div style={{ background: '#fff', border: `1px solid ${minStyles.ink10}`, borderRadius: 10, padding: 16, marginBottom: 18 }}>
        <div style={{ fontFamily: minStyles.mono, fontSize: 11, color: minStyles.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Schedule — 4 sessions × 1hr</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, fontFamily: minStyles.mono, fontSize: 11 }}>
          {['M','T','W','T','F','S','S'].map((d,i) => (
            <div key={i} style={{ textAlign: 'center', color: minStyles.ink50, paddingBottom: 4 }}>{d}</div>
          ))}
          {Array.from({length: 28}).map((_, i) => {
            const has = [3, 5, 12, 19].includes(i);
            const taught = [3, 12].includes(i);
            return (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 4,
                background: has ? (taught ? minStyles.accent : minStyles.ink) : minStyles.ink10,
                display: 'grid', placeItems: 'center',
                color: has ? '#fff' : minStyles.ink50,
                fontSize: 10,
              }}>{i + 1}</div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, fontFamily: minStyles.mono, fontSize: 11, color: minStyles.ink70, marginTop: 12 }}>
          <span><span style={{ display: 'inline-block', width: 9, height: 9, background: minStyles.accent, borderRadius: 2, marginRight: 5 }}></span>You teach</span>
          <span><span style={{ display: 'inline-block', width: 9, height: 9, background: minStyles.ink, borderRadius: 2, marginRight: 5 }}></span>You learn</span>
        </div>
      </div>

      {/* Note */}
      <div style={{ background: minStyles.accentSoft, borderRadius: 10, padding: 14, fontSize: 13, color: minStyles.ink70, lineHeight: 1.5, marginBottom: 18 }}>
        <span style={{ color: minStyles.accent, fontWeight: 600 }}>Hi Aiko —</span> happy to start with prototyping basics if you'd rather build up to advanced. Feel free to suggest topics for the first lesson.
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{ flex: 1, padding: '13px', background: minStyles.ink, color: minStyles.bg, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: minStyles.font, cursor: 'pointer' }}>Send swap proposal →</button>
        <button style={{ padding: '13px 18px', background: 'transparent', color: minStyles.ink, border: `1px solid ${minStyles.ink20}`, borderRadius: 8, fontSize: 14, fontFamily: minStyles.font, cursor: 'pointer' }}>Save draft</button>
      </div>
    </div>
  );
}

Object.assign(window, { MinLanding, MinBrowse, MinSwap });
