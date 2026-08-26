import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { NewTrade, Trade } from '../types'

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
