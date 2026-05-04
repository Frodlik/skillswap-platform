import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as sessionsApi from '../api/sessions.js';
import { formatDateShort, formatTime } from '../utils/format.js';

// /wallet — token economy view.
// Adapted from frontend/directions/minimal-account.jsx · MinWallet.
//
// Backend model:
//   - balance       — tokens you can spend right now
//   - heldBalance   — tokens locked while a session is SCHEDULED/ACTIVE
//                     (released back on CANCELLED, transferred on COMPLETED)
//   - total = balance + heldBalance
//
// Transaction types:
//   CREDIT   — initial signup bonus, or earned from teaching
//   DEBIT    — reserved for future use; not commonly used today
//   HOLD     — learner books session; tokens move balance → heldBalance
//   RELEASE  — session cancelled; held tokens go back to balance
//   TRANSFER — session COMPLETED; learner's held → teacher's balance
//
// Lifetime "earned" / "spent" stats are computed on the client by walking
// the visible transactions list. For a thesis MVP this is fine; in
// production you'd add aggregate endpoints in session-service.

const TX_FILTERS = [
  { key: 'all',     label: 'All',     types: null },
  { key: 'earned',  label: 'Earned',  types: ['CREDIT', 'TRANSFER', 'RELEASE'] },
  { key: 'spent',   label: 'Spent',   types: ['HOLD', 'DEBIT'] },
];

export default function Wallet() {
  const { m } = useTheme();
  const { user } = useAuth();
  const userId = user?.sub;

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [b, txPage] = await Promise.all([
          sessionsApi.getBalance(userId),
          sessionsApi.getTransactions(userId),
        ]);
        if (!cancelled) {
          setBalance(b);
          setTransactions(txPage.content || []);
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

  const visible = useMemo(() => {
    const f = TX_FILTERS.find((x) => x.key === filter);
    if (!f?.types) return transactions;
    return transactions.filter((t) => f.types.includes(t.type));
  }, [transactions, filter]);

  // Lifetime stats from visible transactions (best-effort; pagination caveat in §6.x).
  const lifetime = useMemo(() => {
    let earned = 0, spent = 0;
    for (const t of transactions) {
      if (['CREDIT', 'TRANSFER', 'RELEASE'].includes(t.type)) earned += t.amount;
      else if (['HOLD', 'DEBIT'].includes(t.type)) spent += t.amount;
    }
    return { earned, spent };
  }, [transactions]);

  if (loading) return <Centered m={m} title="Loading wallet…" />;
  if (error) return <Centered m={m} title="Couldn't load wallet" subtitle={error} />;

  return (
    <div style={{ padding: '24px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 22 }}>
        <BalanceCard m={m} balance={balance} />
        <LifetimeCard m={m} lifetime={lifetime} />
      </div>
      <TransactionsTable
        m={m}
        transactions={visible}
        filter={filter}
        onFilter={setFilter}
        currentUserId={userId}
      />
    </div>
  );
}

// ─── Balance card ───────────────────────────────────────────────

function BalanceCard({ m, balance }) {
  return (
    <div
      style={{
        background: m.panel,
        border: `1px solid ${m.ink10}`,
        borderRadius: 12,
        padding: 22,
      }}
    >
      <Eyebrow m={m}>Balance</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span
          style={{
            fontSize: 64,
            fontFamily: m.mono,
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: m.accent,
          }}
        >
          {balance.balance}
        </span>
        <span style={{ fontSize: 14, color: m.ink70, fontFamily: m.mono }}>
          credits · 1 credit = 1 hour
        </span>
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 18, fontFamily: m.mono, fontSize: 12, color: m.ink70 }}>
        <span>
          <span style={{ color: m.ink }}>{balance.heldBalance}</span> in escrow
        </span>
        <span style={{ color: m.ink20 }}>·</span>
        <span>
          <span style={{ color: m.ink }}>{balance.total}</span> total (avail + held)
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <Link
          to="/matches"
          style={{
            background: m.ink,
            color: m.bg,
            border: 'none',
            padding: '8px 14px',
            borderRadius: 7,
            fontSize: 13,
            fontFamily: m.font,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Spend on a swap →
        </Link>
        <Link
          to="/skills"
          style={{
            background: 'transparent',
            color: m.ink,
            border: `1px solid ${m.ink20}`,
            padding: '8px 14px',
            borderRadius: 7,
            fontSize: 13,
            fontFamily: m.font,
            textDecoration: 'none',
          }}
        >
          Earn by teaching
        </Link>
      </div>
    </div>
  );
}

// ─── Lifetime stats ─────────────────────────────────────────────

function LifetimeCard({ m, lifetime }) {
  return (
    <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 18 }}>
      <Eyebrow m={m}>Lifetime earned</Eyebrow>
      <div style={{ fontSize: 32, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.02em' }}>
        {lifetime.earned}
      </div>
      <div style={{ fontSize: 12, color: m.ink50, marginTop: 4 }}>
        from teaching, signup bonus, and refunds
      </div>
      <div style={{ height: 1, background: m.ink10, margin: '16px 0' }} />
      <Eyebrow m={m}>Lifetime spent</Eyebrow>
      <div style={{ fontSize: 32, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.02em' }}>
        {lifetime.spent}
      </div>
      <div style={{ fontSize: 12, color: m.ink50, marginTop: 4 }}>
        from holds on sessions you booked
      </div>
    </div>
  );
}

// ─── Transactions table ─────────────────────────────────────────

function TransactionsTable({ m, transactions, filter, onFilter }) {
  return (
    <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: `1px solid ${m.ink10}`,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 500 }}>Transactions</div>
        <div style={{ display: 'flex', gap: 6, fontSize: 12, fontFamily: m.mono }}>
          {TX_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilter(f.key)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                background: filter === f.key ? m.ink10 : 'transparent',
                color: filter === f.key ? m.ink : m.ink70,
                border: 'none',
                cursor: 'pointer',
                fontFamily: m.mono,
                fontSize: 12,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {transactions.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: m.ink50, fontSize: 13.5 }}>
          No transactions match this filter.
        </div>
      ) : (
        transactions.map((t, i) => (
          <TransactionRow
            key={t.id}
            m={m}
            tx={t}
            isLast={i === transactions.length - 1}
          />
        ))
      )}
    </div>
  );
}

function TransactionRow({ m, tx, isLast }) {
  const sign = txSign(tx.type);
  const prefix = sign > 0 ? '+' : sign < 0 ? '−' : '';
  const isEarn = sign > 0;
  const icon = ICON_BY_TYPE[tx.type] || '·';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 36px 1fr 120px',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : `1px solid ${m.ink10}`,
        gap: 14,
      }}
    >
      <div>
        <div style={{ fontSize: 13 }}>{formatDateShort(tx.createdAt)}</div>
        <div style={{ fontSize: 11, color: m.ink50, fontFamily: m.mono }}>
          {formatTime(tx.createdAt)}
        </div>
      </div>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          background: isEarn ? m.accentSoft : m.ink10,
          color: isEarn ? m.accent : m.ink70,
          display: 'grid',
          placeItems: 'center',
          fontFamily: m.mono,
          fontSize: 13,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13.5 }}>
          {tx.description || HUMAN_LABEL[tx.type] || tx.type}
        </div>
        <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>
          {tx.type}
          {tx.referenceId && ` · ref ${tx.referenceId.slice(0, 8)}`}
        </div>
      </div>
      <div
        style={{
          textAlign: 'right',
          fontFamily: m.mono,
          fontSize: 16,
          color: isEarn ? m.accent : m.ink,
        }}
      >
        {prefix}
        {tx.amount}
      </div>
    </div>
  );
}

// ─── Lookups ────────────────────────────────────────────────────

const ICON_BY_TYPE = {
  CREDIT:   '↑',
  TRANSFER: '↑',
  RELEASE:  '↺',
  HOLD:     '↓',
  DEBIT:    '↓',
};

const HUMAN_LABEL = {
  CREDIT:   'Credit',
  TRANSFER: 'Earned from session',
  RELEASE:  'Held tokens released',
  HOLD:     'Held for upcoming session',
  DEBIT:    'Debit',
};

function txSign(type) {
  if (type === 'CREDIT' || type === 'TRANSFER' || type === 'RELEASE') return +1;
  if (type === 'HOLD' || type === 'DEBIT') return -1;
  return 0;
}

// ─── Atoms ──────────────────────────────────────────────────────

function Eyebrow({ m, children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontFamily: m.mono,
        color: m.ink50,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Centered({ m, title, subtitle }) {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '160px 40px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 500, color: m.ink }}>{title}</div>
        {subtitle && (
          <div style={{ marginTop: 8, fontSize: 13, color: m.ink50, fontFamily: m.mono }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
