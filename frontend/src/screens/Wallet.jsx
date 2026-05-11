import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/theme.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import * as sessionsApi from '../api/sessions.js';
import { formatDateShort, formatTime } from '../utils/format.js';

// /wallet — token economy view. See section docs/frontend-guide.md for the
// background of how HOLD / TRANSFER / RELEASE map to the session lifecycle.

const TX_FILTERS = [
  { key: 'all',    labelKey: 'wallet.filter.all',    types: null },
  { key: 'earned', labelKey: 'wallet.filter.earned', types: ['CREDIT', 'TRANSFER', 'RELEASE'] },
  { key: 'spent',  labelKey: 'wallet.filter.spent',  types: ['HOLD', 'DEBIT'] },
];

export default function Wallet() {
  const { m } = useTheme();
  const { t } = useTranslation();
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
    return transactions.filter((tx) => f.types.includes(tx.type));
  }, [transactions, filter]);

  const lifetime = useMemo(() => {
    let earned = 0, spent = 0;
    for (const tx of transactions) {
      if (['CREDIT', 'TRANSFER', 'RELEASE'].includes(tx.type)) earned += tx.amount;
      else if (['HOLD', 'DEBIT'].includes(tx.type)) spent += tx.amount;
    }
    return { earned, spent };
  }, [transactions]);

  if (loading) return <Centered m={m} title={t('wallet.loading')} />;
  if (error) return <Centered m={m} title={t('wallet.loadError')} subtitle={error} />;

  return (
    <div style={{ padding: '24px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 22 }}>
        <BalanceCard m={m} t={t} balance={balance} />
        <LifetimeCard m={m} t={t} lifetime={lifetime} />
      </div>
      <TransactionsTable
        m={m}
        t={t}
        transactions={visible}
        filter={filter}
        onFilter={setFilter}
      />
    </div>
  );
}

function BalanceCard({ m, t, balance }) {
  return (
    <div
      style={{
        background: m.panel,
        border: `1px solid ${m.ink10}`,
        borderRadius: 12,
        padding: 22,
      }}
    >
      <Eyebrow m={m}>{t('wallet.balanceEyebrow')}</Eyebrow>
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
          {t('wallet.balanceUnit')}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 18, fontFamily: m.mono, fontSize: 12, color: m.ink70 }}>
        <span>
          <span style={{ color: m.ink }}>{balance.heldBalance}</span> {t('wallet.inEscrow')}
        </span>
        <span style={{ color: m.ink20 }}>·</span>
        <span>
          <span style={{ color: m.ink }}>{balance.total}</span> {t('wallet.totalLabel')}
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
          {t('wallet.spendCta')}
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
          {t('wallet.earnCta')}
        </Link>
      </div>
    </div>
  );
}

function LifetimeCard({ m, t, lifetime }) {
  return (
    <div style={{ background: m.panel, border: `1px solid ${m.ink10}`, borderRadius: 12, padding: 18 }}>
      <Eyebrow m={m}>{t('wallet.lifetimeEarned')}</Eyebrow>
      <div style={{ fontSize: 32, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.02em' }}>
        {lifetime.earned}
      </div>
      <div style={{ fontSize: 12, color: m.ink50, marginTop: 4 }}>
        {t('wallet.lifetimeEarnedBody')}
      </div>
      <div style={{ height: 1, background: m.ink10, margin: '16px 0' }} />
      <Eyebrow m={m}>{t('wallet.lifetimeSpent')}</Eyebrow>
      <div style={{ fontSize: 32, fontFamily: m.mono, fontWeight: 500, letterSpacing: '-0.02em' }}>
        {lifetime.spent}
      </div>
      <div style={{ fontSize: 12, color: m.ink50, marginTop: 4 }}>
        {t('wallet.lifetimeSpentBody')}
      </div>
    </div>
  );
}

function TransactionsTable({ m, t, transactions, filter, onFilter }) {
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
        <div style={{ fontSize: 13, fontWeight: 500 }}>{t('wallet.txTitle')}</div>
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
              {t(f.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {transactions.length === 0 ? (
        <div style={{ padding: 32, textAlign: 'center', color: m.ink50, fontSize: 13.5 }}>
          {t('wallet.txEmpty')}
        </div>
      ) : (
        transactions.map((tx, i) => (
          <TransactionRow
            key={tx.id}
            m={m}
            t={t}
            tx={tx}
            isLast={i === transactions.length - 1}
          />
        ))
      )}
    </div>
  );
}

function TransactionRow({ m, t, tx, isLast }) {
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
          {tx.description || t(`wallet.txLabel.${tx.type}`, tx.type)}
        </div>
        <div style={{ fontSize: 11.5, color: m.ink50, fontFamily: m.mono }}>
          {tx.type}
          {tx.referenceId && ` · ${t('wallet.ref')} ${tx.referenceId.slice(0, 8)}`}
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

const ICON_BY_TYPE = {
  CREDIT:   '↑',
  TRANSFER: '↑',
  RELEASE:  '↺',
  HOLD:     '↓',
  DEBIT:    '↓',
};

function txSign(type) {
  if (type === 'CREDIT' || type === 'TRANSFER' || type === 'RELEASE') return +1;
  if (type === 'HOLD' || type === 'DEBIT') return -1;
  return 0;
}

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
