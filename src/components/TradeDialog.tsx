import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAddTrade } from '../hooks/useTrades'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabase'
import { STRATEGIES, type NewTrade, type OptionType, type TradeStatus } from '../types'

interface TradeDialogProps {
  open: boolean
  onClose: () => void
}

interface FormState {
  ticker: string
  type: OptionType
  strategy: string
  qty: string
  strike: string
  expiry: string
  premium: string
  status: TradeStatus
  notes: string
}

function blankForm(): FormState {
  return {
    ticker: '',
    type: 'Call',
    strategy: STRATEGIES[0],
    qty: '1',
    strike: '',
    expiry: '',
    premium: '',
    status: 'Open',
    notes: '',
  }
}

export default function TradeDialog({ open, onClose }: TradeDialogProps) {
  const [form, setForm] = useState<FormState>(blankForm())
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const addTrade = useAddTrade()

  useEffect(() => {
    if (open) {
      setForm(blankForm())
      setScreenshotUrl(null)
    }
  }, [open])

  if (!open) return null

  const setField = <K extends keyof FormState>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [key]: e.target.value }))
  }

  async function handleFile(file: File) {
    if (!user) return
    setUploading(true)
    try {
      const path = `${user.id}/${crypto.randomUUID()}/${file.name}`
      const { error } = await supabase.storage.from('trade-screenshots').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('trade-screenshots').getPublicUrl(path)
      setScreenshotUrl(data.publicUrl)
    } catch (err) {
      console.error('Screenshot upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  async function saveTrade() {
    if (!form.ticker.trim()) {
      onClose()
      return
    }
    const trade: NewTrade = {
      ticker: form.ticker.trim().toUpperCase(),
      type: form.type,
      strategy: form.strategy,
      strike: form.strike,
      expiry: form.expiry,
      qty: Number(form.qty) || 1,
      premium: Number(form.premium) || 0,
      status: form.status,
      pnl: form.status === 'Closed' ? 0 : null,
      notes: form.notes || null,
      screenshot_url: screenshotUrl,
      order_time: null,
      fill_time: null,
    }
    try {
      await addTrade.mutateAsync(trade)
      onClose()
    } catch (err) {
      console.error('Failed to save trade', err)
    }
  }

  return createPortal(
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" style={{ width: 'min(560px, 100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">Log a trade</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="field">
            <label>Ticker</label>
            <input className="input" placeholder="e.g. AAPL" value={form.ticker} onChange={setField('ticker')} />
          </div>
          <div className="field">
            <label>Type</label>
            <div className="seg" style={{ width: '100%' }}>
              <label className="seg-opt" style={{ flex: 1, justifyContent: 'center' }}>
                <input type="radio" name="opttype" checked={form.type === 'Call'} onChange={() => setForm((s) => ({ ...s, type: 'Call' }))} />
                Call
              </label>
              <label className="seg-opt" style={{ flex: 1, justifyContent: 'center' }}>
                <input type="radio" name="opttype" checked={form.type === 'Put'} onChange={() => setForm((s) => ({ ...s, type: 'Put' }))} />
                Put
              </label>
            </div>
          </div>
          <div className="field">
            <label>Strategy</label>
            <select className="input" value={form.strategy} onChange={setField('strategy')}>
              {STRATEGIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Contracts</label>
            <input className="input" type="number" placeholder="1" value={form.qty} onChange={setField('qty')} />
          </div>
          <div className="field">
            <label>Strike</label>
            <input className="input" placeholder="e.g. 190" value={form.strike} onChange={setField('strike')} />
          </div>
          <div className="field">
            <label>Expiry</label>
            <input className="input" type="date" value={form.expiry} onChange={setField('expiry')} />
          </div>
          <div className="field">
            <label>Premium (per contract)</label>
            <input className="input" placeholder="e.g. 1.85" value={form.premium} onChange={setField('premium')} />
          </div>
          <div className="field">
            <label>Status</label>
            <div className="seg" style={{ width: '100%' }}>
              <label className="seg-opt" style={{ flex: 1, justifyContent: 'center' }}>
                <input type="radio" name="status" checked={form.status === 'Open'} onChange={() => setForm((s) => ({ ...s, status: 'Open' }))} />
                Open
              </label>
              <label className="seg-opt" style={{ flex: 1, justifyContent: 'center' }}>
                <input type="radio" name="status" checked={form.status === 'Closed'} onChange={() => setForm((s) => ({ ...s, status: 'Closed' }))} />
                Closed
              </label>
            </div>
          </div>
        </div>
        <div className="field">
          <label>Notes / rationale</label>
          <textarea className="input" placeholder="Why this trade, what you're watching..." value={form.notes} onChange={setField('notes')} />
        </div>
        <div className="field">
          <label>Chart screenshot (optional)</label>
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
              height: 120,
              borderRadius: 12,
              border: `1px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-divider)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 13,
              color: 'var(--color-text)',
              opacity: 0.7,
              backgroundImage: screenshotUrl ? `url(${screenshotUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!screenshotUrl && (uploading ? 'Uploading…' : 'Drop a chart screenshot')}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleFile(file)
              }}
            />
          </div>
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={saveTrade} disabled={addTrade.isPending}>
            Save trade
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
