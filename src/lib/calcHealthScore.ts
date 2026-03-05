import { ConfigPesos, LancamentoMensal } from '../types/database'

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))
const normalizeWeight = (value?: number) => {
  const raw = value ?? 0
  return raw > 1 ? raw / 100 : raw
}

export interface CalcHealthScoreResult {
  scoreRet: number
  scoreConv: number
  scoreMedia: number
  scorePdi: number
  scoreExtra: number
  healthScore: number
  aptoPro360: boolean
}

export function calcHealthScore(
  lancamentos: LancamentoMensal[],
  pdiNota: number,
  configPesos: ConfigPesos
): CalcHealthScoreResult {
  const mediaMin = configPesos.media_turma_min ?? configPesos.benchmark_media_min ?? 1
  const mediaMax = configPesos.media_turma_max ?? configPesos.benchmark_media_max ?? 2.5
  const corte360 = configPesos.nota_corte_360 ?? configPesos.corte_prof360 ?? 80
  const pesoRet = normalizeWeight(configPesos.peso_retencao)
  const pesoConv = normalizeWeight(configPesos.peso_conversao)
  const pesoMedia = normalizeWeight(configPesos.peso_media_turma)
  const pesoPdi = normalizeWeight(configPesos.peso_pdi)
  const pesoExtra = normalizeWeight(configPesos.peso_extra)

  if (!lancamentos.length) {
    return {
      scoreRet: 0,
      scoreConv: 0,
      scoreMedia: 0,
      scorePdi: clamp(pdiNota),
      scoreExtra: 0,
      healthScore: 0,
      aptoPro360: false,
    }
  }

  const somatorio = lancamentos.reduce(
    (acc, item) => {
      acc.alunosRenovTotal += item.alunos_renovacao_total ?? 0
      acc.alunosRenovOk += item.alunos_renovacao_ok ?? 0
      acc.experimentaisTotal += item.experimentais_total ?? 0
      acc.experimentaisMatricula += item.experimentais_matricula ?? 0
      acc.totalTurmas += item.total_turmas ?? 0
      acc.totalAlunosTurmas += item.total_alunos_turmas ?? 0
      acc.notaProf360 += item.nota_prof360 ?? 0
      if (typeof item.taxa_retencao === 'number') {
        acc.taxaRetencaoSum += item.taxa_retencao
        acc.taxaRetencaoCount += 1
      }
      if (typeof item.taxa_conversao === 'number') {
        acc.taxaConversaoSum += item.taxa_conversao
        acc.taxaConversaoCount += 1
      }
      if (typeof item.media_turma === 'number') {
        acc.mediaTurmaSum += item.media_turma
        acc.mediaTurmaCount += 1
      }
      return acc
    },
    {
      alunosRenovTotal: 0,
      alunosRenovOk: 0,
      experimentaisTotal: 0,
      experimentaisMatricula: 0,
      totalTurmas: 0,
      totalAlunosTurmas: 0,
      notaProf360: 0,
      taxaRetencaoSum: 0,
      taxaRetencaoCount: 0,
      taxaConversaoSum: 0,
      taxaConversaoCount: 0,
      mediaTurmaSum: 0,
      mediaTurmaCount: 0,
    }
  )

  const taxaRetencaoDireta =
    somatorio.taxaRetencaoCount > 0 ? somatorio.taxaRetencaoSum / somatorio.taxaRetencaoCount : null
  const taxaConversaoDireta =
    somatorio.taxaConversaoCount > 0 ? somatorio.taxaConversaoSum / somatorio.taxaConversaoCount : null
  const mediaTurmaDireta =
    somatorio.mediaTurmaCount > 0 ? somatorio.mediaTurmaSum / somatorio.mediaTurmaCount : null

  const taxaRetencao =
    taxaRetencaoDireta ?? (somatorio.alunosRenovTotal > 0 ? somatorio.alunosRenovOk / somatorio.alunosRenovTotal : 0)
  const taxaConversao =
    taxaConversaoDireta ?? (somatorio.experimentaisTotal > 0 ? somatorio.experimentaisMatricula / somatorio.experimentaisTotal : 0)
  const mediaTurma =
    mediaTurmaDireta ?? (somatorio.totalTurmas > 0 ? somatorio.totalAlunosTurmas / somatorio.totalTurmas : 0)

  const scoreRet = clamp(taxaRetencao * 100)
  const scoreConv = clamp(taxaConversao * 100)
  const scoreMedia = clamp(
    ((mediaTurma - mediaMin) /
      (mediaMax - mediaMin || 1)) *
      100
  )
  const scorePdi = clamp(pdiNota)
  const scoreExtra = 0

  const healthScore =
    scoreRet * pesoRet +
    scoreConv * pesoConv +
    scoreMedia * pesoMedia +
    scorePdi * pesoPdi +
    scoreExtra * pesoExtra

  const mediaProf360 = somatorio.notaProf360 / lancamentos.length

  return {
    scoreRet,
    scoreConv,
    scoreMedia,
    scorePdi,
    scoreExtra,
    healthScore,
    aptoPro360: mediaProf360 >= corte360,
  }
}
