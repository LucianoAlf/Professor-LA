import { ConfigPesos, LancamentoMensal } from '../types/database'

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

export interface CalcHealthScoreResult {
  scoreRet: number
  scoreConv: number
  scoreMedia: number
  scorePdi: number
  healthScore: number
  aptoPro360: boolean
}

export function calcHealthScore(
  lancamentos: LancamentoMensal[],
  pdiNota: number,
  configPesos: ConfigPesos
): CalcHealthScoreResult {
  if (!lancamentos.length) {
    return {
      scoreRet: 0,
      scoreConv: 0,
      scoreMedia: 0,
      scorePdi: clamp(pdiNota),
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
    }
  )

  const taxaRetencao = somatorio.alunosRenovTotal > 0 ? somatorio.alunosRenovOk / somatorio.alunosRenovTotal : 0
  const taxaConversao = somatorio.experimentaisTotal > 0 ? somatorio.experimentaisMatricula / somatorio.experimentaisTotal : 0
  const mediaTurma = somatorio.totalTurmas > 0 ? somatorio.totalAlunosTurmas / somatorio.totalTurmas : 0

  const scoreRet = clamp(taxaRetencao * 100)
  const scoreConv = clamp(taxaConversao * 100)
  const scoreMedia = clamp(
    ((mediaTurma - configPesos.benchmark_media_min) /
      (configPesos.benchmark_media_max - configPesos.benchmark_media_min || 1)) *
      100
  )
  const scorePdi = clamp(pdiNota)

  const healthScore =
    scoreRet * configPesos.peso_retencao +
    scoreConv * configPesos.peso_conversao +
    scoreMedia * configPesos.peso_media_turma +
    scorePdi * configPesos.peso_pdi

  const mediaProf360 = somatorio.notaProf360 / lancamentos.length

  return {
    scoreRet,
    scoreConv,
    scoreMedia,
    scorePdi,
    healthScore,
    aptoPro360: mediaProf360 >= configPesos.corte_prof360,
  }
}
