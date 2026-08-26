import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAddJournalEntry } from '../hooks/useJournal'
import { useTrades } from '../hooks/useTrades'

interface JournalDialogProps {
  open: boolean
  onClose: () => void
}

export default function JournalDialog({ open, onClose }: JournalDialogProps) {
  const { data: trades = [] } = useTrades()
  const addEntry = useAddJournalEntry()
  const [tradeId, setTradeId] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setTradeId(trades[0]?.id ?? '')
      setNote('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  async function save() {
    if (!tradeId || !note.trim()) {
      onClose()
      return
    }
    try {
      await addEntry.mutateAsync({ trade_id: tradeId, note })
      onClose()
    } catch (err) {
      console.error('Failed to save journal note', err)
    }
  }

  return createPortal(
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" style={{ width: 'min(480px, 100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">Add a journal note</div>
        <div className="field">
          <label>Trade</label>
          <select className="input" value={tradeId} onChange={(e) => setTradeId(e.target.value)}>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>
                {t.ticker}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Note</label>
          <textarea
            className="input"
            placeholder="What are you thinking about this position..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save} disabled={addEntry.isPending}>
            Save note
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
