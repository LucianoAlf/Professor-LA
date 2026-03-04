import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUARTERS } from '../constants'
import { calcHealthScore } from '../lib/calcHealthScore'
import { supabase } from '../lib/supabase'
import { ConfigPesos, LancamentoMensal } from '../types/database'

interface SaveLancamentosInput {
  anoLetivoId: string
  trimestreId: string
  mes: string
  configPesos: ConfigPesos
  rows: Array<{
    professorUnidadeId: string
    alunosRenovacaoTotal: number
    alunosRenovacaoOk: number
    experimentaisTotal: number
    experimentaisMatricula: number
    totalTurmas: number
    totalAlunosTurmas: number
    notaProf360: number
  }>
}

interface SavePdiInput {
  trimestreId: string
  anoLetivoId: string
  configPesos: ConfigPesos
  rows: Array<{
    professorUnidadeId: string
    notaPdi: number
  }>
}

async function recalculateAndPersistHealthScores(
  anoLetivoId: string,
  trimestreId: string,
  configPesos: ConfigPesos,
  professorUnidadeIds: string[]
) {
  const { data: trimestre, error: trimestreError } = await supabase
    .from('trimestres')
    .select('codigo')
    .eq('id', trimestreId)
    .single()

  if (trimestreError) throw trimestreError

  const quarterCode = (trimestre?.codigo ?? 'Q1') as keyof typeof QUARTERS
  const months = QUARTERS[quarterCode]?.months ?? []

  const { data: lancamentos, error: lancamentosError } = await supabase
    .from('lancamentos_mensais')
    .select('*')
    .eq('ano_letivo_id', anoLetivoId)
    .in('professor_unidade_id', professorUnidadeIds)
    .in('mes', months)

  if (lancamentosError) throw lancamentosError

  const { data: pdiRows, error: pdiError } = await supabase
    .from('pdi_trimestral')
    .select('*')
    .eq('trimestre_id', trimestreId)
    .in('professor_unidade_id', professorUnidadeIds)

  if (pdiError) throw pdiError

  const groupedLancamentos = (lancamentos ?? []).reduce((acc: Record<string, LancamentoMensal[]>, item: any) => {
    const key = item.professor_unidade_id
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {})

  const pdiMap = new Map((pdiRows ?? []).map((item: any) => [item.professor_unidade_id, item.nota_pdi]))

  const scores = professorUnidadeIds.map((professorUnidadeId) => {
    const calc = calcHealthScore(groupedLancamentos[professorUnidadeId] ?? [], pdiMap.get(professorUnidadeId) ?? 0, configPesos)

    return {
      professor_unidade_id: professorUnidadeId,
      trimestre_id: trimestreId,
      score_retencao: calc.scoreRet,
      score_conversao: calc.scoreConv,
      score_media_turma: calc.scoreMedia,
      score_pdi: calc.scorePdi,
      health_score: calc.healthScore,
      apto_prof360: calc.aptoPro360,
    }
  })

  const ranked = scores
    .slice()
    .sort((a, b) => b.health_score - a.health_score)
    .map((item, index) => ({ ...item, ranking_unidade: index + 1 }))

  const { error: upsertError } = await supabase
    .from('health_scores')
    .upsert(ranked, { onConflict: 'professor_unidade_id,trimestre_id' })

  if (upsertError) throw upsertError
}

export function useSaveLancamentosMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ anoLetivoId, trimestreId, mes, rows, configPesos }: SaveLancamentosInput) => {
      const payload = rows.map((row) => ({
        professor_unidade_id: row.professorUnidadeId,
        ano_letivo_id: anoLetivoId,
        mes,
        alunos_renovacao_total: row.alunosRenovacaoTotal,
        alunos_renovacao_ok: row.alunosRenovacaoOk,
        experimentais_total: row.experimentaisTotal,
        experimentais_matricula: row.experimentaisMatricula,
        total_turmas: row.totalTurmas,
        total_alunos_turmas: row.totalAlunosTurmas,
        nota_prof360: row.notaProf360,
      }))

      const { error } = await supabase
        .from('lancamentos_mensais')
        .upsert(payload, { onConflict: 'professor_unidade_id,ano_letivo_id,mes' })

      if (error) throw error

      await recalculateAndPersistHealthScores(
        anoLetivoId,
        trimestreId,
        configPesos,
        rows.map((row) => row.professorUnidadeId)
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lancamentos'] })
      await queryClient.invalidateQueries({ queryKey: ['health-scores'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      await queryClient.invalidateQueries({ queryKey: ['annual-data'] })
    },
  })
}

export function useSavePdiMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ trimestreId, anoLetivoId, configPesos, rows }: SavePdiInput) => {
      const payload = rows.map((row) => ({
        professor_unidade_id: row.professorUnidadeId,
        trimestre_id: trimestreId,
        nota_pdi: row.notaPdi,
      }))

      const { error } = await supabase
        .from('pdi_trimestral')
        .upsert(payload, { onConflict: 'professor_unidade_id,trimestre_id' })

      if (error) throw error

      await recalculateAndPersistHealthScores(
        anoLetivoId,
        trimestreId,
        configPesos,
        rows.map((row) => row.professorUnidadeId)
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pdi'] })
      await queryClient.invalidateQueries({ queryKey: ['health-scores'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      await queryClient.invalidateQueries({ queryKey: ['annual-data'] })
    },
  })
}
