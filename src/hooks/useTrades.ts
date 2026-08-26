import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { NewTrade, Trade } from '../types'
import { reconcileFills, type ParsedBrokerFill } from '../lib/csvImport'

type ImportTrade = NewTrade & { created_at?: string }
type ImportPayload = { trades: ImportTrade[]; fills: ParsedBrokerFill[] }

interface LedgerFillRecord {
  symbol: string
  ticker: string
  type: 'Call' | 'Put'
  strike: string
  expiry: string
  side: 'Buy' | 'Sell'
  qty: number
  price: number
  fee: number
  order_time: string
  fill_time: string
}

function defaultStrategyByType(type: 'Call' | 'Put') {
  return type === 'Call' ? 'Long Call' : 'Long Put'
}

function importedContractKey(t: Pick<Trade, 'ticker' | 'type' | 'strike' | 'expiry'>): string {
  return `${t.ticker}|${t.type}|${t.strike}|${t.expiry}`
}

function importedContractKeyFromNew(t: Pick<NewTrade, 'ticker' | 'type' | 'strike' | 'expiry'>): string {
  return `${t.ticker}|${t.type}|${t.strike}|${t.expiry}`
}

export function useTrades() {
  return useQuery({
    queryKey: ['trades'],
    queryFn: async (): Promise<Trade[]> => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Trade[]
    },
  })
}

export function useAddTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (trade: NewTrade) => {
      const { error } = await supabase.from('trades').insert(trade)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trades'] }),
  })
}

export function useImportTrades() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ trades, fills }: ImportPayload) => {
      if (trades.length === 0 || fills.length === 0) return

      const ledgerRows = fills.map((f) => ({
        source_key: f.source_key,
        symbol: f.symbol,
        ticker: f.ticker,
        type: f.type,
        strike: f.strike,
        expiry: f.expiry,
        side: f.side,
        qty: f.qty,
        price: f.price,
        fee: f.fee,
        order_time: f.order_time,
        fill_time: f.fill_time,
      }))

      const { error: ledgerUpsertError } = await supabase
        .from('trade_fills')
        .upsert(ledgerRows, { onConflict: 'user_id,source_key', ignoreDuplicates: true })
      if (ledgerUpsertError) throw ledgerUpsertError

      const symbols = [...new Set(fills.map((f) => f.symbol))]
      const { data: ledgerData, error: ledgerFetchError } = await supabase
        .from('trade_fills')
        .select('symbol,ticker,type,strike,expiry,side,qty,price,fee,order_time,fill_time')
        .in('symbol', symbols)
      if (ledgerFetchError) throw ledgerFetchError

      const fillsBySymbol = new Map<string, LedgerFillRecord[]>()
      ;((ledgerData as LedgerFillRecord[] | null) ?? []).forEach((row) => {
        const list = fillsBySymbol.get(row.symbol) ?? []
        list.push(row)
        fillsBySymbol.set(row.symbol, list)
      })

      const existingImportedResult = await supabase
        .from('trades')
        .select('*')
        .in('ticker', [...new Set(fills.map((f) => f.ticker))])
        .in('expiry', [...new Set(fills.map((f) => f.expiry))])
        .ilike('notes', 'Imported from CSV%')
      if (existingImportedResult.error) throw existingImportedResult.error
      const existingImported = (existingImportedResult.data as Trade[] | null) ?? []
      const existingByKey = new Map(existingImported.map((t) => [importedContractKey(t), t]))

      const incomingByKey = new Map(trades.map((t) => [importedContractKeyFromNew(t), t]))
      const updates: Array<{ id: string; patch: ImportTrade }> = []
      const inserts: ImportTrade[] = []

      for (const symbol of symbols) {
        const symbolFills = fillsBySymbol.get(symbol) ?? []
        if (symbolFills.length === 0) continue

        const rec = reconcileFills(
          symbolFills.map((f) => ({
            side: f.side,
            symbol: f.symbol,
            qty: f.qty,
            price: f.price,
            orderTime: Date.parse(f.order_time),
            fillTime: Date.parse(f.fill_time),
            fee: f.fee,
          }))
        )

        const ref = symbolFills[0]
        const key = `${ref.ticker}|${ref.type}|${ref.strike}|${ref.expiry}`
        const incoming = incomingByKey.get(key)
        const existing = existingByKey.get(key)
        const trade: ImportTrade = {
          ticker: ref.ticker,
          type: ref.type,
          strategy: incoming?.strategy ?? existing?.strategy ?? defaultStrategyByType(ref.type),
          strike: ref.strike,
          expiry: ref.expiry,
          qty: rec.qty,
          premium: Math.round(rec.premium * 100) / 100,
          status: rec.status,
          pnl: rec.status === 'Closed' ? rec.pnl : rec.pnl || null,
          notes: incoming?.notes ?? `Imported from CSV — ${rec.legCount} fill${rec.legCount === 1 ? '' : 's'}`,
          screenshot_url: existing?.screenshot_url ?? null,
          order_time: new Date(rec.firstOrderTime).toISOString(),
          fill_time: new Date(rec.lastFillTime).toISOString(),
          created_at: new Date(rec.firstOrderTime).toISOString(),
        }

        if (existing) {
          updates.push({ id: existing.id, patch: trade })
        } else {
          inserts.push(trade)
        }
      }

      if (updates.length > 0) {
        await Promise.all(
          updates.map(async ({ id, patch }) => {
            const { error } = await supabase.from('trades').update(patch).eq('id', id)
            if (error) throw error
          })
        )
      }

      if (inserts.length > 0) {
        const { error } = await supabase.from('trades').insert(inserts)
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trades'] }),
  })
}

export function useUpdateTrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<NewTrade> }) => {
      const { error } = await supabase.from('trades').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trades'] }),
  })
}
