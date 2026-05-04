// Pure formatting helpers — no side effects, no React.
// Used by Sessions, Wallet, and other screens that display dates/numbers.

const DAY_MS = 24 * 60 * 60 * 1000;

// "Today, 9:00 AM" / "Yesterday, 17:18" / "Wed Apr 30, 11:00 AM" / "Apr 22, 8:14 AM"
export function formatWhen(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = d.toDateString() === new Date(now - DAY_MS).toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (sameDay) return `Today, ${time}`;
  if (yesterday) return `Yesterday, ${time}`;

  const sameYear = d.getFullYear() === now.getFullYear();
  const dateOpts = sameYear
    ? { weekday: 'short', month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = d.toLocaleDateString('en-US', dateOpts);
  return `${dateStr}, ${time}`;
}

// "Apr 30" / "Apr 30, 2025"
export function formatDateShort(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-US',
    sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' }
  );
}

// "14:32"
export function formatTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// "60 min" / "2 h" — sessions price in tokens = duration in hours
export function durationLabel(tokens) {
  if (tokens === 1) return '1 h';
  return `${tokens} h`;
}
