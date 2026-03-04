import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { HealthScoreAnual } from '../types/database'
import { useProfessoresByUnidade } from './useProfessoresByUnidade'

export function useHealthScoresAnuais(unidadeId?: string, anoLetivoId?: string) {
  const professores = useProfessoresByUnidade(unidadeId)

  return useQuery({
    queryKey: ['health-scores-anuais', unidadeId, anoLetivoId, professores.data?.length],
    enabled: Boolean(unidadeId && anoLetivoId && professores.data),
    queryFn: async () => {
      const professorUnidadeIds = (professores.data ?? []).map((item) => item.id)
      if (!professorUnidadeIds.length) return [] as HealthScoreAnual[]

      const { data, error } = await supabase
        .from('health_scores_anuais')
        .select('*')
        .eq('ano_letivo_id', anoLetivoId)
        .in('professor_unidade_id', professorUnidadeIds)

      if (error) throw error
      return (data ?? []) as HealthScoreAnual[]
    },
  })
}
