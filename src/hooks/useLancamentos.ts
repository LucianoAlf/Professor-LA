import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { LancamentoMensal } from '../types/database'
import { useProfessoresByUnidade } from './useProfessoresByUnidade'

const MONTH_TO_NUMBER: Record<string, number> = {
  Mar: 3,
  Abr: 4,
  Mai: 5,
  Jun: 6,
  Jul: 7,
  Ago: 8,
  Set: 9,
  Out: 10,
  Nov: 11,
}

async function resolveAnoByAnoLetivoId(anoLetivoId: string) {
  const { data, error } = await supabase
    .from('anos_letivos')
    .select('ano')
    .eq('id', anoLetivoId)
    .single()

  if (error) throw error
  return data.ano as number
}

export function useLancamentos(unidadeId?: string, anoLetivoId?: string, mes?: string) {
  const professores = useProfessoresByUnidade(unidadeId)

  return useQuery({
    queryKey: ['lancamentos', unidadeId, anoLetivoId, mes, professores.data?.length],
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
