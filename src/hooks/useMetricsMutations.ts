import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUARTERS } from '../constants'
import { calcHealthScore } from '../lib/calcHealthScore'
import { supabase } from '../lib/supabase'
import { ConfigPesos, KpiDefinition, LancamentoMensal } from '../types/database'

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

interface SaveLancamentosInput {
  anoLetivoId: string
  trimestreId: string
  mes: string
  configPesos: ConfigPesos
  rows: Array<{
    professorUnidadeId: string
    taxaRetencao: number
    taxaConversao: number
    mediaTurma: number
    qtdAlunos: number
    notaProf360: number
    observacoes?: string
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
  ano: number,
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
  const months = (QUARTERS[quarterCode]?.months ?? []).map((month) => MONTH_TO_NUMBER[month]).filter(Boolean)

  const { data: lancamentos, error: lancamentosError } = await supabase
    .from('lancamentos_mensais')
    .select('*')
    .eq('ano', ano)
    .in('professor_unidade_id', professorUnidadeIds)
    .in('mes', months)

  if (lancamentosError) throw lancamentosError

  const { data: pdiRows, error: pdiError } = await supabase
    .from('pdi_trimestral')
    .select('*')
    .eq('trimestre_id', trimestreId)
    .in('professor_unidade_id', professorUnidadeIds)

  if (pdiError) throw pdiError

  const { data: kpiDefinitions, error: kpiError } = await supabase
    .from('kpi_definitions')
    .select('*')
    .eq('ano_letivo_id', anoLetivoId)
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (kpiError) throw kpiError

  const groupedLancamentos = (lancamentos ?? []).reduce((acc: Record<string, LancamentoMensal[]>, item: any) => {
    const key = item.professor_unidade_id
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {})

  const pdiMap = new Map((pdiRows ?? []).map((item: any) => [item.professor_unidade_id, item.nota]))

  const scores = professorUnidadeIds.map((professorUnidadeId) => {
    const calc = calcHealthScore(
      groupedLancamentos[professorUnidadeId] ?? [],
      pdiMap.get(professorUnidadeId) ?? 0,
      configPesos,
      (kpiDefinitions ?? []) as KpiDefinition[]
    )

    return {
      professor_unidade_id: professorUnidadeId,
      trimestre_id: trimestreId,
      score_retencao: calc.scoreRet,
      score_conversao: calc.scoreConv,
      score_media_turma: calc.scoreMedia,
      score_pdi: calc.scorePdi,
      score_extra: calc.scoreExtra,
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
      const ano = await resolveAnoByAnoLetivoId(anoLetivoId)
      const mesNumero = MONTH_TO_NUMBER[mes]

      if (!mesNumero) throw new Error('Mês inválido para lançamento.')

      const payload = rows.map((row) => ({
        professor_unidade_id: row.professorUnidadeId,
        ano,
        mes: mesNumero,
        // Novo modelo (taxas diretas)
        taxa_retencao: row.taxaRetencao / 100,
        taxa_conversao: row.taxaConversao / 100,
        media_turma: row.mediaTurma,
        qtd_alunos: row.qtdAlunos,
        observacoes: row.observacoes ?? null,
        // Compatibilidade temporária com colunas legadas
        alunos_renovacao_total: row.qtdAlunos,
        alunos_renovacao_ok: Math.round((row.taxaRetencao / 100) * row.qtdAlunos),
        experimentais_total: row.qtdAlunos,
        experimentais_matricula: Math.round((row.taxaConversao / 100) * row.qtdAlunos),
        total_turmas: 1,
        total_alunos_turmas: row.qtdAlunos,
        nota_prof360: row.notaProf360,
      }))

      const { error } = await supabase
        .from('lancamentos_mensais')
        .upsert(payload, { onConflict: 'professor_unidade_id,ano,mes' })

      if (error) throw error

      await recalculateAndPersistHealthScores(
        ano,
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
      const ano = await resolveAnoByAnoLetivoId(anoLetivoId)

      const payload = rows.map((row) => ({
        professor_unidade_id: row.professorUnidadeId,
        trimestre_id: trimestreId,
        nota: row.notaPdi,
      }))

      const { error } = await supabase
        .from('pdi_trimestral')
        .upsert(payload, { onConflict: 'professor_unidade_id,trimestre_id' })

      if (error) throw error

      await recalculateAndPersistHealthScores(
        ano,
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
