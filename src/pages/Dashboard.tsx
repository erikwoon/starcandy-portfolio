import { useEffect, useMemo, useState } from 'react'
import { useTrades } from '../hooks/useTrades'
import { useJournal } from '../hooks/useJournal'
import { deriveStats, formatCurrency, toTradeRow } from '../lib/format'
import { useUpsertUserSettings, useUserSettings } from '../hooks/useUserSettings'

function parseMoneyInput(raw: string): number {
  return Number((raw || '').replace(/,/g, ''))
}

export default function Dashboard() {
  const { data: trades = [], isLoading: tradesLoading, error: tradesError } = useTrades()
  const { data: journalEntries = [], isLoading: journalLoading } = useJournal()
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useUserSettings()
  const upsertSettings = useUpsertUserSettings()
  const [startingBalanceInput, setStartingBalanceInput] = useState('0')

  const stats = deriveStats(trades)
  const rows = trades.map(toTradeRow)
  const recentTrades = rows.slice(0, 6)
  const recentJournal = journalEntries.slice(0, 3)
  const startingBalance = settings?.starting_balance ?? 0

  useEffect(() => {
    setStartingBalanceInput(String(Math.round(startingBalance * 100) / 100))
  }, [startingBalance])

  const parsedStartingBalance = useMemo(() => parseMoneyInput(startingBalanceInput), [startingBalanceInput])
  const accountValue = startingBalance + stats.totalPnl
  const hasUnsavedStartingBalance = Number.isFinite(parsedStartingBalance) && Math.abs(parsedStartingBalance - startingBalance) > 0.0001

  async function saveStartingBalance() {
    if (!Number.isFinite(parsedStartingBalance)) return
    await upsertSettings.mutateAsync({ starting_balance: parsedStartingBalance })
  }

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 6 }}>Welcome back</h6>
        <h1>Your trading journey</h1>
        <p className="text-muted" style={{ fontSize: 15 }}>
          A running log of every options trade, and how the book is doing.
        </p>
      </div>

      {tradesError && <p style={{ color: 'var(--color-neutral-500)' }}>Failed to load trades.</p>}
      {settingsError && <p style={{ color: 'var(--color-neutral-500)' }}>Failed to load your starting balance.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card elev-sm">
          <span className="card-kicker">Starting balance</span>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <input
              className="input"
              inputMode="decimal"
              value={startingBalanceInput}
              onChange={(e) => setStartingBalanceInput(e.target.value.replace(/[^0-9.-]/g, ''))}
              placeholder="0"
              aria-label="Starting balance"
            />
            <button
              className="btn btn-secondary"
              onClick={() => void saveStartingBalance()}
              disabled={!hasUnsavedStartingBalance || upsertSettings.isPending || settingsLoading}
            >
              Save
            </button>
          </div>
          <span className="card-meta">Set your starting account value</span>
        </div>
        <div className="card elev-sm">
          <span className="card-kicker">Total P&amp;L</span>
          <div className="card-title" style={{ fontSize: 26, color: stats.pnlColorValue }}>
            {tradesLoading ? '—' : stats.totalPnlLabel}
          </div>
          <span className="card-meta">All time, {stats.tradeCount} trades</span>
        </div>
        <div className="card elev-sm">
          <span className="card-kicker">Current balance</span>
          <div className="card-title" style={{ fontSize: 26, color: stats.pnlColorValue }}>
            {tradesLoading || settingsLoading ? '—' : formatCurrency(accountValue)}
          </div>
          <span className="card-meta">Starting balance + total P&amp;L</span>
        </div>
        <div className="card elev-sm">
          <span className="card-kicker">Win rate</span>
          <div className="card-title" style={{ fontSize: 26 }}>{tradesLoading ? '—' : stats.winRateLabel}</div>
          <span className="card-meta">{stats.closedCount} closed positions</span>
        </div>
        <div className="card elev-sm">
          <span className="card-kicker">Open positions</span>
          <div className="card-title" style={{ fontSize: 26 }}>{tradesLoading ? '—' : stats.openCount}</div>
          <span className="card-meta">{stats.openPremiumLabel} premium at risk</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', alignItems: 'start' }}>
        <div className="card elev-sm" style={{ padding: 'var(--space-4)' }}>
          <span className="card-kicker">P&amp;L by trade</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, paddingTop: 'var(--space-3)' }}>
            {stats.chartBars.map((bar, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', maxWidth: 34, borderRadius: '8px 8px 0 0', background: bar.color, height: bar.height }} />
                <span style={{ fontSize: 10, color: 'var(--color-text)', opacity: 0.55 }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card elev-sm" style={{ padding: 'var(--space-4)' }}>
          <span className="card-kicker">Strategy mix</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            {stats.strategyMix.map((s) => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{s.name}</span>
                  <span className="text-muted">{s.count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--color-neutral-800)' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: 'var(--color-accent-500)', width: s.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        <div className="card elev-sm" style={{ padding: 'var(--space-4)' }}>
          <span className="card-kicker" style={{ marginBottom: 'var(--space-2)' }}>Recent trades</span>
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
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((t) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card elev-sm" style={{ padding: 'var(--space-4)' }}>
          <span className="card-kicker">Journal notes</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            {journalLoading && <p className="text-muted">Loading…</p>}
            {recentJournal.map((j) => (
              <div key={j.id} style={{ paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-divider)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <strong>{j.ticker}</strong>
                  <span className="text-muted">{new Date(j.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <p style={{ fontSize: 13, margin: 0, opacity: 0.85 }}>{j.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
