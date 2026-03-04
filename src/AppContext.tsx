import React, { createContext, useContext, useState } from 'react';
import { QuarterId, UnitId, MonthId, Config, ProfessorMonthlyData } from './types';
import { INITIAL_CFG, INITIAL_MONTHLY, INITIAL_PDI, QUARTERS, UNIT_PROFESSORS } from './constants';

interface AppContextType {
  curQ: QuarterId;
  setCurQ: (q: QuarterId) => void;
  curUnit: UnitId;
  setCurUnit: (u: UnitId) => void;
  curMonth: MonthId;
  setCurMonth: (m: MonthId) => void;
  curPDIQ: QuarterId;
  setCurPDIQ: (q: QuarterId) => void;
  isLight: boolean;
  setIsLight: (l: boolean) => void;
  sbOpen: boolean;
  setSbOpen: (o: boolean) => void;
  activePage: string;
  setActivePage: (p: string) => void;
  monthly: Record<string, Record<string, ProfessorMonthlyData[]>>;
  setMonthly: React.Dispatch<React.SetStateAction<Record<string, Record<string, ProfessorMonthlyData[]>>>>;
  pdiData: Record<string, Record<string, number[]>>;
  setPdiData: React.Dispatch<React.SetStateAction<Record<string, Record<string, number[]>>>>;
  cfg: Config;
  setCfg: React.Dispatch<React.SetStateAction<Config>>;
  calcQUnit: (qc: QuarterId, uid: string) => any[];
  calcQ: (qc: QuarterId, uid: string) => any[];
  calcAnnUnit: (uid: string) => any[];
  calcAnn: (uid: string) => any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [curQ, setCurQ] = useState<QuarterId>('Q1');
  const [curUnit, setCurUnit] = useState<UnitId>('CG');
  const [curMonth, setCurMonth] = useState<MonthId>('Mar');
  const [curPDIQ, setCurPDIQ] = useState<QuarterId>('Q1');
  const [isLight, setIsLight] = useState(false);
  const [sbOpen, setSbOpen] = useState(window.innerWidth >= 1024);
  const [activePage, setActivePage] = useState('dashboard');
  const [monthly, setMonthly] = useState(INITIAL_MONTHLY);
  const [pdiData, setPdiData] = useState(INITIAL_PDI);
  const [cfg, setCfg] = useState(INITIAL_CFG);

  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;

  const calcQUnit = (qc: QuarterId, uid: string) => {
    const q = QUARTERS[qc];
    const profs = UNIT_PROFESSORS[uid];
    return profs.map((name, pi) => {
      const aRet = avg(q.months.map(m => monthly[uid][m][pi].ret));
      const aConv = avg(q.months.map(m => monthly[uid][m][pi].conv));
      const aMedia = avg(q.months.map(m => monthly[uid][m][pi].media));
      const a360 = avg(q.months.map(m => monthly[uid][m][pi].nota360));
      const aAl = avg(q.months.map(m => monthly[uid][m][pi].alunos));
      const sR = Math.min(100, Math.max(0, aRet * 100));
      const sC = Math.min(100, Math.max(0, aConv * 100));
      const sM = Math.min(100, Math.max(0, (aMedia - cfg.mediaMin) / (cfg.mediaMax - cfg.mediaMin) * 100));
      const sP = Math.min(100, Math.max(0, pdiData[uid][qc][pi]));
      const hs = sR * cfg.weights.ret + sC * cfg.weights.conv + sM * cfg.weights.media + sP * cfg.weights.pdi;
      return { name, uid, aRet, aConv, aMedia, a360, aAl, sR, sC, sM, sP, hs, apto: a360 >= cfg.corte360 };
    }).sort((a, b) => b.hs - a.hs).map((p, i) => ({ ...p, rank: i + 1 }));
  };

  const calcQCons = (qc: QuarterId) => {
    const all: any[] = [];
    ['CG', 'RC', 'BA'].forEach(uid => {
      calcQUnit(qc, uid).forEach(p => all.push({ ...p, uid }));
    });
    return all.sort((a, b) => b.hs - a.hs).map((p, i) => ({ ...p, rank: i + 1 }));
  };

  const calcQ = (qc: QuarterId, uid: string) => {
    return uid === 'CONS' ? calcQCons(qc) : calcQUnit(qc, uid);
  };

  const calcAnnUnit = (uid: string) => {
    const q1 = calcQUnit('Q1', uid), q2 = calcQUnit('Q2', uid), q3 = calcQUnit('Q3', uid);
    return UNIT_PROFESSORS[uid].map((name, pi) => {
      const p1 = q1.find(p => p.name === name), p2 = q2.find(p => p.name === name), p3 = q3.find(p => p.name === name);
      return {
        name, uid, hsQ1: p1.hs, hsQ2: p2.hs, hsQ3: p3.hs,
        hsAnn: avg([p1.hs, p2.hs, p3.hs]),
        retAnn: avg([p1.aRet, p2.aRet, p3.aRet]),
        convAnn: avg([p1.aConv, p2.aConv, p3.aConv]),
        pdiAnn: avg([pdiData[uid].Q1[pi], pdiData[uid].Q2[pi], pdiData[uid].Q3[pi]])
      };
    }).sort((a, b) => b.hsAnn - a.hsAnn).map((p, i) => ({ ...p, rank: i + 1 }));
  };

  const calcAnnCons = () => {
    const all: any[] = [];
    ['CG', 'RC', 'BA'].forEach(uid => {
      calcAnnUnit(uid).forEach(p => all.push({ ...p }));
    });
    return all.sort((a, b) => b.hsAnn - a.hsAnn).map((p, i) => ({ ...p, rank: i + 1 }));
  };

  const calcAnn = (uid: string) => {
    return uid === 'CONS' ? calcAnnCons() : calcAnnUnit(uid);
  };

  return (
    <AppContext.Provider value={{
      curQ, setCurQ, curUnit, setCurUnit, curMonth, setCurMonth, curPDIQ, setCurPDIQ,
      isLight, setIsLight, sbOpen, setSbOpen, activePage, setActivePage,
      monthly, setMonthly, pdiData, setPdiData, cfg, setCfg,
      calcQUnit, calcQ, calcAnnUnit, calcAnn
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
