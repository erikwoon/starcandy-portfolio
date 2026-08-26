export type OptionType = 'Call' | 'Put'
export type TradeStatus = 'Open' | 'Closed'

export const STRATEGIES = [
  'Covered Call',
  'Cash-Secured Put',
  'Credit Spread',
  'Debit Spread',
  'Iron Condor',
  'Long Call',
  'Long Put',
  'Straddle',
] as const

export type Strategy = (typeof STRATEGIES)[number]

export interface Trade {
  id: string
  user_id: string
  ticker: string
  type: OptionType
  strategy: string
  strike: string
  expiry: string // ISO date
  qty: number
  premium: number
  status: TradeStatus
  pnl: number | null
  notes: string | null
  screenshot_url: string | null
  order_time: string | null
  fill_time: string | null
  created_at: string
}

export type NewTrade = Omit<Trade, 'id' | 'user_id' | 'created_at'>

export interface JournalEntry {
  id: string
  user_id: string
  trade_id: string
  note: string
  created_at: string
  // Joined/denormalized for display convenience
  ticker?: string
  strategy?: string
}

export type NewJournalEntry = {
  trade_id: string
  note: string
}

export interface UserSettings {
  user_id: string
  starting_balance: number
  created_at: string
  updated_at: string
}

export type UserSettingsPatch = {
  starting_balance: number
}
