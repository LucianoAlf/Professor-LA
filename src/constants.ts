import { QuarterId, MonthId } from './types';

export const UNITS: Record<string, { label: string; short: string; badgeClass: string; activeClass: string; dot: string }> = {
  CG: { label: 'Campo Grande', short: 'CG', badgeClass: 'ub-cg', activeClass: 'active-cg', dot: '#4A8FD4' },
  RC: { label: 'Recreio', short: 'RC', badgeClass: 'ub-rc', activeClass: 'active-rc', dot: '#1A6E42' },
  BA: { label: 'Barra', short: 'BA', badgeClass: 'ub-ba', activeClass: 'active-ba', dot: '#B85C00' },
  CONS: { label: 'Consolidado', short: 'CONS', badgeClass: '', activeClass: 'active-cons', dot: '#C8973A' },
};

export const UNIT_PROFESSORS: Record<string, string[]> = {
  CG: ["Ana Lima", "Carlos Souza", "Fernanda Reis", "Rafael Mendes", "Tatiana Vaz", "João Silva"],
  RC: ["Carlos Souza", "Pedro Alves", "Mariana Costa", "Tatiana Vaz", "Lucas Rocha", "Fernanda Reis"],
  BA: ["Rafael Mendes", "Ana Lima", "Camila Nunes", "Diego Ferreira", "Mariana Costa"],
};

export const QUARTERS: Record<QuarterId, { label: string; months: MonthId[]; names: string[] }> = {
  Q1: { label: "Q1 · Março–Maio", months: ["Mar", "Abr", "Mai"], names: ["Março", "Abril", "Maio"] },
  Q2: { label: "Q2 · Junho–Agosto", months: ["Jun", "Jul", "Ago"], names: ["Junho", "Julho", "Agosto"] },
  Q3: { label: "Q3 · Set–Novembro", months: ["Set", "Out", "Nov"], names: ["Setembro", "Outubro", "Novembro"] },
};

export const ALL_MONTHS: MonthId[] = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov"];

export const MONTH_TO_NUMBER: Record<string, number> = {
  Mar: 3,
  Abr: 4,
  Mai: 5,
  Jun: 6,
  Jul: 7,
  Ago: 8,
  Set: 9,
  Out: 10,
  Nov: 11,
};

export const INITIAL_CFG = {
  weights: { ret: 0.35, conv: 0.25, media: 0.25, pdi: 0.15 },
  mediaMin: 1.0,
  mediaMax: 2.5,
  corte360: 80
};

// Seeded random for initial data
let seed = 42;
function sr(min: number, max: number, dec = 2) {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  const v = ((seed >>> 0) / 0xffffffff) * (max - min) + min;
  return +(v.toFixed(dec));
}

export const INITIAL_MONTHLY: Record<string, Record<string, any[]>> = {};
seed = 42;
['CG', 'RC', 'BA'].forEach(uid => {
  INITIAL_MONTHLY[uid] = {};
  ALL_MONTHS.forEach(m => {
    INITIAL_MONTHLY[uid][m] = UNIT_PROFESSORS[uid].map(() => ({
      ret: +sr(0.72, 0.97).toFixed(2),
      conv: +sr(0.55, 0.93).toFixed(2),
      media: +sr(1.0, 2.4).toFixed(1),
      nota360: Math.round(sr(68, 96)),
      alunos: Math.round(sr(8, 35))
    }));
  });
});

export const INITIAL_PDI: Record<string, Record<string, number[]>> = {};
['CG', 'RC', 'BA'].forEach(uid => {
  INITIAL_PDI[uid] = {
    Q1: UNIT_PROFESSORS[uid].map(() => 60 + Math.round(sr(5, 35))),
    Q2: UNIT_PROFESSORS[uid].map(() => 62 + Math.round(sr(5, 33))),
    Q3: UNIT_PROFESSORS[uid].map(() => 65 + Math.round(sr(5, 30))),
  };
});
