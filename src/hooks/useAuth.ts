import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

function normalizeAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Falha ao autenticar.'

  if (
    message.toLowerCase().includes('failed to fetch') ||
    message.toLowerCase().includes('network') ||
    message.toLowerCase().includes('name_not_resolved')
  ) {
    return new Error(
      'Não foi possível conectar ao Supabase. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local.'
    )
  }

  return error instanceof Error ? error : new Error(message)
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return
        setSession(data.session)
      })
      .catch((error) => {
        if (!isMounted) return
        console.error('Erro ao carregar sessão do Supabase:', error)
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      throw normalizeAuthError(error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      throw normalizeAuthError(error)
    }
  }

  return {
    session,
    isLoading,
    signIn,
    signOut,
  }
}
