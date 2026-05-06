import { useMemo, useState } from 'react';
import { useTheme } from '../theme/theme.jsx';

// Weekly grid widget for the schedule-session modal.
//
// Columns:  7 days starting at `today + weekOffset*7` (left → right)
// Rows:     hours 6..23 inclusive (18 cells per column) — wide enough to
//           cover most reasonable session windows; sessions that cross
//           midnight (e.g. start 22:00 + 4h) get visually clipped at the
//           bottom edge with an explicit "ends next day" note below the grid.
//
// Each cell represents one full hour. We classify it into one of four states:
//   busy       — overlaps a session the other user already has booked
//   pickedHere — the cell the user just clicked (echoes the datetime input)
//   available  — sits inside the user's stated availabilitySchedule
//   off        — outside availability (still clickable, just dim)
//
// "off" stays clickable on purpose: availabilitySchedule is a hint, not a
// hard constraint, and a user might agree to a session outside it.
// "busy" is also clickable but the parent shows a warning — the backend
// will reject the booking with 409 anyway via SessionConflictException.
//
// Props:
//   busySlots      — [{ scheduledAt: ISO string, durationTokens: int }]
//   schedule       — already-parsed object like {"MON":[{from:9,to:17}]}
//                    (caller does the JSON.parse so this component stays
//                    presentational)
//   selected       — Date that the parent currently shows in the datetime input
//   durationHours  — to know how wide the picked highlight should be
//   onPick(date)   — callback when the user clicks a cell

const HOURS = Array.from({ length: 18 }, (_, i) => 6 + i);  // 6..23
const DAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Slightly more saturated greens/grays than m.accentSoft so an "available"
// cell visually reads as filled rather than empty.
const COLOR_AVAILABLE = '#cdeacd';   // soft green
const COLOR_AVAILABLE_BORDER = '#a8d4a8';
const COLOR_OFF = '#f1f1f1';         // very light gray for off-hours
const COLOR_OFF_BORDER = '#e0e0e0';
const COLOR_BUSY = '#f4b4b4';        // saturated rose for booked
const COLOR_BUSY_BORDER = '#dc7878';

export default function AvailabilityCalendar({
  busySlots = [],
  schedule = null,
  selected = null,
  durationHours = 1,
  onPick,
}) {
  const { m } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);

  // Build the 7-day axis once per render. weekOffset=0 starts at today;
  // each step shifts by 7 days. We don't allow negative offsets — there's
  // nothing useful to schedule in the past.
  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  // Pre-compute busy ranges as [startMs, endMs] tuples so the per-cell test
  // is just a couple of comparisons rather than re-parsing dates each time.
  const busyRanges = useMemo(
    () =>
      busySlots.map((s) => {
        const start = new Date(s.scheduledAt).getTime();
        return [start, start + s.durationTokens * 3600_000];
      }),
    [busySlots]
  );

  const selectedMs = selected ? new Date(selected).getTime() : null;
  const selectedEndMs = selectedMs ? selectedMs + durationHours * 3600_000 : null;

  // Did the picked session cross midnight relative to its start day?
  // We surface this as a footer note since the calendar can't show
  // hours past 23:00 on the same column.
  const crossesMidnight = useMemo(() => {
    if (!selectedMs) return null;
    const startDay = new Date(selectedMs);
    const endDay = new Date(selectedEndMs);
    if (startDay.toDateString() === endDay.toDateString()) return null;
    return endDay;
  }, [selectedMs, selectedEndMs]);

  function isBusy(cellStart, cellEnd) {
    return busyRanges.some(([s, e]) => s < cellEnd && e > cellStart);
  }

  function isInsideSchedule(date) {
    if (!schedule) return true; // no schedule set → treat as always available
    const ranges = schedule[DAY_KEYS[date.getDay()]];
    if (!ranges?.length) return false;
    const h = date.getHours();
    return ranges.some((r) => h >= r.from && h < r.to);
  }

  function isPicked(cellStart, cellEnd) {
    if (selectedMs == null) return false;
    return selectedMs < cellEnd && selectedEndMs > cellStart;
  }

  function shiftWeek(delta) {
    const next = weekOffset + delta;
    if (next >= 0) setWeekOffset(next);
  }

  const monthLabel = days[0].toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  return (
    <div style={{ marginTop: 6 }}>
      {/* Top toolbar — week label + nav arrows + legend on the right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <NavBtn m={m} onClick={() => shiftWeek(-1)} disabled={weekOffset === 0} aria-label="previous week">←</NavBtn>
          <NavBtn m={m} onClick={() => shiftWeek(+1)}>→</NavBtn>
          <span style={{ fontSize: 12, fontFamily: m.mono, color: m.ink70, marginLeft: 6 }}>
            {weekOffset === 0 ? 'This week' : `+${weekOffset}w`} · {monthLabel}
          </span>
        </div>
        <Legend m={m} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `36px repeat(7, 1fr)`, gap: 2 }}>
        {/* Header row: empty corner + 7 day labels */}
        <div />
        {days.map((d, i) => (
          <div
            key={i}
            style={{
              fontSize: 10,
              fontFamily: m.mono,
              color: m.ink50,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textAlign: 'center',
              padding: '4px 0',
            }}
          >
            {DAY_LABELS[d.getDay()]} {d.getDate()}
          </div>
        ))}

        {/* Body: hour label per row + 7 cells */}
        {HOURS.map((h) => (
          <Row key={h} m={m}
            hour={h}
            days={days}
            isBusy={isBusy}
            isInsideSchedule={isInsideSchedule}
            isPicked={isPicked}
            onPick={onPick}
          />
        ))}
      </div>

      {crossesMidnight && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            fontFamily: m.mono,
            color: '#a06060',
            background: '#fbecec',
            border: '1px solid #f0d4d4',
            padding: '6px 10px',
            borderRadius: 6,
          }}
        >
          ↳ session crosses midnight — ends{' '}
          {crossesMidnight.toLocaleString(undefined, {
            weekday: 'short', hour: '2-digit', minute: '2-digit',
          })}{' '}
          (not visible above)
        </div>
      )}
    </div>
  );
}

function NavBtn({ m, onClick, disabled, children, ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'transparent' : m.panel,
        color: disabled ? m.ink20 : m.ink,
        border: `1px solid ${disabled ? m.ink10 : m.ink20}`,
        borderRadius: 6,
        padding: '4px 9px',
        fontSize: 13,
        fontFamily: m.mono,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

function Row({ m, hour, days, isBusy, isInsideSchedule, isPicked, onPick }) {
  return (
    <>
      <div
        style={{
          fontSize: 10,
          fontFamily: m.mono,
          color: m.ink50,
          textAlign: 'right',
          padding: '0 4px',
          alignSelf: 'center',
        }}
      >
        {String(hour).padStart(2, '0')}
      </div>
      {days.map((d, i) => {
        const cellStart = new Date(d);
        cellStart.setHours(hour, 0, 0, 0);
        const cellEnd = cellStart.getTime() + 3600_000;
        const startMs = cellStart.getTime();

        const busy   = isBusy(startMs, cellEnd);
        const picked = isPicked(startMs, cellEnd);
        const inSched = isInsideSchedule(cellStart);

        // Past hours: render but disable so users can't pick yesterday at 9am.
        const past = startMs < Date.now();

        return (
          <Cell
            key={i}
            m={m}
            picked={picked}
            busy={busy}
            available={inSched}
            disabled={past}
            onClick={() => !past && onPick(cellStart)}
          />
        );
      })}
    </>
  );
}

function Cell({ m, picked, busy, available, disabled, onClick }) {
  let bg, border;
  if (picked)            { bg = m.accent;          border = m.accent; }
  else if (busy)         { bg = COLOR_BUSY;        border = COLOR_BUSY_BORDER; }
  else if (available)    { bg = COLOR_AVAILABLE;   border = COLOR_AVAILABLE_BORDER; }
  else                   { bg = COLOR_OFF;         border = COLOR_OFF_BORDER; }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={
        picked    ? 'Selected slot' :
        busy      ? 'Already booked — backend will reject 409' :
        available ? 'Marked available by the other user' :
                    'Outside their availability — they may decline'
      }
      style={{
        height: 18,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 3,
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
      }}
    />
  );
}

function Legend({ m }) {
  return (
    <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: m.mono, color: m.ink70 }}>
      <Swatch bg={COLOR_AVAILABLE} border={COLOR_AVAILABLE_BORDER} label="available" />
      <Swatch bg={COLOR_BUSY} border={COLOR_BUSY_BORDER} label="busy" />
      <Swatch bg={COLOR_OFF} border={COLOR_OFF_BORDER} label="off-hours" />
      <Swatch bg={m.accent} border={m.accent} label="selected" />
    </div>
  );
}

function Swatch({ bg, border, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: bg, border: `1px solid ${border}` }} />
      {label}
    </span>
  );
}
