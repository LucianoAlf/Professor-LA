import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUARTERS } from '../constants'
import { UnitId } from '../types'
import { supabase } from '../lib/supabase'
import { useTrimestres } from './useTrimestres'
import { useUnidades } from './useUnidades'

export interface RankingItem {
  rank: number
  uid: string
  name: string
  sR: number
  sC: number
  sM: number
  sP: number
  hs: number
  apto: boolean
  aAl: number
  aMedia: number
}

const CONSOLIDADO_UNITS = ['CG', 'RC', 'BA']

export function useDashboardData(curUnit: UnitId, curQ: 'Q1' | 'Q2' | 'Q3', anoLetivoId?: string) {
  const unidades = useUnidades()
  const trimestres = useTrimestres(anoLetivoId)

  const trimestreId = useMemo(() => {
    return trimestres.data?.find((item) => item.codigo === curQ)?.id
  }, [trimestres.data, curQ])

  const unidadeIds = useMemo(() => {
    const codigos = curUnit === 'CONS' ? CONSOLIDADO_UNITS : [curUnit]
    return (unidades.data ?? []).filter((item) => codigos.includes(item.codigo)).map((item) => ({ id: item.id, codigo: item.codigo }))
  }, [unidades.data, curUnit])

  return useQuery({
    queryKey: ['dashboard-data', curUnit, curQ, anoLetivoId, trimestreId, unidadeIds.length],
    enabled: Boolean(anoLetivoId && trimestreId && unidadeIds.length),
    queryFn: async () => {
      const unidadeIdList = unidadeIds.map((item) => item.id)

      const { data: professorUnidade, error: professorUnidadeError } = await supabase
        .from('professor_unidade')
        .select('id, unidade_id, professor_id, professores:professor_id(id, nome)')
        .in('unidade_id', unidadeIdList)

      if (professorUnidadeError) throw professorUnidadeError

      const puIds = (professorUnidade ?? []).map((item: any) => item.id)
      if (!puIds.length) return [] as RankingItem[]

      const { data: healthScores, error: healthScoresError } = await supabase
        .from('health_scores')
        .select('*')
        .eq('trimestre_id', trimestreId)
        .in('professor_unidade_id', puIds)

      if (healthScoresError) throw healthScoresError

      const meses = QUARTERS[curQ].months

      const { data: lancamentos, error: lancamentosError } = await supabase
        .from('lancamentos_mensais')
        .select('professor_unidade_id, total_turmas, total_alunos_turmas')
        .eq('ano_letivo_id', anoLetivoId)
        .in('mes', meses)
        .in('professor_unidade_id', puIds)

      if (lancamentosError) throw lancamentosError

      const puMap = new Map((professorUnidade ?? []).map((item: any) => [item.id, item]))

      const lancamentosAgg = (lancamentos ?? []).reduce((acc: Record<string, { alunos: number; turmas: number }>, item: any) => {
        const key = item.professor_unidade_id
        if (!acc[key]) {
          acc[key] = { alunos: 0, turmas: 0 }
        }
        acc[key].alunos += item.total_alunos_turmas ?? 0
        acc[key].turmas += item.total_turmas ?? 0
        return acc
      }, {})

      const unitCodeById = new Map(unidadeIds.map((item) => [item.id, item.codigo]))

      const result = (healthScores ?? []).map((score: any) => {
        const pu = puMap.get(score.professor_unidade_id)
        const agg = lancamentosAgg[score.professor_unidade_id] ?? { alunos: 0, turmas: 0 }

        return {
          rank: 0,
          uid: unitCodeById.get(pu?.unidade_id) ?? 'CG',
          name: pu?.professores?.nome ?? 'Professor',
          sR: score.score_retencao ?? 0,
          sC: score.score_conversao ?? 0,
          sM: score.score_media_turma ?? 0,
          sP: score.score_pdi ?? 0,
          hs: score.health_score ?? 0,
          apto: Boolean(score.apto_prof360),
          aAl: agg.alunos,
          aMedia: agg.turmas > 0 ? agg.alunos / agg.turmas : 0,
        }
      })

      return result.sort((a, b) => b.hs - a.hs).map((item, index) => ({ ...item, rank: index + 1 }))
    },
  })
}
