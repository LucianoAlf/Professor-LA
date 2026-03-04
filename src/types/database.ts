export interface Unidade {
  id: string
  codigo: 'CG' | 'RC' | 'BA' | string
  nome: string
  ativo: boolean
}

export interface Professor {
  id: string
  nome: string
  ativo?: boolean
}

export interface ProfessorUnidade {
  id: string
  professor_id: string
  unidade_id: string
  ativo?: boolean
}

export interface AnoLetivo {
  id: string
  ano: number
  ativo?: boolean
}

export interface Trimestre {
  id: string
  ano_letivo_id: string
  codigo: 'Q1' | 'Q2' | 'Q3' | string
  nome?: string
  ordem?: number
}

export interface ConfigPesos {
  id: string
  ano_letivo_id: string
  peso_retencao: number
  peso_conversao: number
  peso_media_turma: number
  peso_pdi: number
  benchmark_media_min: number
  benchmark_media_max: number
  corte_prof360: number
}

export interface LancamentoMensal {
  id?: string
  professor_unidade_id: string
  ano_letivo_id: string
  mes: string
  alunos_renovacao_total: number
  alunos_renovacao_ok: number
  experimentais_total: number
  experimentais_matricula: number
  total_turmas: number
  total_alunos_turmas: number
  nota_prof360: number
}

export interface PdiTrimestral {
  id?: string
  professor_unidade_id: string
  trimestre_id: string
  nota_pdi: number
}

export interface HealthScore {
  id?: string
  professor_unidade_id: string
  trimestre_id: string
  score_retencao: number
  score_conversao: number
  score_media_turma: number
  score_pdi: number
  health_score: number
  apto_prof360: boolean
  ranking_unidade?: number | null
}

export interface HealthScoreAnual {
  id?: string
  professor_unidade_id: string
  ano_letivo_id: string
  hs_q1: number
  hs_q2: number
  hs_q3: number
  health_score_anual: number
}

export interface Premiacao {
  id?: string
  professor_unidade_id: string
  ano_letivo_id: string
  trimestre_id?: string | null
  tipo: 'trimestral' | 'anual' | string
  titulo: string
  observacao?: string | null
}
