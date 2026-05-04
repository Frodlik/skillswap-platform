// Direction A v2 — Match, Profile, Schedule, Dashboard

// 3 — MATCH (smart matching) ─────────────────────────────────
function MinMatch() {
  const m = makeMin();
  const candidates = [
    { name: 'Aiko Tanaka', skill: 'Conversational Japanese', loc: 'Kyoto · remote', match: 94, why: 'wants Figma · same time zone overlap · 4.9 rating', sessions: 84, hrs: '1:1', sel: true },
    { name: 'Hugo Marín', skill: 'Castilian Spanish', loc: 'Madrid', match: 91, why: 'wants UI design coaching · flexible weekends', sessions: 31, hrs: '1:1' },
    { name: 'Lina Park', skill: 'Korean for travel', loc: 'remote', match: 87, why: 'open to product design swap · 4.8 rating', sessions: 52, hrs: '1:1' },
    { name: 'Daniel Roux', skill: 'French (intermediate)', loc: 'Lyon · remote', match: 85, why: 'designer, wants Figma feedback', sessions: 19, hrs: '1:1' },
    { name: 'Mira K.', skill: 'Italian conversation', loc: 'Florence', match: 78, why: 'open to a wider trade · async-friendly', sessions: 67, hrs: '1:1' },
  ];
  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font }}>
      <MinNav active="Matches" />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 360px', height: 'calc(100% - 65px)' }}>
        {/* Left — your offer */}
        <div style={{ borderRight: `1px solid ${m.ink10}`, padding: '24px 22px' }}>
          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Matching for</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>Quinn Lee</div>
          <div style={{ fontSize: 13, color: m.ink70, marginBottom: 22 }}>Senior product designer · remote</div>

          <div style={{ padding: 14, background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Teaching</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Figma prototyping</div>
            <div style={{ fontSize: 12, color: m.ink70, marginTop: 2 }}>variables · auto-layout · interactive components</div>
            <div style={{ marginTop: 8, fontFamily: m.mono, fontSize: 11, color: m.ink50 }}>4 hr available</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', color: m.ink20, fontSize: 16, margin: '4px 0' }}>↓</div>

          <div style={{ padding: 14, background: m.accentSoft, borderRadius: 10, marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Looking for</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Conversational Spanish or Japanese</div>
            <div style={{ fontSize: 12, color: m.ink70, marginTop: 2 }}>beginner to intermediate · slow pace</div>
            <div style={{ marginTop: 8, fontFamily: m.mono, fontSize: 11, color: m.ink50 }}>4 hr wanted</div>
          </div>

          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Match weights</div>
          {[['Skill alignment', 92], ['Schedule overlap', 86], ['Reciprocity', 78], ['Reviews', 96]].map(([l, v]) => (
            <div key={l} style={{ marginBottom: 10, fontSize: 12.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: m.ink70 }}>{l}</span>
                <span style={{ fontFamily: m.mono, color: m.ink50 }}>{v}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: m.ink10, overflow: 'hidden' }}>
                <div style={{ width: `${v}%`, height: '100%', background: m.accent }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Middle — candidates list */}
        <div style={{ padding: '20px 28px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>5 strong matches</h2>
            <div style={{ fontSize: 12, fontFamily: m.mono, color: m.ink50 }}>updated 2m ago · re-rank with new offer</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {candidates.map((c, i) => (
              <div key={i} style={{ background: c.sel ? m.panel : 'transparent', border: `1px solid ${c.sel ? m.accent : m.ink10}`, borderRadius: 10, padding: 14, display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 14, alignItems: 'center', boxShadow: c.sel ? `0 0 0 3px ${m.accentSoft}` : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: m.ink10, display: 'grid', placeItems: 'center', fontFamily: m.mono, fontSize: 13, color: m.ink70 }}>{c.name.split(' ').map(x=>x[0]).join('')}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 500 }}>{c.name}</span>
                    <span style={{ fontSize: 12, color: m.ink50 }}>· teaches {c.skill}</span>
                  </div>
                  <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono, marginBottom: 4 }}>{c.loc} · {c.sessions} sessions · {c.hrs}</div>
                  <div style={{ fontSize: 12.5, color: m.ink70 }}>↳ {c.why}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: m.mono, fontSize: 18, color: m.accent, fontWeight: 500 }}>{c.match}</div>
                  <div style={{ fontFamily: m.mono, fontSize: 10, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>match</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — selected candidate detail */}
        <div style={{ borderLeft: `1px solid ${m.ink10}`, padding: '24px 22px', background: m.panel }}>
          <div style={{ height: 140, borderRadius: 10, marginBottom: 16, background: `repeating-linear-gradient(45deg, ${m.ink10}, ${m.ink10} 6px, transparent 6px, transparent 12px), ${m.bg}`, display: 'grid', placeItems: 'center', fontFamily: m.mono, fontSize: 11, color: m.ink50 }}>portrait — Aiko Tanaka</div>
          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Best match · 94%</div>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>Aiko Tanaka</div>
          <div style={{ fontSize: 12.5, color: m.ink70, marginBottom: 16 }}>Translator turned teacher · 6 yrs experience</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 18, fontFamily: m.mono, fontSize: 11 }}>
            {[['84', 'sessions'], ['4.9', 'rating'], ['+9h', 'overlap']].map(([n, l]) => (
              <div key={l} style={{ padding: '10px 12px', border: `1px solid ${m.ink10}`, borderRadius: 8 }}>
                <div style={{ fontSize: 16, color: m.ink, fontWeight: 500 }}>{n}</div>
                <div style={{ color: m.ink50, marginTop: 2, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Why this works</div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 13, color: m.ink70, lineHeight: 1.5 }}>
            <li style={{ paddingLeft: 14, position: 'relative', marginBottom: 4 }}><span style={{ position: 'absolute', left: 0, color: m.accent }}>+</span>Wants Figma; you teach it.</li>
            <li style={{ paddingLeft: 14, position: 'relative', marginBottom: 4 }}><span style={{ position: 'absolute', left: 0, color: m.accent }}>+</span>9hr/wk schedule overlap.</li>
            <li style={{ paddingLeft: 14, position: 'relative', marginBottom: 4 }}><span style={{ position: 'absolute', left: 0, color: m.accent }}>+</span>Both prefer 1-on-1 video.</li>
            <li style={{ paddingLeft: 14, position: 'relative', marginBottom: 4 }}><span style={{ position: 'absolute', left: 0, color: m.ink50 }}>·</span>Slight time-zone gap (8h).</li>
          </ul>

          <div style={{ marginTop: 22, display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, background: m.ink, color: m.bg, border: 'none', padding: '11px', borderRadius: 8, fontSize: 13.5, fontWeight: 500, fontFamily: m.font, cursor: 'pointer' }}>Propose swap →</button>
            <button style={{ background: 'transparent', color: m.ink, border: `1px solid ${m.ink20}`, padding: '11px 14px', borderRadius: 8, fontSize: 13.5, fontFamily: m.font, cursor: 'pointer' }}>View profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4 — PROFILE (others') ──────────────────────────────────────
function MinProfile() {
  const m = makeMin();
  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font }}>
      <MinNav active="Browse" />
      <div style={{ padding: '32px 64px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Profile · @aiko</div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, marginBottom: 28 }}>
            <div style={{ width: 120, height: 120, borderRadius: 14, background: `repeating-linear-gradient(45deg, ${m.ink10}, ${m.ink10} 6px, transparent 6px, transparent 12px), ${m.bg}`, display: 'grid', placeItems: 'center', fontFamily: m.mono, fontSize: 10, color: m.ink50 }}>portrait</div>
            <div>
              <h1 style={{ fontSize: 42, fontWeight: 500, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.05 }}>Aiko Tanaka</h1>
              <div style={{ fontSize: 15, color: m.ink70, marginTop: 4 }}>Translator turned teacher · Kyoto, JP · remote-first</div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '9px 16px', borderRadius: 7, fontSize: 13, fontWeight: 500, fontFamily: m.font, cursor: 'pointer' }}>Propose swap →</button>
                <button style={{ background: 'transparent', color: m.ink, border: `1px solid ${m.ink20}`, padding: '9px 16px', borderRadius: 7, fontSize: 13, fontFamily: m.font, cursor: 'pointer' }}>Message</button>
                <button style={{ background: 'transparent', color: m.ink, border: `1px solid ${m.ink20}`, padding: '9px 12px', borderRadius: 7, fontSize: 13, fontFamily: m.font, cursor: 'pointer' }}>★ Save</button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>About</div>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: m.ink70, margin: 0, marginBottom: 28, maxWidth: 640 }}>
            I've taught conversational Japanese for six years, mostly to writers and curious adults. My approach is patient, conversational, and rooted in things you actually want to say. Grammar drips in.
          </p>

          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Skills offered (3)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { t: 'Conversational Japanese', l: 'beginner → intermediate', r: '1:1', s: true },
              { t: 'Travel Japanese', l: 'beginner', r: '1:1' },
              { t: 'Business email writing', l: 'intermediate', r: '1:1' },
            ].map(s => (
              <div key={s.t} style={{ background: m.panel, border: `1px solid ${s.s ? m.accent : m.ink10}`, borderRadius: 10, padding: 14, boxShadow: s.s ? `0 0 0 3px ${m.accentSoft}` : 'none' }}>
                <div style={{ fontSize: 14.5, fontWeight: 500, marginBottom: 4 }}>{s.t}</div>
                <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono }}>{s.l} · {s.r}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Recent reviews (84 sessions)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { who: 'Daniel R.', when: '2 weeks ago', body: 'She makes you forget you\'re studying. We just talked about kissaten and somehow I picked up keigo.', sk: 'Conversational Japanese · 8 sessions' },
              { who: 'Hugo M.', when: '1 month ago', body: 'Patient, rigorous when you want her to be. Highly recommend if you\'re past the textbook stage.', sk: 'Conversational Japanese · 12 sessions' },
            ].map(r => (
              <div key={r.who} style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{r.who}</span>
                  <span style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>{r.when}</span>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: m.ink70, lineHeight: 1.5 }}>{r.body}</p>
                <div style={{ marginTop: 6, fontSize: 11, color: m.ink50, fontFamily: m.mono }}>{r.sk}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>At a glance</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['84', 'Sessions'], ['4.9', 'Rating'], ['42', 'Hours banked'], ['96%', 'Show rate']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontFamily: m.mono, fontWeight: 500 }}>{n}</div>
                  <div style={{ fontSize: 11, color: m.ink50, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Wants to learn</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Pottery', 'Gardening', 'Sourdough', 'Figma', 'Watercolor'].map(t => (
                <span key={t} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 5, background: m.accentSoft, color: m.accent, fontFamily: m.mono }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Languages</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>Japanese (native) · English (fluent) · French (intermediate)</div>
            <div style={{ marginTop: 14, fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Time zone</div>
            <div style={{ fontSize: 13.5 }}>JST · UTC+9</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5 — SCHEDULE / CALENDAR ────────────────────────────────────
function MinSchedule() {
  const m = makeMin();
  const days = ['MON 14', 'TUE 15', 'WED 16', 'THU 17', 'FRI 18', 'SAT 19', 'SUN 20'];
  const slots = [
    // [dayIdx, startHr, endHr, kind, label, who]
    [0, 9, 10, 'teach', 'Figma · Daniel R.', 'D'],
    [1, 14, 15, 'learn', 'Japanese · Aiko T.', 'A'],
    [2, 11, 12.5, 'teach', 'Figma · Hugo M.', 'H'],
    [3, 9, 10, 'learn', 'Japanese · Aiko T.', 'A'],
    [3, 16, 17, 'teach', 'Figma intro · group', 'G'],
    [4, 13, 14, 'learn', 'Japanese · Aiko T.', 'A'],
    [5, 10, 11.5, 'open', 'Office hours', null],
  ];
  const hours = [8,9,10,11,12,13,14,15,16,17,18,19];
  const colorFor = (k) => k === 'teach' ? m.accent : k === 'learn' ? m.ink : m.ink20;
  const bgFor = (k) => k === 'teach' ? m.accent : k === 'learn' ? m.ink : 'transparent';

  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font }}>
      <MinNav active="Schedule" />
      <div style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${m.ink10}` }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>This week — Apr 14–20</h2>
          <div style={{ fontSize: 12.5, color: m.ink50, fontFamily: m.mono, marginTop: 4 }}>3 teaching · 3 learning · 1 open · 7.0 hrs total</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={{ background: 'transparent', color: m.ink70, border: `1px solid ${m.ink10}`, padding: '6px 10px', borderRadius: 6, fontFamily: m.mono, fontSize: 12, cursor: 'pointer' }}>‹</button>
          <button style={{ background: 'transparent', color: m.ink70, border: `1px solid ${m.ink10}`, padding: '6px 10px', borderRadius: 6, fontFamily: m.mono, fontSize: 12, cursor: 'pointer' }}>Today</button>
          <button style={{ background: 'transparent', color: m.ink70, border: `1px solid ${m.ink10}`, padding: '6px 10px', borderRadius: 6, fontFamily: m.mono, fontSize: 12, cursor: 'pointer' }}>›</button>
          <div style={{ width: 1, height: 18, background: m.ink10, margin: '0 4px' }}></div>
          <div style={{ display: 'flex', fontFamily: m.mono, fontSize: 12, border: `1px solid ${m.ink10}`, borderRadius: 6, overflow: 'hidden' }}>
            <span style={{ padding: '6px 10px', background: m.ink10, color: m.ink }}>Week</span>
            <span style={{ padding: '6px 10px', color: m.ink70 }}>Day</span>
            <span style={{ padding: '6px 10px', color: m.ink70 }}>Month</span>
          </div>
          <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '8px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, fontFamily: m.font, cursor: 'pointer', marginLeft: 4 }}>+ Add availability</button>
        </div>
      </div>

      <div style={{ padding: '16px 28px', display: 'grid', gridTemplateColumns: '60px 1fr', gap: 0, height: 600 }}>
        <div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8 }}>
          {days.map((d, i) => (
            <div key={d} style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', padding: '4px 0', background: i === 2 ? m.ink10 : 'transparent', borderRadius: 5 }}>{d}</div>
          ))}
        </div>
        <div style={{ gridColumn: '1 / 3', display: 'grid', gridTemplateColumns: '60px 1fr', position: 'relative' }}>
          <div>
            {hours.map(h => (
              <div key={h} style={{ height: 44, fontSize: 10, fontFamily: m.mono, color: m.ink50, paddingTop: 0, textAlign: 'right', paddingRight: 8 }}>{h}:00</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, position: 'relative' }}>
            {Array.from({length: 7}).map((_, di) => (
              <div key={di} style={{ position: 'relative', borderLeft: `1px solid ${m.ink10}` }}>
                {hours.map(h => (
                  <div key={h} style={{ height: 44, borderTop: `1px solid ${m.ink10}` }}></div>
                ))}
                {slots.filter(s => s[0] === di).map((s, i) => {
                  const top = (s[1] - 8) * 44;
                  const ht = (s[2] - s[1]) * 44 - 4;
                  const isOpen = s[3] === 'open';
                  return (
                    <div key={i} style={{
                      position: 'absolute', top: top + 2, left: 4, right: 4, height: ht,
                      background: isOpen ? 'transparent' : bgFor(s[3]),
                      border: isOpen ? `1px dashed ${m.ink20}` : 'none',
                      color: isOpen ? m.ink70 : '#fff',
                      borderRadius: 6, padding: '6px 8px', fontSize: 11.5, fontWeight: 500,
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      overflow: 'hidden',
                    }}>
                      <div style={{ lineHeight: 1.2 }}>{s[4]}</div>
                      <div style={{ fontFamily: m.mono, fontSize: 10, opacity: 0.85 }}>{s[1]}:00 – {Math.floor(s[2])}:{(s[2]%1)*60 || '00'}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 28px', display: 'flex', gap: 18, fontFamily: m.mono, fontSize: 11.5, color: m.ink70, marginTop: 6 }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: m.accent, marginRight: 6, verticalAlign: -1 }}></span>You teach</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: m.ink, marginRight: 6, verticalAlign: -1 }}></span>You learn</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, border: `1px dashed ${m.ink20}`, marginRight: 6, verticalAlign: -1 }}></span>Open availability</span>
        <span style={{ marginLeft: 'auto', color: m.ink50 }}>↳ Drag to create. Click to edit.</span>
      </div>
    </div>
  );
}

// 6 — DASHBOARD ──────────────────────────────────────────────
function MinDashboard() {
  const m = makeMin();
  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font }}>
      <MinNav active="Dashboard" />
      <div style={{ padding: '28px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Welcome back</div>
            <h1 style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', margin: 0 }}>Quinn — your week</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: m.mono, fontSize: 12, color: m.ink70 }}>
            <span>↗ 12 hrs taught this quarter</span>
            <span style={{ color: m.ink20 }}>·</span>
            <span>2 swaps in flight</span>
          </div>
        </div>

        {/* Top row — 4 stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { l: 'Hours banked', v: '8.5', d: '+2.0 this week', accent: true },
            { l: 'Active swaps', v: '2', d: '4 sessions remaining' },
            { l: 'Sessions taught', v: '24', d: 'across 11 students' },
            { l: 'Rating', v: '4.92', d: 'from 18 reviews' },
          ].map(s => (
            <div key={s.l} style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{s.l}</div>
              <div style={{ fontSize: 38, fontFamily: m.mono, letterSpacing: '-0.02em', fontWeight: 500, lineHeight: 1, color: s.accent ? m.accent : m.ink }}>{s.v}</div>
              <div style={{ fontSize: 12, color: m.ink50, marginTop: 8 }}>{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          {/* Active swaps */}
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active swaps</div>
              <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink70 }}>view all →</div>
            </div>
            {[
              { who: 'Aiko Tanaka', mine: 'Figma prototyping', theirs: 'Conversational Japanese', done: 2, total: 4, next: 'Wed 9:00 AM' },
              { who: 'Daniel Roux', mine: 'Figma prototyping', theirs: 'Intermediate French', done: 1, total: 3, next: 'Mon 9:00 AM' },
            ].map(s => (
              <div key={s.who} style={{ paddingTop: 14, paddingBottom: 14, borderTop: `1px solid ${m.ink10}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{s.who}</span>
                    <span style={{ fontSize: 12.5, color: m.ink50, marginLeft: 8 }}>{s.mine} ⇄ {s.theirs}</span>
                  </div>
                  <div style={{ fontFamily: m.mono, fontSize: 11.5, color: m.ink70 }}>next · {s.next}</div>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {Array.from({length: s.total}).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < s.done ? m.accent : m.ink10 }}></div>
                  ))}
                  <div style={{ marginLeft: 8, fontFamily: m.mono, fontSize: 11, color: m.ink50, alignSelf: 'center' }}>{s.done}/{s.total}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Hours bank chart */}
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Hours bank · last 12 weeks</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 32, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.02em' }}>8.5</span>
              <span style={{ fontSize: 12, color: m.accent, fontFamily: m.mono }}>+2.0 ↗</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90, marginBottom: 8 }}>
              {[1,2,1.5,3,2,4,3,5,4,6,7,8.5].map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v/9 * 100}%`, background: i === 11 ? m.accent : m.ink10, borderRadius: 2 }}></div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: m.mono, fontSize: 10, color: m.ink50 }}>
              <span>W1</span><span>W6</span><span>now</span>
            </div>
          </div>
        </div>

        {/* Bottom: feed */}
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Recent activity</div>
            {[
              ['Aiko T.', 'completed session 2 of 4 · Conversational Japanese', '2h'],
              ['Hugo M.', 'requested a swap · Spanish ⇄ Figma', '1d'],
              ['You', 'banked 1.0 hr from teaching Daniel R.', '2d'],
              ['Lina P.', 'accepted your match · Korean ⇄ design feedback', '4d'],
            ].map(([w, body, t], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 10, paddingBottom: 10, borderTop: i === 0 ? 'none' : `1px solid ${m.ink10}`, fontSize: 13, color: m.ink70, gap: 14 }}>
                <div><span style={{ color: m.ink, fontWeight: 500 }}>{w}</span> {body}</div>
                <span style={{ fontFamily: m.mono, fontSize: 11, color: m.ink50, flexShrink: 0 }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Suggested for you</div>
            {[
              { who: 'Mira K.', skill: 'Italian conversation', why: 'wants product design feedback', m: 89 },
              { who: 'Jules M.', skill: 'React performance', why: 'flexible, async-friendly', m: 84 },
              { who: 'Sana W.', skill: 'Sourdough', why: 'open trade', m: 76 },
            ].map(s => (
              <div key={s.who} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, paddingTop: 12, paddingBottom: 12, borderTop: `1px solid ${m.ink10}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s.who} <span style={{ fontWeight: 400, color: m.ink70 }}>· {s.skill}</span></div>
                  <div style={{ fontSize: 12, color: m.ink50, marginTop: 2 }}>↳ {s.why}</div>
                </div>
                <div style={{ fontFamily: m.mono, fontSize: 13, color: m.accent, alignSelf: 'center' }}>{s.m}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MinMatch, MinProfile, MinSchedule, MinDashboard });
