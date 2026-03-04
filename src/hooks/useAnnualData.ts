import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UnitId } from '../types'
import { supabase } from '../lib/supabase'
import { useUnidades } from './useUnidades'

const CONSOLIDADO_UNITS = ['CG', 'RC', 'BA']

export interface AnnualItem {
  rank: number
  uid: string
  name: string
  hsQ1: number
  hsQ2: number
  hsQ3: number
  hsAnn: number
  retAnn: number
  convAnn: number
  pdiAnn: number
}

export function useAnnualData(curUnit: UnitId, anoLetivoId?: string) {
  const unidades = useUnidades()

  const unidadeIds = useMemo(() => {
    const codigos = curUnit === 'CONS' ? CONSOLIDADO_UNITS : [curUnit]
    return (unidades.data ?? []).filter((item) => codigos.includes(item.codigo)).map((item) => ({ id: item.id, codigo: item.codigo }))
  }, [unidades.data, curUnit])

  return useQuery({
    queryKey: ['annual-data', curUnit, anoLetivoId, unidadeIds.length],
    enabled: Boolean(anoLetivoId && unidadeIds.length),
    queryFn: async () => {
      const unidadeIdList = unidadeIds.map((item) => item.id)

      const { data: professorUnidade, error: professorUnidadeError } = await supabase
        .from('professor_unidade')
        .select('id, unidade_id, professor_id, professores:professor_id(id, nome)')
        .in('unidade_id', unidadeIdList)

      if (professorUnidadeError) throw professorUnidadeError

      const puIds = (professorUnidade ?? []).map((item: any) => item.id)
      if (!puIds.length) return [] as AnnualItem[]

      const { data: hsAnual, error: hsAnualError } = await supabase
        .from('health_scores_anuais')
        .select('*')
        .eq('ano_letivo_id', anoLetivoId)
        .in('professor_unidade_id', puIds)

      if (hsAnualError) throw hsAnualError

      const { data: hsTri, error: hsTriError } = await supabase
        .from('health_scores')
        .select('professor_unidade_id, score_retencao, score_conversao, score_pdi')
        .in('professor_unidade_id', puIds)

      if (hsTriError) throw hsTriError

      const unitCodeById = new Map(unidadeIds.map((item) => [item.id, item.codigo]))
      const puMap = new Map((professorUnidade ?? []).map((item: any) => [item.id, item]))

      const scoreAgg = (hsTri ?? []).reduce((acc: Record<string, { ret: number; conv: number; pdi: number; count: number }>, item: any) => {
        const key = item.professor_unidade_id
        if (!acc[key]) {
          acc[key] = { ret: 0, conv: 0, pdi: 0, count: 0 }
        }
        acc[key].ret += item.score_retencao ?? 0
        acc[key].conv += item.score_conversao ?? 0
        acc[key].pdi += item.score_pdi ?? 0
        acc[key].count += 1
        return acc
      }, {})

      const result = (hsAnual ?? []).map((item: any) => {
        const pu = puMap.get(item.professor_unidade_id)
        const avg = scoreAgg[item.professor_unidade_id] ?? { ret: 0, conv: 0, pdi: 0, count: 1 }

        return {
          rank: 0,
          uid: unitCodeById.get(pu?.unidade_id) ?? 'CG',
          name: pu?.professores?.nome ?? 'Professor',
          hsQ1: item.hs_q1 ?? 0,
          hsQ2: item.hs_q2 ?? 0,
          hsQ3: item.hs_q3 ?? 0,
          hsAnn: item.health_score_anual ?? 0,
          retAnn: avg.count > 0 ? avg.ret / avg.count / 100 : 0,
          convAnn: avg.count > 0 ? avg.conv / avg.count / 100 : 0,
          pdiAnn: avg.count > 0 ? avg.pdi / avg.count : 0,
        }
      })

      return result.sort((a, b) => b.hsAnn - a.hsAnn).map((item, index) => ({ ...item, rank: index + 1 }))
    },
  })
}
