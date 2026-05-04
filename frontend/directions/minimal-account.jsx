// Direction A — Account screens: Login, MyProfile (edit), MySkills, MySessions, Wallet, Review

// 7 — LOGIN / REGISTER ────────────────────────────────────────
function MinLogin() {
  const m = makeMin();
  const [tab, setTab] = React.useState('register');
  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left — form */}
      <div style={{ padding: '64px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 56 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: m.ink, display: 'grid', placeItems: 'center', color: m.bg, fontFamily: m.mono, fontSize: 13 }}>⇄</div>
          skillswap
        </div>

        <div style={{ display: 'flex', gap: 4, padding: 4, background: m.ink10, borderRadius: 9, width: 'fit-content', marginBottom: 28, fontSize: 13.5 }}>
          {[['register','Create account'],['login','Sign in']].map(([id, l]) => (
            <button key={id} onClick={()=>setTab(id)} style={{
              background: tab === id ? m.panel : 'transparent', color: m.ink, border: 'none',
              padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontFamily: m.font, fontWeight: 500,
              boxShadow: tab === id ? `0 1px 2px ${m.ink10}` : 'none',
            }}>{l}</button>
          ))}
        </div>

        <h1 style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em', margin: 0, marginBottom: 8, lineHeight: 1.05 }}>
          {tab === 'register' ? <>Start trading <span style={{ fontStyle: 'italic', color: m.accent }}>skills.</span></> : <>Welcome <span style={{ fontStyle: 'italic', color: m.accent }}>back.</span></>}
        </h1>
        <p style={{ fontSize: 14.5, color: m.ink70, margin: 0, marginBottom: 32 }}>
          {tab === 'register' ? 'Earn a credit each hour you teach. Spend it learning anything else.' : 'Pick up where you left off — 2 swaps in flight.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          <button style={{ background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, padding: '11px', borderRadius: 8, fontSize: 13, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>
            <span style={{ fontFamily: m.mono, marginRight: 6 }}>G</span> Continue with Google
          </button>
          <button style={{ background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, padding: '11px', borderRadius: 8, fontSize: 13, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>
            <span style={{ fontFamily: m.mono, marginRight: 6 }}></span> Continue with Apple
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontFamily: m.mono, fontSize: 11, color: m.ink50 }}>
          <div style={{ flex: 1, height: 1, background: m.ink10 }}></div>
          OR WITH EMAIL
          <div style={{ flex: 1, height: 1, background: m.ink10 }}></div>
        </div>

        {tab === 'register' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full name</label>
            <input defaultValue="Quinn Lee" style={{ width: '100%', padding: '11px 12px', marginTop: 6, background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, borderRadius: 8, fontSize: 14, fontFamily: m.font, outline: 'none' }} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
          <input defaultValue="quinn@example.com" style={{ width: '100%', padding: '11px 12px', marginTop: 6, background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, borderRadius: 8, fontSize: 14, fontFamily: m.font, outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            {tab === 'login' && <span style={{ fontSize: 11, fontFamily: m.mono, color: m.accent }}>Forgot?</span>}
          </div>
          <input type="password" defaultValue="••••••••••" style={{ width: '100%', padding: '11px 12px', marginTop: 6, background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, borderRadius: 8, fontSize: 14, fontFamily: m.font, outline: 'none' }} />
        </div>

        {tab === 'register' && (
          <label style={{ display: 'flex', gap: 10, fontSize: 12.5, color: m.ink70, marginBottom: 18, lineHeight: 1.5 }}>
            <span style={{ width: 16, height: 16, border: `1.5px solid ${m.ink20}`, borderRadius: 3, background: m.accent, flexShrink: 0, marginTop: 1, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 10, fontFamily: m.mono }}>✓</span>
            I agree to Skillswap's <span style={{ color: m.ink, textDecoration: 'underline' }}>Terms</span> and <span style={{ color: m.ink, textDecoration: 'underline' }}>Privacy Policy</span>.
          </label>
        )}

        <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '13px', borderRadius: 8, fontSize: 14, fontFamily: m.font, fontWeight: 500, cursor: 'pointer', marginBottom: 14 }}>
          {tab === 'register' ? 'Create account →' : 'Sign in →'}
        </button>

        <div style={{ fontSize: 12.5, color: m.ink50, fontFamily: m.mono }}>
          {tab === 'register' ? <>Already a member? <span onClick={()=>setTab('login')} style={{ color: m.accent, cursor: 'pointer' }}>Sign in</span></> : <>New here? <span onClick={()=>setTab('register')} style={{ color: m.accent, cursor: 'pointer' }}>Create an account</span></>}
        </div>
      </div>

      {/* Right — visual */}
      <div style={{ background: m.panel, borderLeft: `1px solid ${m.ink10}`, padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: m.mono, fontSize: 11, color: m.ink50, display: 'flex', justifyContent: 'space-between' }}>
          <span>// what you get</span>
          <span>v2.4</span>
        </div>
        <div>
          <div style={{ fontFamily: m.mono, fontSize: 12, color: m.accent, marginBottom: 10 }}>+1 credit / hr taught</div>
          <h2 style={{ fontSize: 48, fontWeight: 500, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.02 }}>
            One <span style={{ fontStyle: 'italic' }}>simple</span><br/>
            economy.<br/>
            <span style={{ color: m.accent }}>Hours.</span>
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: m.ink70, marginTop: 22, maxWidth: 380 }}>
            Every hour you teach earns you a credit. Spend it on anything else — Italian, jazz piano, sourdough. The exchange is the price.
          </p>

          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['12,408', 'active swaps this week'],
              ['184', 'skill categories'],
              ['96%', 'session completion'],
            ].map(([n, l]) => (
              <div key={l} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', alignItems: 'baseline', borderTop: `1px solid ${m.ink10}`, paddingTop: 10 }}>
                <div style={{ fontFamily: m.mono, fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>{n}</div>
                <div style={{ fontSize: 12.5, color: m.ink70, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: m.mono }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: m.mono, fontSize: 11, color: m.ink50 }}>↳ Trusted by communities at MIT, RISD, Recurse Center +14 more</div>
      </div>
    </div>
  );
}

// 8 — MY PROFILE (edit) ──────────────────────────────────────
function MinMyProfile() {
  const m = makeMin();
  const Field = ({ label, hint, children }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: m.ink50, fontFamily: m.mono }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
  const Input = ({ defaultValue, multiline }) => multiline ? (
    <textarea defaultValue={defaultValue} style={{ width: '100%', padding: '10px 12px', background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, borderRadius: 8, fontSize: 13.5, fontFamily: m.font, outline: 'none', minHeight: 78, resize: 'vertical' }} />
  ) : (
    <input defaultValue={defaultValue} style={{ width: '100%', padding: '10px 12px', background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, borderRadius: 8, fontSize: 13.5, fontFamily: m.font, outline: 'none' }} />
  );

  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font }}>
      <MinNav active="Dashboard" />
      <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 36 }}>
        {/* Settings sidebar */}
        <div>
          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Settings</div>
          {[['Profile', true],['Skills'],['Schedule'],['Notifications'],['Wallet'],['Account & security'],['Privacy'],['Danger zone']].map(([n, a]) => (
            <div key={n} style={{ padding: '7px 10px', borderRadius: 6, fontSize: 13.5, marginBottom: 1, background: a ? m.ink10 : 'transparent', fontWeight: a ? 500 : 400, color: a ? m.ink : m.ink70 }}>{n}</div>
          ))}
        </div>

        {/* Form */}
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>Edit profile</h2>
              <div style={{ fontSize: 13, color: m.ink50, marginTop: 2 }}>Public — visible to anyone browsing skills.</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: 'transparent', color: m.ink70, border: `1px solid ${m.ink20}`, padding: '8px 14px', borderRadius: 7, fontSize: 13, fontFamily: m.font, cursor: 'pointer' }}>Discard</button>
              <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '8px 14px', borderRadius: 7, fontSize: 13, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>Save changes</button>
            </div>
          </div>

          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Photo & identity</div>
            <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: 18, alignItems: 'flex-start' }}>
              <div style={{ width: 88, height: 88, borderRadius: 12, background: `repeating-linear-gradient(45deg, ${m.ink10}, ${m.ink10} 6px, transparent 6px, transparent 12px), ${m.bg}`, display: 'grid', placeItems: 'center', fontSize: 20, color: m.ink70, fontWeight: 500 }}>QL</div>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button style={{ background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, padding: '7px 12px', borderRadius: 6, fontSize: 12.5, fontFamily: m.font, cursor: 'pointer' }}>Upload</button>
                  <button style={{ background: 'transparent', color: m.ink70, border: 'none', padding: '7px 4px', fontSize: 12.5, fontFamily: m.font, cursor: 'pointer' }}>Remove</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Display name"><Input defaultValue="Quinn Lee" /></Field>
                  <Field label="Username" hint="skillswap.io/@quinn"><Input defaultValue="quinn" /></Field>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>About</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Headline" hint="120 chars"><Input defaultValue="Senior product designer · remote-first" /></Field>
              <Field label="Pronouns"><Input defaultValue="she/they" /></Field>
            </div>
            <Field label="Bio" hint="280 chars"><Input multiline defaultValue="Designer with 8 years across fintech and tools. Happy to teach Figma, design critique, and prototyping. Trying to learn Spanish at a glacial pace." /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Location"><Input defaultValue="Brooklyn, NY" /></Field>
              <Field label="Time zone"><Input defaultValue="America/New_York" /></Field>
              <Field label="Languages"><Input defaultValue="English, basic Spanish" /></Field>
            </div>
          </div>

          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Preferences</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Default session length"><Input defaultValue="60 min" /></Field>
              <Field label="Session formats"><Input defaultValue="1-on-1 video · async" /></Field>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 9 — MY SKILLS (offers + wants) ─────────────────────────────
function MinMySkills() {
  const m = makeMin();
  const offers = [
    { t: 'Figma prototyping', l: 'intermediate · advanced', tags: ['variables','auto-layout','components'], status: 'live', sessions: 24 },
    { t: 'Design critique', l: 'all levels', tags: ['portfolio','feedback'], status: 'live', sessions: 11 },
    { t: 'Brand systems 101', l: 'beginner', tags: ['type','color','tokens'], status: 'draft', sessions: 0 },
  ];
  const wants = [
    { t: 'Conversational Spanish', l: 'beginner', notes: 'slow, patient pace · happy with weekly cadence' },
    { t: 'Sourdough basics', l: 'beginner', notes: 'in-person preferred · NYC' },
    { t: 'Watercolor painting', l: 'absolute beginner', notes: 'async or live · open to weekends' },
  ];
  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font }}>
      <MinNav active="Dashboard" />
      <div style={{ padding: '24px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>My skills</h2>
            <div style={{ fontSize: 13, color: m.ink50, marginTop: 2 }}>What you teach, what you'd like to learn. Both feed the matcher.</div>
          </div>
          <div style={{ fontFamily: m.mono, fontSize: 12, color: m.ink70 }}>3 offers · 3 wants</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Offers */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>You teach · 3 offers</div>
              <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '7px 12px', borderRadius: 6, fontSize: 12.5, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>+ Add offer</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {offers.map(o => (
                <div key={o.t} style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{o.t}</div>
                    <span style={{ fontSize: 10.5, fontFamily: m.mono, padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: o.status === 'live' ? m.accentSoft : m.ink10, color: o.status === 'live' ? m.accent : m.ink70 }}>{o.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono, marginBottom: 10 }}>{o.l} · {o.sessions} sessions taught · 1hr / 1hr</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                    {o.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: m.ink10, color: m.ink70, fontFamily: m.mono }}>{t}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, padding: '6px 10px', borderRadius: 6, fontSize: 12, fontFamily: m.font, cursor: 'pointer' }}>Edit</button>
                    <button style={{ background: 'transparent', color: m.ink70, border: 'none', padding: '6px 4px', fontSize: 12, fontFamily: m.font, cursor: 'pointer' }}>{o.status === 'live' ? 'Pause' : 'Publish'}</button>
                    <button style={{ marginLeft: 'auto', background: 'transparent', color: m.ink50, border: 'none', padding: '6px 4px', fontSize: 12, fontFamily: m.font, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wants */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>You want · 3 wants</div>
              <button style={{ background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, padding: '7px 12px', borderRadius: 6, fontSize: 12.5, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>+ Add want</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {wants.map(w => (
                <div key={w.t} style={{ background: m.panel, border: `1px solid ${m.accent}`, borderLeft: `3px solid ${m.accent}`, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{w.t}</div>
                  <div style={{ fontSize: 12, color: m.ink50, fontFamily: m.mono, marginBottom: 8 }}>{w.l}</div>
                  <p style={{ margin: 0, fontSize: 13, color: m.ink70, lineHeight: 1.5 }}>{w.notes}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button style={{ background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, padding: '6px 10px', borderRadius: 6, fontSize: 12, fontFamily: m.font, cursor: 'pointer' }}>Edit</button>
                    <button style={{ background: 'transparent', color: m.accent, border: 'none', padding: '6px 4px', fontSize: 12, fontFamily: m.font, cursor: 'pointer' }}>View matches →</button>
                    <button style={{ marginLeft: 'auto', background: 'transparent', color: m.ink50, border: 'none', padding: '6px 4px', fontSize: 12, fontFamily: m.font, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10 — MY SESSIONS ───────────────────────────────────────────
function MinMySessions() {
  const m = makeMin();
  const sessions = [
    { when: 'Today, 9:00 AM', dur: '60 min', who: 'Aiko Tanaka', kind: 'learn', skill: 'Conversational Japanese', loc: 'video', status: 'live', cost: '−1.00 cr' },
    { when: 'Wed Apr 30, 11:00 AM', dur: '90 min', who: 'Hugo Marín', kind: 'teach', skill: 'Figma prototyping', loc: 'video', status: 'upcoming', cost: '+1.50 cr' },
    { when: 'Mon Apr 28, 9:00 AM', dur: '60 min', who: 'Daniel Roux', kind: 'teach', skill: 'Figma prototyping', loc: 'video', status: 'completed', cost: '+1.00 cr' },
    { when: 'Fri Apr 25, 1:00 PM', dur: '60 min', who: 'Aiko Tanaka', kind: 'learn', skill: 'Conversational Japanese', loc: 'video', status: 'completed', cost: '−1.00 cr', reviewed: false },
    { when: 'Wed Apr 23, 9:00 AM', dur: '60 min', who: 'Aiko Tanaka', kind: 'learn', skill: 'Conversational Japanese', loc: 'video', status: 'completed', cost: '−1.00 cr', reviewed: true },
    { when: 'Mon Apr 21, 4:00 PM', dur: '60 min', who: 'Group · 4 people', kind: 'teach', skill: 'Figma intro', loc: 'video', status: 'cancelled', cost: '0' },
  ];
  const statusStyle = (s) => {
    if (s === 'live') return { bg: m.accent, color: '#fff', label: '● LIVE' };
    if (s === 'upcoming') return { bg: m.ink, color: m.bg, label: 'UPCOMING' };
    if (s === 'completed') return { bg: m.ink10, color: m.ink, label: 'COMPLETED' };
    return { bg: 'transparent', color: m.ink50, label: 'CANCELLED' };
  };

  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font }}>
      <MinNav active="Schedule" />
      <div style={{ padding: '24px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 }}>My sessions</h2>
          <div style={{ display: 'flex', gap: 6, fontSize: 12, fontFamily: m.mono }}>
            {[['All', true],['Upcoming'],['Completed'],['Cancelled']].map(([n, a]) => (
              <span key={n} style={{ padding: '5px 10px', borderRadius: 6, background: a ? m.ink10 : 'transparent', color: a ? m.ink : m.ink70 }}>{n}</span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 13, color: m.ink50, marginBottom: 18 }}>6 total · 1 live · 1 upcoming · 3 completed</div>

        <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '110px 200px 1fr 100px 130px 240px',
            padding: '10px 18px', background: m.bg, fontSize: 11, fontFamily: m.mono,
            color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em',
            borderBottom: `1px solid ${m.ink10}`,
          }}>
            <span>Status</span><span>When</span><span>Skill / role</span><span>Format</span><span>Credits</span><span style={{ textAlign: 'right' }}>Action</span>
          </div>
          {sessions.map((s, i) => {
            const st = statusStyle(s.status);
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '110px 200px 1fr 100px 130px 240px',
                padding: '14px 18px', alignItems: 'center', fontSize: 13.5,
                borderBottom: i === sessions.length - 1 ? 'none' : `1px solid ${m.ink10}`,
              }}>
                <span style={{ fontFamily: m.mono, fontSize: 10, padding: '3px 8px', borderRadius: 4, background: st.bg, color: st.color, justifySelf: 'start', letterSpacing: '0.06em' }}>{st.label}</span>
                <div>
                  <div style={{ fontSize: 13.5 }}>{s.when}</div>
                  <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>{s.dur}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13.5 }}>{s.skill} <span style={{ color: m.ink50, fontFamily: m.mono, fontSize: 11.5 }}>· you {s.kind}</span></div>
                  <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>with {s.who}</div>
                </div>
                <span style={{ fontFamily: m.mono, fontSize: 11.5, color: m.ink70 }}>{s.loc}</span>
                <span style={{ fontFamily: m.mono, fontSize: 13, color: s.cost.startsWith('+') ? m.accent : s.cost.startsWith('−') ? m.ink : m.ink50 }}>{s.cost}</span>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                  {s.status === 'live' && <button style={{ background: m.accent, color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 6, fontSize: 12.5, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>Join now →</button>}
                  {s.status === 'upcoming' && <>
                    <button style={{ background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, padding: '6px 10px', borderRadius: 6, fontSize: 12, fontFamily: m.font, cursor: 'pointer' }}>Reschedule</button>
                    <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>Details</button>
                  </>}
                  {s.status === 'completed' && (s.reviewed ? (
                    <span style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>★ reviewed</span>
                  ) : (
                    <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>Mark complete →</button>
                  ))}
                  {s.status === 'cancelled' && <span style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 11 — WALLET / TRANSACTIONS ─────────────────────────────────
function MinWallet() {
  const m = makeMin();
  const tx = [
    { d: 'Today', t: '14:32', kind: 'earn', label: 'Hold released · session w/ Daniel R.', meta: 'Figma prototyping · 60 min', amt: '+1.00' },
    { d: 'Today', t: '09:01', kind: 'spend', label: 'Hold placed · upcoming session w/ Aiko T.', meta: 'Conv. Japanese · 60 min', amt: '−1.00', pending: true },
    { d: 'Yesterday', t: '17:18', kind: 'earn', label: 'Hold released · session w/ Hugo M.', meta: 'Design critique · 90 min', amt: '+1.50' },
    { d: 'Apr 25', t: '14:02', kind: 'spend', label: 'Hold released · session w/ Aiko T.', meta: 'Conv. Japanese · 60 min', amt: '−1.00' },
    { d: 'Apr 23', t: '10:00', kind: 'earn', label: 'Welcome bonus', meta: 'first-skill listed', amt: '+1.00' },
    { d: 'Apr 22', t: '08:14', kind: 'adjust', label: 'No-show refund · Mira K.', meta: 'auto-credit · cancelled <2h before', amt: '+0.50' },
  ];
  return (
    <div style={{ width: 1280, height: 880, background: m.bg, color: m.ink, fontFamily: m.font }}>
      <MinNav active="Dashboard" />
      <div style={{ padding: '24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 14, marginBottom: 22 }}>
          {/* Balance */}
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 22, position: 'relative' }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Balance</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 64, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, color: m.accent }}>8.50</span>
              <span style={{ fontSize: 14, color: m.ink70, fontFamily: m.mono }}>credits · 1 credit = 1 hour</span>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 18, fontFamily: m.mono, fontSize: 12, color: m.ink70 }}>
              <span><span style={{ color: m.accent }}>↗ +2.00</span> earned this week</span>
              <span style={{ color: m.ink20 }}>·</span>
              <span><span style={{ color: m.ink }}>↘ −1.00</span> spent this week</span>
              <span style={{ color: m.ink20 }}>·</span>
              <span>1.00 in escrow</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button style={{ background: m.ink, color: m.bg, border: 'none', padding: '8px 14px', borderRadius: 7, fontSize: 13, fontFamily: m.font, fontWeight: 500, cursor: 'pointer' }}>Spend on a swap →</button>
              <button style={{ background: 'transparent', color: m.ink, border: `1px solid ${m.ink20}`, padding: '8px 14px', borderRadius: 7, fontSize: 13, fontFamily: m.font, cursor: 'pointer' }}>Gift credits</button>
              <button style={{ background: 'transparent', color: m.ink70, border: 'none', padding: '8px 4px', fontSize: 13, fontFamily: m.font, cursor: 'pointer', marginLeft: 'auto' }}>Export CSV</button>
            </div>
          </div>

          {/* Lifetime stats */}
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Lifetime earned</div>
            <div style={{ fontSize: 32, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.02em' }}>24.00</div>
            <div style={{ fontSize: 12, color: m.ink50, marginTop: 4 }}>across 24 sessions taught</div>
            <div style={{ height: 1, background: m.ink10, margin: '16px 0' }}></div>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Lifetime spent</div>
            <div style={{ fontSize: 32, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.02em' }}>15.50</div>
            <div style={{ fontSize: 12, color: m.ink50, marginTop: 4 }}>across 16 sessions learned</div>
          </div>

          {/* Sparkline */}
          <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Balance · 12 weeks</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, marginBottom: 8 }}>
              {[1,2,1.5,3,2,4,3,5,4,6,7,8.5].map((v, i) => (
                <div key={i} style={{ flex: 1, height: `${v/9 * 100}%`, background: i === 11 ? m.accent : m.ink10, borderRadius: 2 }}></div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: m.mono, fontSize: 10, color: m.ink50 }}>
              <span>W1</span><span>W6</span><span>now</span>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: `1px solid ${m.ink10}` }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Transactions</div>
            <div style={{ display: 'flex', gap: 6, fontSize: 12, fontFamily: m.mono }}>
              {[['All', true],['Earned'],['Spent'],['Pending']].map(([n, a]) => (
                <span key={n} style={{ padding: '4px 10px', borderRadius: 6, background: a ? m.ink10 : 'transparent', color: a ? m.ink : m.ink70 }}>{n}</span>
              ))}
            </div>
          </div>
          {tx.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 36px 1fr 120px', alignItems: 'center', padding: '14px 20px', borderBottom: i === tx.length - 1 ? 'none' : `1px solid ${m.ink10}`, gap: 14 }}>
              <div>
                <div style={{ fontSize: 13 }}>{r.d}</div>
                <div style={{ fontSize: 11, color: m.ink50, fontFamily: m.mono }}>{r.t}</div>
              </div>
              <div style={{ width: 26, height: 26, borderRadius: 999, background: r.kind === 'earn' ? m.accentSoft : r.kind === 'adjust' ? m.ink10 : m.ink10, color: r.kind === 'earn' ? m.accent : m.ink70, display: 'grid', placeItems: 'center', fontFamily: m.mono, fontSize: 13 }}>
                {r.kind === 'earn' ? '↑' : r.kind === 'adjust' ? '↺' : '↓'}
              </div>
              <div>
                <div style={{ fontSize: 13.5 }}>{r.label} {r.pending && <span style={{ fontSize: 10, fontFamily: m.mono, padding: '2px 6px', borderRadius: 4, background: m.ink10, color: m.ink70, marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>pending</span>}</div>
                <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>{r.meta}</div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: m.mono, fontSize: 16, color: r.amt.startsWith('+') ? m.accent : m.ink, opacity: r.pending ? 0.55 : 1 }}>{r.amt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 12 — REVIEW FORM ───────────────────────────────────────────
function MinReview() {
  const m = makeMin();
  const Pill = ({ on, children }) => (
    <span style={{
      fontSize: 12.5, padding: '6px 12px', borderRadius: 999,
      background: on ? m.accentSoft : 'transparent',
      color: on ? m.accent : m.ink70,
      border: `1px solid ${on ? m.accent : m.ink20}`,
      fontFamily: m.mono,
    }}>{children}</span>
  );
  return (
    <div style={{ width: 720, height: 880, background: m.bg, color: m.ink, fontFamily: m.font, padding: 32, position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontFamily: m.mono, fontSize: 11, color: m.ink50, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Session completed · leave a review</div>
      <h2 style={{ fontSize: 32, letterSpacing: '-0.025em', fontWeight: 500, margin: 0, marginBottom: 6, lineHeight: 1.05 }}>
        How was learning with <span style={{ fontStyle: 'italic' }}>Aiko?</span>
      </h2>
      <p style={{ fontSize: 13.5, color: m.ink70, margin: 0, marginBottom: 22 }}>
        Reviews unlock the credit hold. Both sides post at the same time — you'll see hers when you submit.
      </p>

      {/* Session card */}
      <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 10, padding: 14, display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center', marginBottom: 22 }}>
        <div style={{ width: 40, height: 40, borderRadius: 999, background: m.ink10, display: 'grid', placeItems: 'center', fontFamily: m.mono, fontSize: 13 }}>AT</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Aiko Tanaka · Conversational Japanese</div>
          <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>Fri Apr 25, 1:00 PM · 60 min · video</div>
        </div>
        <div style={{ fontFamily: m.mono, fontSize: 12, color: m.ink70 }}>−1.00 cr · held</div>
      </div>

      {/* Stars */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Overall</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[1,2,3,4,5].map(n => (
            <span key={n} style={{ fontSize: 30, color: n <= 5 ? m.accent : m.ink20, lineHeight: 1 }}>★</span>
          ))}
          <span style={{ fontFamily: m.mono, fontSize: 13, color: m.ink70, marginLeft: 6 }}>5 / 5 — excellent</span>
        </div>
      </div>

      {/* Aspects */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>What stood out · pick any</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['patient', true],['well prepared', true],['clear explanations'],['good pace', true],['kind & encouraging'],['gave homework'],['on time']].map(([n, on]) => (
            <Pill key={n} on={on}>{n}</Pill>
          ))}
        </div>
      </div>

      {/* Public review */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Public review</div>
          <span style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50 }}>134 / 280</span>
        </div>
        <textarea defaultValue="Aiko makes you forget you're studying. We just talked about kissaten and somehow I picked up a load of keigo. She remembered everything from last time — totally going again." style={{ width: '100%', padding: '12px 14px', background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, borderRadius: 8, fontSize: 14, fontFamily: m.font, outline: 'none', minHeight: 90, resize: 'vertical', lineHeight: 1.5 }} />
      </div>

      {/* Private */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontFamily: m.mono, color: m.ink50, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Private note to Aiko · she'll see this</div>
        <input defaultValue="Want to focus on past tense next time?" style={{ width: '100%', padding: '11px 14px', background: m.panel, color: m.ink, border: `1px solid ${m.ink20}`, borderRadius: 8, fontSize: 14, fontFamily: m.font, outline: 'none' }} />
      </div>

      {/* Recommend */}
      <label style={{ display: 'flex', gap: 10, fontSize: 13, color: m.ink70, marginBottom: 22, lineHeight: 1.4 }}>
        <span style={{ width: 16, height: 16, border: `1.5px solid ${m.ink20}`, borderRadius: 3, background: m.accent, flexShrink: 0, marginTop: 1, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 10, fontFamily: m.mono }}>✓</span>
        I'd recommend Aiko to other learners. She'll appear on your profile as a recommended teacher.
      </label>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={{ flex: 1, padding: '13px', background: m.ink, color: m.bg, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: m.font, cursor: 'pointer' }}>Submit & release credit →</button>
        <button style={{ padding: '13px 16px', background: 'transparent', color: m.ink, border: `1px solid ${m.ink20}`, borderRadius: 8, fontSize: 14, fontFamily: m.font, cursor: 'pointer' }}>Save draft</button>
      </div>
      <div style={{ marginTop: 12, fontFamily: m.mono, fontSize: 11, color: m.ink50, textAlign: 'center' }}>
        Reviews are mutual — Aiko's review of you appears as soon as you submit.
      </div>
    </div>
  );
}

Object.assign(window, { MinLogin, MinMyProfile, MinMySkills, MinMySessions, MinWallet, MinReview });
