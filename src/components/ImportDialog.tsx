import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { parseBrokerFillsCsvSources, type ImportCandidate, type ParsedBrokerFill } from '../lib/csvImport'
import { useImportTrades } from '../hooks/useTrades'
import { formatDateTime, formatMoney } from '../lib/format'
import { STRATEGIES, type TradeStatus } from '../types'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
}

export default function ImportDialog({ open, onClose }: ImportDialogProps) {
  const [candidates, setCandidates] = useState<ImportCandidate[]>([])
  const [fills, setFills] = useState<ParsedBrokerFill[]>([])
  const [skippedRows, setSkippedRows] = useState(0)
  const [fileNames, setFileNames] = useState<string[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importTrades = useImportTrades()

  if (!open) return null

  function reset() {
    setCandidates([])
    setFills([])
    setSkippedRows(0)
    setFileNames([])
    setParseError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files)
      .filter((f) => f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv')
      .sort((a, b) => a.name.localeCompare(b.name))
    if (list.length === 0) {
      setParseError('Choose one or more .csv files.')
      return
    }
    setParseError(null)
    setFileNames(list.map((f) => f.name))
    try {
      const texts = await Promise.all(list.map((f) => f.text()))
      const sources = texts.map((text, idx) => ({ sourceId: list[idx].name, text }))
      const { candidates, fills, skippedRows } = parseBrokerFillsCsvSources(sources)
      if (candidates.length === 0) {
        setParseError('No option fills found in the selected file(s).')
      }
      setCandidates(candidates)
      setFills(fills)
      setSkippedRows(skippedRows)
    } catch (err) {
      console.error('CSV parse failed', err)
      setParseError('Could not read one or more of those files as CSV.')
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files)
  }

  function toggleInclude(key: string) {
    setCandidates((cs) => cs.map((c) => (c.key === key ? { ...c, include: !c.include } : c)))
  }

  function updateField<K extends keyof ImportCandidate>(key: string, field: K, value: ImportCandidate[K]) {
    setCandidates((cs) => cs.map((c) => (c.key === key ? { ...c, [field]: value } : c)))
  }

  const included = candidates.filter((c) => c.include)

  async function handleImport() {
    if (included.length === 0) return
    const payload = included.map(({ key: _key, legCount: _legCount, include: _include, ...trade }) => trade)
    const includedKeys = new Set(included.map((c) => c.key))
    const payloadFills = fills.filter((f) => includedKeys.has(f.symbol))
    try {
      await importTrades.mutateAsync({ trades: payload, fills: payloadFills })
      handleClose()
    } catch (err) {
      console.error('Bulk import failed', err)
      setParseError('Import failed — check the console for details.')
    }
  }

  return createPortal(
    <div className="dialog-backdrop" onClick={handleClose}>
      <div className="dialog" style={{ width: 'min(880px, 100%)', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">Import trades from CSV</div>

        {candidates.length === 0 ? (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                minHeight: 140,
                borderRadius: 12,
                border: `1px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'center',
                padding: 'var(--space-4)',
              }}
            >
              <span>
                {fileNames.length > 0
                  ? `Selected: ${fileNames.join(', ')}`
                  : 'Drop one or more broker fills CSVs here, or click to choose files'}
              </span>
              <span className="text-muted" style={{ fontSize: 11 }}>
                Option fills are matched into trades automatically, across all selected files; equity rows and
                unfilled orders are skipped. Re-importing updates prior CSV-imported entries for the same contract.
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.length) void handleFiles(e.target.files)
                }}
              />
            </div>
            {parseError && (
              <p style={{ color: 'var(--color-neutral-500)', fontSize: 13 }}>{parseError}</p>
            )}
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
              {candidates.length} trade{candidates.length === 1 ? '' : 's'} reconstructed from {fileNames.length}{' '}
              file{fileNames.length === 1 ? '' : 's'}
              {skippedRows > 0 ? ` — ${skippedRows} row${skippedRows === 1 ? '' : 's'} skipped (non-option or unfilled)` : ''}.
              Existing CSV-imported trades for matching contracts will be updated to avoid duplicates.
            </p>
            {parseError && <p style={{ color: 'var(--color-neutral-500)', fontSize: 13 }}>{parseError}</p>}

            <div style={{ overflow: 'auto', flex: 1 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
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
                  {candidates.map((c) => (
                    <tr key={c.key} style={{ opacity: c.include ? 1 : 0.4 }}>
                      <td>
                        <input type="checkbox" checked={c.include} onChange={() => toggleInclude(c.key)} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong>{c.ticker}</strong>
                          <span className="tag tag-outline">{c.type}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className="input"
                          style={{ minWidth: 150 }}
                          value={c.strategy}
                          onChange={(e) => updateField(c.key, 'strategy', e.target.value)}
                        >
                          {STRATEGIES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="text-muted">
                        ${c.strike} · {c.expiry}
                      </td>
                      <td>{c.qty}</td>
                      <td>${c.premium.toFixed(2)}</td>
                      <td>
                        <select
                          className="input"
                          style={{ minWidth: 90 }}
                          value={c.status}
                          onChange={(e) => updateField(c.key, 'status', e.target.value as TradeStatus)}
                        >
                          <option>Open</option>
                          <option>Closed</option>
                        </select>
                      </td>
                      <td className="text-muted">{c.order_time ? formatDateTime(c.order_time) : '—'}</td>
                      <td className="text-muted">{c.fill_time ? formatDateTime(c.fill_time) : '—'}</td>
                      <td style={{ color: (c.pnl ?? 0) >= 0 ? 'var(--color-accent-300)' : 'var(--color-neutral-500)', fontWeight: 600 }}>
                        {c.pnl === null ? '—' : formatMoney(c.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={reset}>
                Choose a different file
              </button>
              <button className="btn btn-primary" onClick={handleImport} disabled={included.length === 0 || importTrades.isPending}>
                Import {included.length} trade{included.length === 1 ? '' : 's'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
