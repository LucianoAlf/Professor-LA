import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { HealthScore } from '../types/database'
import { useProfessoresByUnidade } from './useProfessoresByUnidade'

export function useHealthScores(unidadeId?: string, trimestreId?: string) {
  const professores = useProfessoresByUnidade(unidadeId)

  return useQuery({
    queryKey: ['health-scores', unidadeId, trimestreId, professores.data?.length],
    enabled: Boolean(unidadeId && trimestreId && professores.data),
    queryFn: async () => {
      const professorUnidadeIds = (professores.data ?? []).map((item) => item.id)
      if (!professorUnidadeIds.length) return [] as HealthScore[]

      const { data, error } = await supabase
        .from('health_scores')
        .select('*')
        .eq('trimestre_id', trimestreId)
        .in('professor_unidade_id', professorUnidadeIds)

      if (error) throw error
      return (data ?? []) as HealthScore[]
    },
  })
}
