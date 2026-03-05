import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUARTERS, MONTH_TO_NUMBER } from '../constants'
import { UnitId } from '../types'
import { supabase } from '../lib/supabase'
import { resolveAnoByAnoLetivoId } from '../lib/resolveAno'
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
  sE: number
  hs: number
  apto: boolean
  aAl: number
  aMedia: number
  monthly: Array<{
    mes: number
    ret: number
    conv: number
    media: number
    nota360: number
  }>
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
    queryKey: ['dashboard-data', curUnit, curQ, anoLetivoId, trimestreId, unidadeIds.map((u) => u.id).sort().join(',')],
    enabled: Boolean(anoLetivoId && trimestreId && unidadeIds.length),
    queryFn: async () => {
      const unidadeIdList = unidadeIds.map((item) => item.id)
      const ano = await resolveAnoByAnoLetivoId(anoLetivoId as string)

      const { data: professorUnidade, error: professorUnidadeError } = await supabase
        .from('professor_unidade')
        .select('id, unidade_id, professor_id, professores:professor_id(id, nome)')
        .in('unidade_id', unidadeIdList)

      if (professorUnidadeError) throw professorUnidadeError

      const puIds = (professorUnidade ?? []).map((item: any) => item.id)
      if (!puIds.length) return [] as RankingItem[]

      const { data: healthScores, error: healthScoresError } = await supabase
        .from('health_scores')
        .select('professor_unidade_id, score_retencao, score_conversao, score_media_turma, score_pdi, score_extra, health_score, apto_prof360')
        .eq('trimestre_id', trimestreId)
        .in('professor_unidade_id', puIds)

      if (healthScoresError) throw healthScoresError

      const meses = QUARTERS[curQ].months.map((mes) => MONTH_TO_NUMBER[mes]).filter(Boolean)

      const { data: lancamentos, error: lancamentosError } = await supabase
        .from('lancamentos_mensais')
        .select('professor_unidade_id, mes, taxa_retencao, taxa_conversao, media_turma, qtd_alunos, nota_prof360')
        .eq('ano', ano)
        .in('mes', meses)
        .in('professor_unidade_id', puIds)

      if (lancamentosError) throw lancamentosError

      const puMap = new Map((professorUnidade ?? []).map((item: any) => [item.id, item]))

      const lancamentosAgg = (lancamentos ?? []).reduce((acc: Record<string, { alunos: number; mediaSum: number; mediaCount: number }>, item: any) => {
        const key = item.professor_unidade_id
        if (!acc[key]) {
          acc[key] = { alunos: 0, mediaSum: 0, mediaCount: 0 }
        }
        acc[key].alunos += item.qtd_alunos ?? 0
        if (typeof item.media_turma === 'number') {
          acc[key].mediaSum += item.media_turma
          acc[key].mediaCount += 1
        }
        return acc
      }, {})

      const monthlyByProfessor = (lancamentos ?? []).reduce((acc: Record<string, RankingItem['monthly']>, item: any) => {
        const key = item.professor_unidade_id
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push({
          mes: item.mes,
          ret: (item.taxa_retencao ?? 0) * 100,
          conv: (item.taxa_conversao ?? 0) * 100,
          media: item.media_turma ?? 0,
          nota360: item.nota_prof360 ?? 0,
        })
        return acc
      }, {})

      const unitCodeById = new Map(unidadeIds.map((item) => [item.id, item.codigo]))

      const result = (healthScores ?? []).map((score: any) => {
        const pu = puMap.get(score.professor_unidade_id)
        const agg = lancamentosAgg[score.professor_unidade_id] ?? { alunos: 0, mediaSum: 0, mediaCount: 0 }

        return {
          rank: 0,
          uid: unitCodeById.get(pu?.unidade_id) ?? 'CG',
          name: pu?.professores?.nome ?? 'Professor',
          sR: score.score_retencao ?? 0,
          sC: score.score_conversao ?? 0,
          sM: score.score_media_turma ?? 0,
          sP: score.score_pdi ?? 0,
          sE: score.score_extra ?? 0,
          hs: score.health_score ?? 0,
          apto: Boolean(score.apto_prof360),
          aAl: agg.alunos,
          aMedia: agg.mediaCount > 0 ? agg.mediaSum / agg.mediaCount : 0,
          monthly: (monthlyByProfessor[score.professor_unidade_id] ?? []).sort((a, b) => a.mes - b.mes),
        }
      })

      return result.sort((a, b) => b.hs - a.hs).map((item, index) => ({ ...item, rank: index + 1 }))
    },
  })
}
