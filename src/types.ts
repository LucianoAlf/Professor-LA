export type UnitId = 'CG' | 'RC' | 'BA' | 'CONS';
export type QuarterId = 'Q1' | 'Q2' | 'Q3';
export type MonthId = 'Mar' | 'Abr' | 'Mai' | 'Jun' | 'Jul' | 'Ago' | 'Set' | 'Out' | 'Nov';

export interface ProfessorMonthlyData {
  ret: number;
  conv: number;
  media: number;
  nota360: number;
  alunos: number;
}

export interface Config {
  weights: {
    ret: number;
    conv: number;
    media: number;
    pdi: number;
  };
  mediaMin: number;
  mediaMax: number;
  corte360: number;
}

export interface AppState {
  curQ: QuarterId;
  curUnit: UnitId;
  curMonth: MonthId;
  curPDIQ: QuarterId;
  isLight: boolean;
  sbOpen: boolean;
  activePage: string;
  monthly: Record<string, Record<string, ProfessorMonthlyData[]>>;
  pdiData: Record<string, Record<string, number[]>>;
  cfg: Config;
}
