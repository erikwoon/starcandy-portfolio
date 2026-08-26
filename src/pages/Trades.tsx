import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import { useTrades } from '../hooks/useTrades'
import { toTradeRow } from '../lib/format'
import type { TradeStatus } from '../types'

type StatusFilter = 'All' | TradeStatus

interface LayoutContext {
  openTradeDialog: () => void
}

export default function Trades() {
  const { data: trades = [], isLoading, error } = useTrades()
  const { openTradeDialog } = useOutletContext<LayoutContext>()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')

  const rows = useMemo(() => trades.map(toTradeRow), [trades])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(
      (t) =>
        (statusFilter === 'All' || t.status === statusFilter) &&
        (!q || t.ticker.toLowerCase().includes(q) || t.strategy.toLowerCase().includes(q))
    )
  }, [rows, search, statusFilter])

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div>
          <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 6 }}>All positions</h6>
          <h1>Trades</h1>
        </div>
        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={openTradeDialog}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log trade
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: 260 }}
          placeholder="Search ticker or strategy"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="seg">
          <label className="seg-opt">
            <input type="radio" name="statusfilter" checked={statusFilter === 'All'} onChange={() => setStatusFilter('All')} />
            All
          </label>
          <label className="seg-opt">
            <input type="radio" name="statusfilter" checked={statusFilter === 'Open'} onChange={() => setStatusFilter('Open')} />
            Open
          </label>
          <label className="seg-opt">
            <input type="radio" name="statusfilter" checked={statusFilter === 'Closed'} onChange={() => setStatusFilter('Closed')} />
            Closed
          </label>
        </div>
      </div>

      {error && <p style={{ color: 'var(--color-neutral-500)' }}>Failed to load trades.</p>}

      <div className="card elev-sm" style={{ padding: 'var(--space-4)' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Strategy</th>
              <th>Strike / Exp</th>
              <th>Qty</th>
              <th>Premium</th>
              <th>Status</th>
              <th>P&amp;L</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{t.ticker}</strong>
                    <span className="tag tag-outline">{t.type}</span>
                  </div>
                </td>
                <td>{t.strategy}</td>
                <td className="text-muted">{t.strikeExpiry}</td>
                <td>{t.qty}</td>
                <td>{t.premiumLabel}</td>
                <td>
                  <span className={`tag ${t.statusTagClass}`}>{t.status}</span>
                </td>
                <td style={{ color: t.pnlColorValue, fontWeight: 600 }}>{t.pnlLabel}</td>
                <td>
                  <Link
                    to={`/chart?ticker=${encodeURIComponent(t.ticker)}&strike=${encodeURIComponent(t.strike)}&expiry=${encodeURIComponent(t.expiry)}`}
                    className="btn btn-ghost btn-icon"
                    title="View chart"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 17l5-5 4 4 8-8" />
                      <path d="M15 8h5v5" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <p className="text-muted" style={{ padding: 'var(--space-4) 0 0', textAlign: 'center' }}>
            No trades match.
          </p>
        )}
      </div>
    </div>
  )
}
