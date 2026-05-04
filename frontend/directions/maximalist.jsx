// Direction C — Maximalist Marketplace
// Bold, sticker-like cards. Cream + tomato + cobalt + lime accents.
// Space Grotesk for UI, Caveat for handwritten accents. Thick borders.

const maxStyles = {
  ui: "'Space Grotesk', -apple-system, sans-serif",
  hand: "'Caveat', cursive",
  bg: '#fef8e7',
  paper: '#fffaee',
  ink: '#16140e',
  border: '#16140e',
  tomato: '#e8462b',
  cobalt: '#2747e8',
  lime: '#c8e84a',
  pink: '#ffc7d4',
  shadow: '4px 4px 0 #16140e',
  shadowLg: '8px 8px 0 #16140e',
};

const Tag = ({ bg, children, rotate = 0 }) => (
  <span style={{
    display: 'inline-block', background: bg, border: `1.5px solid ${maxStyles.border}`,
    padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
    transform: `rotate(${rotate}deg)`, fontFamily: maxStyles.ui,
  }}>{children}</span>
);

function MaxLanding() {
  return (
    <div style={{
      width: 1280, height: 880, background: maxStyles.bg, color: maxStyles.ink,
      fontFamily: maxStyles.ui, position: 'relative', overflow: 'hidden',
    }}>
      {/* dotted grid bg */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${maxStyles.ink} 1px, transparent 1px)`, backgroundSize: '24px 24px', opacity: 0.06 }}></div>

      {/* Nav */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: maxStyles.tomato, border: `2px solid ${maxStyles.border}`, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 20, color: '#fff', boxShadow: maxStyles.shadow, transform: 'rotate(-3deg)' }}>↻</div>
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>skillswap!</span>
        </div>
        <div style={{ display: 'flex', gap: 6, fontSize: 14, fontWeight: 500 }}>
          {['Browse', 'How it works', 'Stories', 'Communities'].map((x, i) => (
            <span key={x} style={{ padding: '8px 14px', borderRadius: 999, background: i === 0 ? maxStyles.lime : 'transparent', border: i === 0 ? `1.5px solid ${maxStyles.border}` : 'none' }}>{x}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ background: 'transparent', border: 'none', fontSize: 14, fontWeight: 600 }}>Sign in</button>
          <button style={{ background: maxStyles.ink, color: maxStyles.bg, border: `2px solid ${maxStyles.border}`, padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, fontFamily: maxStyles.ui, cursor: 'pointer', boxShadow: maxStyles.shadow }}>Join free →</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '24px 40px 0', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 40 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Tag bg={maxStyles.pink} rotate={-2}>★ no money, ever</Tag>
            <Tag bg={maxStyles.lime} rotate={1}>12k swaps / week</Tag>
          </div>
          <h1 style={{ fontSize: 108, lineHeight: 0.92, letterSpacing: '-0.04em', fontWeight: 700, margin: 0, marginBottom: 18 }}>
            Got a skill?<br/>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ position: 'absolute', inset: '-4px -10px', background: maxStyles.tomato, transform: 'rotate(-1.5deg)', borderRadius: 8, zIndex: 0 }}></span>
              <span style={{ position: 'relative', color: maxStyles.bg }}>Trade it.</span>
            </span>
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.45, maxWidth: 520, margin: 0, marginBottom: 28, fontWeight: 500 }}>
            You teach guitar, she teaches Greek. He bakes bread, you fix his code. Skillswap is a peer-to-peer barter for everything you know — <span style={{ fontFamily: maxStyles.hand, fontSize: 26, color: maxStyles.tomato }}>and want to know.</span>
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{ background: maxStyles.cobalt, color: '#fff', border: `2px solid ${maxStyles.border}`, padding: '16px 24px', borderRadius: 12, fontSize: 17, fontWeight: 700, fontFamily: maxStyles.ui, boxShadow: maxStyles.shadowLg, cursor: 'pointer' }}>List your skill</button>
            <button style={{ background: maxStyles.paper, color: maxStyles.ink, border: `2px solid ${maxStyles.border}`, padding: '16px 24px', borderRadius: 12, fontSize: 17, fontWeight: 700, fontFamily: maxStyles.ui, boxShadow: maxStyles.shadow, cursor: 'pointer' }}>Browse skills</button>
            <span style={{ fontFamily: maxStyles.hand, fontSize: 22, color: maxStyles.ink, marginLeft: 6 }}>← it's free!</span>
          </div>

          {/* How it works strip */}
          <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              ['1.', 'List', 'what you can teach'],
              ['2.', 'Match', 'with someone who wants it'],
              ['3.', 'Swap', 'hour for hour'],
            ].map(([n, t, d], i) => (
              <div key={n} style={{
                background: [maxStyles.lime, maxStyles.pink, maxStyles.paper][i],
                border: `2px solid ${maxStyles.border}`, borderRadius: 12, padding: '14px 16px', boxShadow: maxStyles.shadow,
              }}>
                <div style={{ fontFamily: maxStyles.hand, fontSize: 32, color: maxStyles.tomato, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{t}</div>
                <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.75 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: floating cards */}
        <div style={{ position: 'relative', height: 600 }}>
          {/* big featured card */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 280,
            background: maxStyles.paper, border: `2px solid ${maxStyles.border}`, borderRadius: 16,
            padding: 16, boxShadow: maxStyles.shadowLg, transform: 'rotate(2.5deg)',
          }}>
            <div style={{ height: 130, background: maxStyles.cobalt, borderRadius: 10, border: `2px solid ${maxStyles.border}`, marginBottom: 12, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: maxStyles.hand, fontSize: 28 }}>guitar lesson</div>
            <Tag bg={maxStyles.lime}>MUSIC</Tag>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, lineHeight: 1.1 }}>Fingerstyle guitar — for total beginners</div>
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.7, marginTop: 4 }}>Theo H. · Berlin · ⭐ 4.9</div>
            <div style={{ marginTop: 10, padding: '6px 10px', background: maxStyles.bg, border: `1.5px solid ${maxStyles.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600 }}>1 hr ⇄ 1 hr</div>
          </div>

          {/* second card */}
          <div style={{
            position: 'absolute', top: 220, right: 200, width: 240,
            background: maxStyles.paper, border: `2px solid ${maxStyles.border}`, borderRadius: 16,
            padding: 14, boxShadow: maxStyles.shadow, transform: 'rotate(-3deg)',
          }}>
            <div style={{ height: 100, background: maxStyles.tomato, borderRadius: 10, border: `2px solid ${maxStyles.border}`, marginBottom: 10, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: maxStyles.hand, fontSize: 24 }}>sourdough</div>
            <Tag bg={maxStyles.pink}>COOKING</Tag>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, lineHeight: 1.15 }}>Sourdough from your starter</div>
            <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}>Sana W. · Lisbon</div>
          </div>

          {/* third card */}
          <div style={{
            position: 'absolute', top: 380, right: 30, width: 250,
            background: maxStyles.lime, border: `2px solid ${maxStyles.border}`, borderRadius: 16,
            padding: 14, boxShadow: maxStyles.shadow, transform: 'rotate(4deg)',
          }}>
            <Tag bg={maxStyles.paper}>LANGUAGES</Tag>
            <div style={{ fontSize: 19, fontWeight: 700, marginTop: 6, lineHeight: 1.15 }}>Conversational Japanese, slowly.</div>
            <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4 }}>Aiko T. · Kyoto</div>
            <div style={{ marginTop: 8, fontFamily: maxStyles.hand, fontSize: 22, color: maxStyles.tomato }}>★ best match!</div>
          </div>

          {/* swap arrow */}
          <div style={{
            position: 'absolute', top: 320, right: 160,
            fontFamily: maxStyles.hand, fontSize: 30, color: maxStyles.cobalt,
            transform: 'rotate(-12deg)',
          }}>⇄ swap!</div>
        </div>
      </div>

      {/* footer ticker */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, background: maxStyles.ink, color: maxStyles.bg,
        padding: '12px 0', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <span style={{ marginLeft: 20 }}>★ guitar ⇄ greek ★ react ⇄ ramen ★ figma ⇄ french ★ pottery ⇄ python ★ dance ⇄ design ★ welding ⇄ writing ★ piano ⇄ portuguese ★ cooking ⇄ coding ★</span>
      </div>
    </div>
  );
}

function MaxBrowse() {
  const items = [
    { c: 'LANGUAGES', cb: maxStyles.lime, t: 'Japanese (slow)', who: 'Aiko T.', loc: 'Kyoto', rate: '1:1', r: -1.5, hero: 'こんにちは' },
    { c: 'MUSIC', cb: maxStyles.pink, t: 'Fingerstyle guitar', who: 'Theo H.', loc: 'Berlin', rate: '1:1', r: 1.2, hero: '♪♫' },
    { c: 'CODE', cb: maxStyles.cobalt, t: 'React perf audits', who: 'Jules M.', loc: 'remote', rate: '1:1.5', r: -0.8, hero: '{ }', white: true },
    { c: 'COOKING', cb: maxStyles.tomato, t: 'Sourdough from levain', who: 'Sana W.', loc: 'Lisbon', rate: '2:1', r: 1.8, hero: '🍞', white: true },
    { c: 'DESIGN', cb: maxStyles.lime, t: 'Figma prototyping', who: 'Quinn L.', loc: 'remote', rate: '1:1', r: -1.2, hero: '◑' },
    { c: 'WELLNESS', cb: maxStyles.pink, t: 'Vinyasa yoga', who: 'Priya R.', loc: 'NYC', rate: '1:1', r: 0.6, hero: '∞' },
  ];
  return (
    <div style={{ width: 1280, height: 880, background: maxStyles.bg, color: maxStyles.ink, fontFamily: maxStyles.ui, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${maxStyles.ink} 1px, transparent 1px)`, backgroundSize: '24px 24px', opacity: 0.05 }}></div>

      <div style={{ position: 'relative', padding: '20px 36px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 44, fontWeight: 700, margin: 0, letterSpacing: '-0.025em' }}>
          What can we <span style={{ background: maxStyles.lime, padding: '0 8px', border: `2px solid ${maxStyles.border}`, borderRadius: 8, display: 'inline-block', transform: 'rotate(-1deg)' }}>learn</span> today?
        </h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: maxStyles.paper, border: `2px solid ${maxStyles.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: maxStyles.shadow, fontSize: 14, fontWeight: 500, width: 280 }}>
            ⌕ Search 184 skills…
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ position: 'relative', padding: '0 36px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {[
          ['All', maxStyles.ink, '#fff'],
          ['Languages', maxStyles.lime, maxStyles.ink],
          ['Music', maxStyles.pink, maxStyles.ink],
          ['Code', maxStyles.cobalt, '#fff'],
          ['Cooking', maxStyles.tomato, '#fff'],
          ['Craft', maxStyles.paper, maxStyles.ink],
          ['Design', maxStyles.paper, maxStyles.ink],
          ['Wellness', maxStyles.paper, maxStyles.ink],
        ].map(([n, bg, c]) => (
          <span key={n} style={{ background: bg, color: c, border: `2px solid ${maxStyles.border}`, padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>{n}</span>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: maxStyles.hand, fontSize: 22, color: maxStyles.tomato }}>← pick a vibe!</span>
      </div>

      <div style={{ position: 'relative', padding: '8px 36px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
        {items.map((s, i) => (
          <div key={i} style={{
            background: maxStyles.paper, border: `2px solid ${maxStyles.border}`, borderRadius: 16,
            padding: 14, boxShadow: maxStyles.shadow, transform: `rotate(${s.r}deg)`,
          }}>
            <div style={{
              height: 130, background: s.cb, border: `2px solid ${maxStyles.border}`, borderRadius: 10,
              display: 'grid', placeItems: 'center', fontSize: s.hero.length > 2 ? 28 : 56, fontFamily: s.hero.length > 2 ? maxStyles.ui : maxStyles.hand,
              fontWeight: 700, color: s.white ? '#fff' : maxStyles.ink, marginBottom: 12,
            }}>{s.hero}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Tag bg={maxStyles.bg}>{s.c}</Tag>
              <span style={{ fontSize: 12, fontWeight: 700, background: maxStyles.lime, padding: '3px 8px', borderRadius: 6, border: `1.5px solid ${maxStyles.border}` }}>{s.rate}</span>
            </div>
            <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.1, marginTop: 4 }}>{s.t}</div>
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.7, marginTop: 2 }}>{s.who} · {s.loc}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              <button style={{ flex: 1, background: maxStyles.ink, color: maxStyles.bg, border: `1.5px solid ${maxStyles.border}`, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: maxStyles.ui }}>Propose swap</button>
              <button style={{ background: maxStyles.bg, border: `1.5px solid ${maxStyles.border}`, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: maxStyles.ui }}>♡</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaxSession() {
  return (
    <div style={{ width: 720, height: 880, background: maxStyles.bg, color: maxStyles.ink, fontFamily: maxStyles.ui, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${maxStyles.ink} 1px, transparent 1px)`, backgroundSize: '24px 24px', opacity: 0.05 }}></div>

      <div style={{ position: 'relative', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>← Back</span>
        <Tag bg={maxStyles.lime}>● LIVE — session 02 of 04</Tag>
        <span style={{ fontSize: 14, fontWeight: 600 }}>27:14</span>
      </div>

      <div style={{ position: 'relative', padding: '8px 28px' }}>
        {/* Two video tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div style={{ background: maxStyles.cobalt, border: `2px solid ${maxStyles.border}`, borderRadius: 14, height: 220, padding: 12, position: 'relative', boxShadow: maxStyles.shadow, transform: 'rotate(-1deg)' }}>
            <div style={{ position: 'absolute', bottom: 10, left: 10, color: '#fff', fontWeight: 700, fontSize: 15 }}>Quinn (you)</div>
            <div style={{ position: 'absolute', top: 10, right: 10, background: maxStyles.lime, border: `1.5px solid ${maxStyles.border}`, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>TEACHING</div>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: maxStyles.hand, fontSize: 36, color: '#fff' }}>video on</div>
          </div>
          <div style={{ background: maxStyles.tomato, border: `2px solid ${maxStyles.border}`, borderRadius: 14, height: 220, padding: 12, position: 'relative', boxShadow: maxStyles.shadow, transform: 'rotate(1.2deg)' }}>
            <div style={{ position: 'absolute', bottom: 10, left: 10, color: '#fff', fontWeight: 700, fontSize: 15 }}>Aiko T.</div>
            <div style={{ position: 'absolute', top: 10, right: 10, background: maxStyles.paper, border: `1.5px solid ${maxStyles.border}`, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>LEARNING</div>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: maxStyles.hand, fontSize: 36, color: '#fff' }}>video on</div>
          </div>
        </div>

        {/* Today's lesson card */}
        <div style={{ background: maxStyles.paper, border: `2px solid ${maxStyles.border}`, borderRadius: 14, padding: 16, boxShadow: maxStyles.shadow, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.6, letterSpacing: '0.08em' }}>TODAY'S LESSON</span>
            <Tag bg={maxStyles.pink}>FIGMA · prototyping</Tag>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15, marginBottom: 8 }}>Variables, conditional flows, and how to fake real interactions.</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['variables', 'conditionals', 'overlays', 'auto-layout'].map(t => (
              <span key={t} style={{ fontSize: 11, fontWeight: 600, background: maxStyles.bg, border: `1.5px solid ${maxStyles.border}`, padding: '3px 8px', borderRadius: 999 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Hours bank */}
        <div style={{ background: maxStyles.lime, border: `2px solid ${maxStyles.border}`, borderRadius: 14, padding: 14, marginBottom: 14, boxShadow: maxStyles.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, letterSpacing: '0.08em' }}>SWAP PROGRESS</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>2 of 4 hours · 50%</div>
            </div>
            <div style={{ fontFamily: maxStyles.hand, fontSize: 28, color: maxStyles.tomato }}>halfway there!</div>
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
            {[1,2,3,4].map(n => (
              <div key={n} style={{ flex: 1, height: 16, borderRadius: 6, background: n <= 2 ? maxStyles.tomato : maxStyles.paper, border: `1.5px solid ${maxStyles.border}` }}></div>
            ))}
          </div>
        </div>

        {/* Chat preview */}
        <div style={{ background: maxStyles.paper, border: `2px solid ${maxStyles.border}`, borderRadius: 14, padding: 12, boxShadow: maxStyles.shadow }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.6, letterSpacing: '0.08em', marginBottom: 8 }}>CHAT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ alignSelf: 'flex-start', background: maxStyles.bg, border: `1.5px solid ${maxStyles.border}`, padding: '6px 10px', borderRadius: 12, fontSize: 13, maxWidth: '70%' }}><b>Aiko:</b> Can you slow down on the variable part? 🙏</div>
            <div style={{ alignSelf: 'flex-end', background: maxStyles.cobalt, color: '#fff', border: `1.5px solid ${maxStyles.border}`, padding: '6px 10px', borderRadius: 12, fontSize: 13, maxWidth: '70%' }}><b>You:</b> totally — let me share my screen again</div>
          </div>
        </div>
      </div>

      {/* control bar */}
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
        {['🎤', '📹', '🖥️'].map((e, i) => (
          <div key={i} style={{ width: 52, height: 52, background: maxStyles.paper, border: `2px solid ${maxStyles.border}`, borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 22, boxShadow: maxStyles.shadow }}>{e}</div>
        ))}
        <div style={{ background: maxStyles.tomato, color: '#fff', border: `2px solid ${maxStyles.border}`, borderRadius: 14, padding: '0 22px', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, boxShadow: maxStyles.shadow }}>End session →</div>
      </div>
    </div>
  );
}

Object.assign(window, { MaxLanding, MaxBrowse, MaxSession });
