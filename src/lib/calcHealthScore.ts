import { ConfigPesos, KpiDefinition, LancamentoMensal } from '../types/database'

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
  kpiScores: Record<string, number>
}

const normalizePercent = (value: number) => (value <= 1 ? value * 100 : value)

const getDefaultKpis = (configPesos: ConfigPesos): KpiDefinition[] => {
  const mediaMin = configPesos.media_turma_min ?? configPesos.benchmark_media_min ?? 1
  const mediaMax = configPesos.media_turma_max ?? configPesos.benchmark_media_max ?? 2.5

  return [
    {
      id: 'default-retencao',
      ano_letivo_id: configPesos.ano_letivo_id,
      slug: 'retencao',
      nome: 'Taxa de Retencao',
      origem: 'lancamento',
      campo_origem: 'taxa_retencao',
      tipo_score: 'percentual',
      peso: normalizeWeight(configPesos.peso_retencao),
      entra_no_health_score: true,
      ativo: true,
      ordem: 10,
    },
    {
      id: 'default-conversao',
      ano_letivo_id: configPesos.ano_letivo_id,
      slug: 'conversao',
      nome: 'Taxa de Conversao',
      origem: 'lancamento',
      campo_origem: 'taxa_conversao',
      tipo_score: 'percentual',
      peso: normalizeWeight(configPesos.peso_conversao),
      entra_no_health_score: true,
      ativo: true,
      ordem: 20,
    },
    {
      id: 'default-media-turma',
      ano_letivo_id: configPesos.ano_letivo_id,
      slug: 'media_turma',
      nome: 'Media Alunos/Turma',
      origem: 'lancamento',
      campo_origem: 'media_turma',
      tipo_score: 'faixa',
      min_ref: mediaMin,
      max_ref: mediaMax,
      peso: normalizeWeight(configPesos.peso_media_turma),
      entra_no_health_score: true,
      ativo: true,
      ordem: 30,
    },
    {
      id: 'default-pdi',
      ano_letivo_id: configPesos.ano_letivo_id,
      slug: 'pdi',
      nome: 'PDI',
      origem: 'pdi',
      campo_origem: 'nota',
      tipo_score: 'direto',
      min_ref: 0,
      max_ref: 100,
      peso: normalizeWeight(configPesos.peso_pdi),
      entra_no_health_score: true,
      ativo: true,
      ordem: 40,
    },
    {
      id: 'default-qtd-alunos',
      ano_letivo_id: configPesos.ano_letivo_id,
      slug: 'qtd_alunos',
      nome: 'Numero de Alunos',
      origem: 'lancamento',
      campo_origem: 'qtd_alunos',
      tipo_score: 'direto',
      min_ref: 0,
      max_ref: 100,
      peso: normalizeWeight(configPesos.peso_extra),
      entra_no_health_score: normalizeWeight(configPesos.peso_extra) > 0,
      ativo: true,
      ordem: 50,
    },
  ]
}

const calculateScoreByType = (kpi: KpiDefinition, rawValue: number) => {
  if (kpi.tipo_score === 'percentual') {
    return clamp(normalizePercent(rawValue))
  }

  if (kpi.tipo_score === 'faixa') {
    const min = kpi.min_ref ?? 0
    const max = kpi.max_ref ?? 100
    return clamp(((rawValue - min) / (max - min || 1)) * 100)
  }

  return clamp(rawValue)
}

export function calcHealthScore(
  lancamentos: LancamentoMensal[],
  pdiNota: number,
  configPesos: ConfigPesos,
  kpiDefinitions?: KpiDefinition[]
): CalcHealthScoreResult {
  const corte360 = configPesos.nota_corte_360 ?? configPesos.corte_prof360 ?? 80
  const kpis = (kpiDefinitions?.length ? kpiDefinitions : getDefaultKpis(configPesos)).filter((kpi) => kpi.ativo)

  if (!lancamentos.length) {
    const scorePdi = clamp(pdiNota)
    return {
      scoreRet: 0,
      scoreConv: 0,
      scoreMedia: 0,
      scorePdi,
      scoreExtra: 0,
      healthScore: 0,
      aptoPro360: false,
      kpiScores: { pdi: scorePdi },
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
      if (typeof item.qtd_alunos === 'number') {
        acc.qtdAlunosSum += item.qtd_alunos
        acc.qtdAlunosCount += 1
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
      qtdAlunosSum: 0,
      qtdAlunosCount: 0,
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
  const qtdAlunos = somatorio.qtdAlunosCount > 0 ? somatorio.qtdAlunosSum / somatorio.qtdAlunosCount : 0

  const mediaProf360 = somatorio.notaProf360 / lancamentos.length

  const getRawValueByKpi = (kpi: KpiDefinition) => {
    if (kpi.origem === 'pdi') {
      return pdiNota
    }

    if (kpi.origem === 'lancamento') {
      switch (kpi.campo_origem) {
        case 'taxa_retencao':
          return taxaRetencao
        case 'taxa_conversao':
          return taxaConversao
        case 'media_turma':
          return mediaTurma
        case 'qtd_alunos':
          return qtdAlunos
        case 'nota_prof360':
          return mediaProf360
        default:
          return 0
      }
    }

    return 0
  }

  const kpiScores: Record<string, number> = {}
  let healthScore = 0

  for (const kpi of kpis) {
    const rawValue = getRawValueByKpi(kpi)
    const score = calculateScoreByType(kpi, rawValue)
    kpiScores[kpi.slug] = score

    if (kpi.entra_no_health_score) {
      healthScore += score * normalizeWeight(kpi.peso)
    }
  }

  const scoreRet = kpiScores.retencao ?? clamp(taxaRetencao * 100)
  const scoreConv = kpiScores.conversao ?? clamp(taxaConversao * 100)
  const scoreMedia = kpiScores.media_turma ?? 0
  const scorePdi = kpiScores.pdi ?? clamp(pdiNota)
  const legacySlugs = new Set(['retencao', 'conversao', 'media_turma', 'pdi'])
  const scoreExtra = Object.entries(kpiScores)
    .filter(([slug]) => !legacySlugs.has(slug))
    .reduce((acc, [, value]) => acc + value, 0)

  return {
    scoreRet,
    scoreConv,
    scoreMedia,
    scorePdi,
    scoreExtra,
    healthScore,
    aptoPro360: mediaProf360 >= corte360,
    kpiScores,
  }
}
