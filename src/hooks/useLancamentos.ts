import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { LancamentoMensal } from '../types/database'
import { useProfessoresByUnidade } from './useProfessoresByUnidade'

export function useLancamentos(unidadeId?: string, anoLetivoId?: string, mes?: string) {
  const professores = useProfessoresByUnidade(unidadeId)

  return useQuery({
    queryKey: ['lancamentos', unidadeId, anoLetivoId, mes, professores.data?.length],
    enabled: Boolean(unidadeId && anoLetivoId && mes && professores.data),
    queryFn: async () => {
      const professorUnidadeIds = (professores.data ?? []).map((item) => item.id)
      if (!professorUnidadeIds.length) return [] as LancamentoMensal[]

      const { data, error } = await supabase
        .from('lancamentos_mensais')
        .select('*')
        .eq('ano_letivo_id', anoLetivoId)
        .eq('mes', mes)
        .in('professor_unidade_id', professorUnidadeIds)

      if (error) throw error
      return (data ?? []) as LancamentoMensal[]
    },
  })
}
