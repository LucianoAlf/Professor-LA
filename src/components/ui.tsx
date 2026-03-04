import React from 'react';
import { UNITS } from '../constants';

export const Pill: React.FC<{ value: number, type?: 'hs' | 'pdi' | 'default' }> = ({ value, type = 'default' }) => {
  let colorClass = '';
  if (type === 'pdi') {
    colorClass = 'bg-[rgba(184,92,0,0.12)] text-[var(--orange)] border-[rgba(184,92,0,0.22)] light:text-[#FFA040]';
  } else if (type === 'hs') {
    colorClass = 'bg-[rgba(45,90,160,0.12)] text-[var(--ink3)] border-[rgba(45,90,160,0.22)] light:text-[#7EB9FF]';
  } else {
    if (value >= 80) colorClass = 'bg-[rgba(26,110,66,0.14)] text-[#1A6E42] border-[rgba(26,110,66,0.25)] light:text-[#4AE88A]';
    else if (value >= 60) colorClass = 'bg-[rgba(200,151,58,0.14)] text-[var(--goldD)] border-[rgba(200,151,58,0.24)] light:text-[var(--gold)]';
    else colorClass = 'bg-[rgba(166,28,28,0.12)] text-[#A61C1C] border-[rgba(166,28,28,0.22)] light:text-[#FF8080]';
  }

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border ${colorClass}`}>
      {value.toFixed(1)}
    </span>
  );
};

export const UnitBadge: React.FC<{ uid: string }> = ({ uid }) => {
  if (!uid || uid === 'CONS') return null;
  const u = UNITS[uid];
  
  let badgeClass = '';
  if (uid === 'CG') badgeClass = 'bg-[rgba(45,90,160,0.12)] text-[#4A8FD4] border-[rgba(45,90,160,0.2)]';
  else if (uid === 'RC') badgeClass = 'bg-[rgba(26,110,66,0.1)] text-[var(--green)] border-[rgba(26,110,66,0.18)]';
  else if (uid === 'BA') badgeClass = 'bg-[rgba(184,92,0,0.1)] text-[var(--orange)] border-[rgba(184,92,0,0.18)]';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
      {u.short}
    </span>
  );
};

export const RankPos: React.FC<{ rank: number }> = ({ rank }) => {
  let colorClass = 'text-[var(--txt4)]';
  if (rank === 1) colorClass = 'text-[var(--gold)]';
  else if (rank === 2) colorClass = 'text-[#888]';
  else if (rank === 3) colorClass = 'text-[#A0763A]';

  return (
    <div className={`font-serif text-[19px] font-black w-10 text-center ${colorClass}`}>
      {rank}
    </div>
  );
};

export const AptoBadge: React.FC<{ apto: boolean }> = ({ apto }) => {
  if (apto) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[rgba(26,110,66,0.1)] text-[var(--green)] border border-[rgba(26,110,66,0.2)]">
        ✅ Apto
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[rgba(166,28,28,0.1)] text-[var(--red)] border border-[rgba(166,28,28,0.2)]">
      ❌ Inapto
    </span>
  );
};

export const AvalText: React.FC<{ hs: number }> = ({ hs }) => {
  if (hs >= 80) return <span className="text-[#4AE88A] font-bold">✨ Excelente</span>;
  if (hs >= 60) return <span className="text-[#C8973A] font-bold">👍 Bom</span>;
  return <span className="text-[#FF8080] font-bold">⚠️ Atenção</span>;
};
