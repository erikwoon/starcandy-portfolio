import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useTrades } from '../hooks/useTrades'
import { formatDateTime, toTradeRow } from '../lib/format'
import ImportDialog from '../components/ImportDialog'
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
  const [importOpen, setImportOpen] = useState(false)

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
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }} onClick={() => setImportOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
            </svg>
            Import CSV
          </button>
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={openTradeDialog}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Log trade
          </button>
        </div>
      </div>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />

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
              <th>Order time</th>
              <th>Fill time</th>
              <th>P&amp;L</th>
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
                <td className="text-muted">{t.order_time ? formatDateTime(t.order_time) : '—'}</td>
                <td className="text-muted">{t.fill_time ? formatDateTime(t.fill_time) : '—'}</td>
                <td style={{ color: t.pnlColorValue, fontWeight: 600 }}>{t.pnlLabel}</td>
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
