import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import TradeDialog from './TradeDialog'
import JournalDialog from './JournalDialog'

export default function Layout() {
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false)
  const [journalDialogOpen, setJournalDialogOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      <Nav onLogTrade={() => setTradeDialogOpen(true)} />
      <Outlet context={{ openJournalDialog: () => setJournalDialogOpen(true), openTradeDialog: () => setTradeDialogOpen(true) }} />
      <TradeDialog open={tradeDialogOpen} onClose={() => setTradeDialogOpen(false)} />
      <JournalDialog open={journalDialogOpen} onClose={() => setJournalDialogOpen(false)} />
    </div>
  )
}
