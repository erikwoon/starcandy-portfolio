import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signInWithMagicLink = (email: string) =>
    supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

  const verifyEmailOtp = (email: string, code: string) =>
    supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

  const signOut = () => supabase.auth.signOut()

  const user: User | null = session?.user ?? null

  return { session, user, loading, signInWithMagicLink, verifyEmailOtp, signOut }
}
