import { useOutletContext } from 'react-router-dom'
import { useJournal } from '../hooks/useJournal'
import { formatDate } from '../lib/format'

interface LayoutContext {
  openJournalDialog: () => void
}

export default function Journal() {
  const { data: entries = [], isLoading, error } = useJournal()
  const { openJournalDialog } = useOutletContext<LayoutContext>()

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div>
          <h6 style={{ color: 'var(--color-accent-700)', marginBottom: 6 }}>Rationale &amp; reflections</h6>
          <h1>Journal</h1>
        </div>
        <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={openJournalDialog}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add note
        </button>
      </div>

      {error && <p style={{ color: 'var(--color-neutral-500)' }}>Failed to load journal entries.</p>}
      {isLoading && <p className="text-muted">Loading…</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {entries.map((j) => (
          <div key={j.id} className="card elev-sm" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{j.ticker}</strong>
                <span className="tag tag-outline">{j.strategy}</span>
              </div>
              <span className="text-muted" style={{ fontSize: 12 }}>
                {formatDate(j.created_at)}
              </span>
            </div>
            <p style={{ fontSize: 14, margin: 0, opacity: 0.9 }}>{j.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
