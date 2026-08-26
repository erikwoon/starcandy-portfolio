import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabase'
import type { UserSettings, UserSettingsPatch } from '../types'

const DEFAULT_STARTING_BALANCE = 0

export function useUserSettings() {
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: async (): Promise<UserSettings> => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .maybeSingle()
      if (error) throw error

      if (!data) {
        return {
          user_id: '',
          starting_balance: DEFAULT_STARTING_BALANCE,
          created_at: '',
          updated_at: '',
        }
      }

      return data as UserSettings
    },
  })
}

export function useUpsertUserSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: UserSettingsPatch) => {
      const { error } = await supabase.from('user_settings').upsert(
        {
          starting_balance: patch.starting_balance,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-settings'] }),
  })
}
