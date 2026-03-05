import { useQuery } from '@tanstack/react-query'
import { MONTH_TO_NUMBER } from '../constants'
import { supabase } from '../lib/supabase'
import { resolveAnoByAnoLetivoId } from '../lib/resolveAno'
import { LancamentoMensal } from '../types/database'
import { useProfessoresByUnidade } from './useProfessoresByUnidade'

export function useLancamentos(unidadeId?: string, anoLetivoId?: string, mes?: string) {
  const professores = useProfessoresByUnidade(unidadeId)

  return useQuery({
    queryKey: ['lancamentos', unidadeId, anoLetivoId, mes, professores.data?.map((p) => p.id).sort().join(',')],
    enabled: Boolean(unidadeId && anoLetivoId && mes && professores.data),
    queryFn: async () => {
      const professorUnidadeIds = (professores.data ?? []).map((item) => item.id)
      if (!professorUnidadeIds.length) return [] as LancamentoMensal[]

      const ano = await resolveAnoByAnoLetivoId(anoLetivoId as string)
      const mesNumero = MONTH_TO_NUMBER[mes as string]

      if (!mesNumero) throw new Error('Mês inválido para lançamento.')

      const { data, error } = await supabase
        .from('lancamentos_mensais')
        .select('*')
        .eq('ano', ano)
        .eq('mes', mesNumero)
        .in('professor_unidade_id', professorUnidadeIds)

      if (error) throw error
      return (data ?? []) as LancamentoMensal[]
    },
  })
}
