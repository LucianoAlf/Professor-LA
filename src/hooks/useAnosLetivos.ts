import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { AnoLetivo } from '../types/database'

export function useAnoLetivoAtual() {
  return useQuery({
    queryKey: ['ano-letivo-atual'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anos_letivos')
        .select('*')
        .eq('ativo', true)
        .order('ano', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data as AnoLetivo | null
    },
  })
}
