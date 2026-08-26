import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { JournalEntry, NewJournalEntry } from '../types'

export function useJournal() {
  return useQuery({
    queryKey: ['journal'],
    queryFn: async (): Promise<JournalEntry[]> => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*, trades(ticker, strategy)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data as any[]).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        trade_id: row.trade_id,
        note: row.note,
        created_at: row.created_at,
        ticker: row.trades?.ticker,
        strategy: row.trades?.strategy,
      }))
    },
  })
}

export function useAddJournalEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (entry: NewJournalEntry) => {
      const { error } = await supabase.from('journal_entries').insert(entry)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journal'] }),
  })
}
