import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Trimestre } from '../types/database'

export function useTrimestres(anoLetivoId?: string) {
  return useQuery({
    queryKey: ['trimestres', anoLetivoId],
    enabled: Boolean(anoLetivoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trimestres')
        .select('*')
        .eq('ano_letivo_id', anoLetivoId)

      if (error) throw error

      const trimestres = (data ?? []) as Trimestre[]
      return trimestres.sort((a, b) => {
        if (typeof a.ordem === 'number' && typeof b.ordem === 'number') {
          return a.ordem - b.ordem
        }
        return a.codigo.localeCompare(b.codigo)
      })
    },
  })
}
