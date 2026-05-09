import { createContext, useContext, useMemo, useState } from 'react';

// Port of the design's theme system (frontend/directions/minimal-v2.jsx).
//
// In the design, theme lived on `window.minTheme` and every component
// called `makeMin()` to read it. That works for a one-page demo but
// doesn't trigger React re-renders when the theme changes.
//
// Here we move the theme into a React Context, so:
//   1. Any component can read it via `useTheme()`
//   2. Calling `setMode('dark')` re-renders every consumer automatically
//
// Usage:
//   const { m, setMode } = useTheme();
//   <div style={{ background: m.bg, color: m.ink }}>...</div>

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem('skillswap-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [accent, setAccent] = useState('#7a3df7');

  function setMode(next) {
    localStorage.setItem('skillswap-theme', next);
    setModeState(next);
  }

  const m = useMemo(() => makeColors(mode, accent), [mode, accent]);

  return (
    <ThemeContext.Provider value={{ m, mode, accent, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook = a function that calls other hooks (useContext here).
// Components call `useTheme()` to subscribe to the theme value.
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

// Colour palette factory — same shape as design's makeMin().
function makeColors(mode, accent) {
  const dark = mode === 'dark';
  return {
    font: "'IBM Plex Sans', -apple-system, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, monospace",
    bg:    dark ? '#0d0d0c' : '#fafaf7',
    panel: dark ? '#161614' : '#ffffff',
    ink:   dark ? '#f5f4ef' : '#0e0e0c',
    ink70: dark ? 'rgba(245,244,239,0.7)'  : 'rgba(14,14,12,0.7)',
    ink50: dark ? 'rgba(245,244,239,0.5)'  : 'rgba(14,14,12,0.5)',
    ink20: dark ? 'rgba(245,244,239,0.16)' : 'rgba(14,14,12,0.12)',
    ink10: dark ? 'rgba(245,244,239,0.09)' : 'rgba(14,14,12,0.07)',
    accent,
    accentSoft: dark ? accent + '22' : accent + '15',
  };
}
