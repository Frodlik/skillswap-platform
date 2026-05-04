// Direction B — Editorial / Magazine
// Cream paper, deep ink. Instrument Serif headlines, Geist body.
// Oversized numerals, asymmetric grid, rules + small caps.

const edStyles = {
  serif: "'Instrument Serif', 'Cormorant Garamond', Georgia, serif",
  sans: "'Geist', -apple-system, sans-serif",
  bg: '#f4ede2',
  bg2: '#ebe3d3',
  ink: '#1a1610',
  ink70: 'rgba(26,22,16,0.7)',
  ink50: 'rgba(26,22,16,0.55)',
  ink20: 'rgba(26,22,16,0.18)',
  ink10: 'rgba(26,22,16,0.10)',
  accent: '#a83c14', // burnt sienna
};

function smallCap(s) {
  return <span style={{ fontFamily: edStyles.sans, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500 }}>{s}</span>;
}

function EdLanding() {
  return (
    <div style={{
      width: 1280, height: 880, background: edStyles.bg, color: edStyles.ink,
      fontFamily: edStyles.sans, position: 'relative', overflow: 'hidden',
    }}>
      {/* Masthead */}
      <div style={{
        padding: '16px 44px', borderBottom: `1.5px solid ${edStyles.ink}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Vol. 02 · Spring 2026 · No. 14</div>
        <div style={{ fontFamily: edStyles.serif, fontSize: 28, letterSpacing: '0.04em' }}>Skillswap</div>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Sign in / Begin</div>
      </div>
      <div style={{
        padding: '6px 44px', borderBottom: `0.5px solid ${edStyles.ink20}`,
        display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: edStyles.ink70,
      }}>
        <span>Browse the index</span>
        <span>Featured exchanges</span>
        <span>How it works</span>
        <span>Communities</span>
        <span>Stories</span>
      </div>

      {/* Hero — asymmetric */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0, height: 'calc(100% - 73px)' }}>
        <div style={{ padding: '40px 44px 0 44px', borderRight: `0.5px solid ${edStyles.ink20}`, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            {smallCap('A barter economy for human knowledge')}
            <div style={{ flex: 1, height: 0.5, background: edStyles.ink20 }}></div>
            {smallCap('№ 01')}
          </div>
          <h1 style={{
            fontFamily: edStyles.serif, fontSize: 130, lineHeight: 0.92,
            letterSpacing: '-0.025em', fontWeight: 400, margin: 0, marginBottom: 14,
          }}>
            Teach <span style={{ fontStyle: 'italic' }}>one</span><br/>
            thing.<br/>
            Learn <span style={{ color: edStyles.accent, fontStyle: 'italic' }}>another.</span>
          </h1>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, marginTop: 26,
            paddingTop: 18, borderTop: `0.5px solid ${edStyles.ink20}`,
          }}>
            <p style={{
              fontFamily: edStyles.serif, fontSize: 22, lineHeight: 1.32, margin: 0,
              fontWeight: 400, color: edStyles.ink,
            }}>
              <span style={{ float: 'left', fontSize: 78, lineHeight: 0.78, marginRight: 8, marginTop: 6, color: edStyles.accent }}>S</span>
              killswap is a peer marketplace where people trade hours of teaching, not money. You list what you know — guitar, German, GIS — and find someone with what you'd like to learn. <span style={{ fontStyle: 'italic' }}>The exchange is the price.</span>
            </p>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: edStyles.ink70 }}>
              <div style={{ marginBottom: 14 }}>{smallCap('Begin')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button style={{ background: edStyles.ink, color: edStyles.bg, border: 'none', padding: '14px 18px', borderRadius: 0, fontSize: 13, fontFamily: edStyles.sans, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'left', cursor: 'pointer', fontWeight: 500 }}>List a skill →</button>
                <button style={{ background: 'transparent', color: edStyles.ink, border: `1px solid ${edStyles.ink}`, padding: '14px 18px', borderRadius: 0, fontSize: 13, fontFamily: edStyles.sans, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'left', cursor: 'pointer', fontWeight: 500 }}>Browse the index →</button>
              </div>
              <div style={{ marginTop: 18, fontFamily: edStyles.serif, fontStyle: 'italic', fontSize: 16 }}>
                "I taught a banker to throw clay; he taught me about index funds. Both of us got better at our second jobs." — <span style={{ fontStyle: 'normal' }}>Ines V., potter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — featured */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 28px', borderBottom: `0.5px solid ${edStyles.ink20}`, background: edStyles.bg2, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              {smallCap('Featured this week')}
              {smallCap('p. 04')}
            </div>
            <div style={{
              height: 130, marginBottom: 14,
              background: `repeating-linear-gradient(45deg, ${edStyles.ink20}, ${edStyles.ink20} 5px, transparent 5px, transparent 11px)`,
              display: 'grid', placeItems: 'center', fontFamily: 'ui-monospace, monospace', fontSize: 11, color: edStyles.ink70,
            }}>portrait — Mira K.</div>
            <h3 style={{ fontFamily: edStyles.serif, fontSize: 30, lineHeight: 1.05, fontWeight: 400, margin: 0, marginBottom: 8, letterSpacing: '-0.01em' }}>
              The translator who learned to weld.
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: edStyles.ink70, margin: 0 }}>
              Mira K. trades Italian conversation for metal sculpture. A diary of one ongoing barter, in 14 hours.
            </p>
            <div style={{ marginTop: 14, fontSize: 11, fontStyle: 'italic', color: edStyles.accent }}>Read the full story →</div>
          </div>

          <div style={{ padding: '20px 28px' }}>
            {smallCap('Live exchanges · 12,408 this week')}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Italian', 'Watercolor'],
                ['React', 'Sourdough'],
                ['Jazz piano', 'Public speaking'],
                ['Figma', 'Spanish'],
              ].map(([a, b], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: edStyles.serif, fontSize: 17 }}>
                  <span style={{ fontFamily: edStyles.sans, fontSize: 10, color: edStyles.ink50, width: 22 }}>{String(i+1).padStart(2,'0')}</span>
                  <span>{a}</span>
                  <span style={{ flex: 1, borderBottom: `0.5px dotted ${edStyles.ink20}`, transform: 'translateY(-3px)' }}></span>
                  <span style={{ fontStyle: 'italic', color: edStyles.accent }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EdBrowse() {
  const items = [
    { n: '01', cat: 'Languages', t: 'Conversational Japanese', who: 'Aiko Tanaka', loc: 'Kyoto · remote', body: 'Slow, patient practice. Native speaker, has taught for 6 years. Wants to learn pottery, gardening, or sourdough.', rate: '1 : 1' },
    { n: '02', cat: 'Music', t: 'Jazz piano fundamentals', who: 'Theo Hartmann', loc: 'Berlin', body: 'Voicings, rootless chords, and the art of comping. Looking for German conversation or chess.', rate: '1 : 1' },
    { n: '03', cat: 'Code', t: 'React performance audits', who: 'Jules Mwangi', loc: 'Remote · Nairobi', body: 'I will tear apart your render tree. Eight years building consumer apps. Wants drawing, ceramics, or French.', rate: '1 : 1.5' },
    { n: '04', cat: 'Craft', t: 'Sourdough from levain', who: 'Sana Whitfield', loc: 'Lisbon', body: 'From feeding your starter to scoring the loaf. Wants Portuguese, photography, or guitar lessons.', rate: '2 : 1' },
  ];
  return (
    <div style={{ width: 1280, height: 880, background: edStyles.bg, color: edStyles.ink, fontFamily: edStyles.sans, position: 'relative', overflow: 'hidden' }}>
      <div style={{ padding: '16px 44px', borderBottom: `1.5px solid ${edStyles.ink}`, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>← Back to cover</div>
        <div style={{ fontFamily: edStyles.serif, fontSize: 22 }}>The Index</div>
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>184 entries · A–Z</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', height: 'calc(100% - 47px)' }}>
        <div style={{ borderRight: `0.5px solid ${edStyles.ink20}`, padding: '20px 18px', fontSize: 12 }}>
          <div style={{ marginBottom: 10 }}>{smallCap('Sections')}</div>
          {['All', 'Languages', 'Music', 'Code', 'Craft', 'Design', 'Wellness', 'Cooking', 'Business'].map((c, i) => (
            <div key={c} style={{ padding: '5px 0', borderBottom: `0.5px solid ${edStyles.ink10}`, fontFamily: i === 0 ? edStyles.serif : edStyles.sans, fontSize: i === 0 ? 17 : 12.5, color: i === 0 ? edStyles.accent : edStyles.ink70, fontStyle: i === 0 ? 'italic' : 'normal' }}>
              {c}
            </div>
          ))}
          <div style={{ marginTop: 22, marginBottom: 10 }}>{smallCap('Filters')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: edStyles.ink70 }}>
            <div>· 1-on-1 video</div><div>· In-person</div><div>· Async lessons</div><div>· Group class</div>
          </div>
        </div>

        <div style={{ padding: '24px 36px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <h2 style={{ fontFamily: edStyles.serif, fontSize: 48, fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>
              The complete <span style={{ fontStyle: 'italic', color: edStyles.accent }}>index</span> of skills.
            </h2>
            <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: edStyles.ink70 }}>Sort: A–Z · Newest · Best match</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {items.map((s, i) => (
              <div key={s.n} style={{
                padding: '20px 24px',
                borderBottom: `0.5px solid ${edStyles.ink20}`,
                borderRight: i % 2 === 0 ? `0.5px solid ${edStyles.ink20}` : 'none',
                display: 'grid', gridTemplateColumns: '46px 1fr', gap: 14,
              }}>
                <div style={{ fontFamily: edStyles.serif, fontSize: 38, lineHeight: 1, color: edStyles.accent }}>{s.n}</div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    {smallCap(s.cat)}
                    <span style={{ fontFamily: edStyles.serif, fontStyle: 'italic', fontSize: 13 }}>{s.rate}</span>
                  </div>
                  <h3 style={{ fontFamily: edStyles.serif, fontSize: 26, fontWeight: 400, margin: 0, marginBottom: 4, letterSpacing: '-0.01em', lineHeight: 1.05 }}>{s.t}</h3>
                  <div style={{ fontSize: 12.5, color: edStyles.ink70, marginBottom: 6 }}>{s.who} · <span style={{ fontStyle: 'italic' }}>{s.loc}</span></div>
                  <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, color: edStyles.ink70 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EdProfile() {
  return (
    <div style={{ width: 720, height: 880, background: edStyles.bg, color: edStyles.ink, fontFamily: edStyles.sans, position: 'relative', overflow: 'hidden' }}>
      <div style={{ padding: '14px 32px', borderBottom: `1.5px solid ${edStyles.ink}`, display: 'flex', justifyContent: 'space-between', fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        <span>← The Index</span><span>Profile №147</span><span>Share</span>
      </div>

      <div style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          {smallCap('Languages')} <span style={{ color: edStyles.ink50, fontSize: 11 }}>·</span> {smallCap('Kyoto · remote')}
        </div>
        <h1 style={{ fontFamily: edStyles.serif, fontSize: 56, fontWeight: 400, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
          Aiko <span style={{ fontStyle: 'italic' }}>Tanaka</span>
        </h1>
        <div style={{ fontFamily: edStyles.serif, fontStyle: 'italic', fontSize: 22, color: edStyles.accent, marginTop: 6, marginBottom: 22 }}>
          teaches conversational Japanese.
        </div>

        <div style={{
          height: 220, marginBottom: 22,
          background: `repeating-linear-gradient(135deg, ${edStyles.ink20}, ${edStyles.ink20} 5px, transparent 5px, transparent 11px)`,
          display: 'grid', placeItems: 'center', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: edStyles.ink70,
        }}>portrait photo</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 22 }}>
          <p style={{ fontFamily: edStyles.serif, fontSize: 17, lineHeight: 1.45, margin: 0 }}>
            I've taught Japanese for six years, mostly to writers and curious adults. My method is conversational — we talk, slowly, about things you actually want to talk about. Grammar drips in.
          </p>
          <div>
            {smallCap('Wants to learn')}
            <div style={{ marginTop: 8, fontFamily: edStyles.serif, fontSize: 22, lineHeight: 1.25 }}>
              <span style={{ fontStyle: 'italic' }}>Pottery,</span> gardening, or <span style={{ fontStyle: 'italic' }}>sourdough.</span>
            </div>
            <div style={{ marginTop: 16 }}>{smallCap('Hours banked')}</div>
            <div style={{ fontFamily: edStyles.serif, fontSize: 36, color: edStyles.accent }}>42<span style={{ fontSize: 16, color: edStyles.ink70, fontStyle: 'italic' }}> taught</span></div>
          </div>
        </div>

        <div style={{ borderTop: `0.5px solid ${edStyles.ink20}`, paddingTop: 16, marginBottom: 18 }}>
          {smallCap('From past students')}
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {[
              ['"She made me forget I was studying."', 'Daniel R., 8 sessions'],
              ['"Patient. Rigorous when you want her to be."', 'Hugo M., 12 sessions'],
            ].map(([q, c]) => (
              <div key={c}>
                <div style={{ fontFamily: edStyles.serif, fontStyle: 'italic', fontSize: 17, lineHeight: 1.35 }}>{q}</div>
                <div style={{ fontSize: 11, color: edStyles.ink70, marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{c}</div>
              </div>
            ))}
          </div>
        </div>

        <button style={{ width: '100%', background: edStyles.ink, color: edStyles.bg, border: 'none', padding: '16px', fontSize: 12, fontFamily: edStyles.sans, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}>
          Propose a swap with Aiko →
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { EdLanding, EdBrowse, EdProfile });
