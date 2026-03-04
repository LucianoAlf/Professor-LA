import React from 'react';
import { useAppContext } from '../AppContext';
import { UNITS } from '../constants';
import { UnitId } from '../types';

export const UnitBar: React.FC = () => {
  const { curUnit, setCurUnit } = useAppContext();

  return (
    <div className="flex items-center gap-1.5 px-5 py-2.5 flex-wrap border-b border-[var(--border2)] bg-[var(--bg3)] backdrop-blur-sm">
      <span className="text-[9px] tracking-[2px] uppercase text-[var(--txt4)] font-bold mr-1">Unidade</span>
      {(Object.keys(UNITS) as UnitId[]).map(uid => {
        const u = UNITS[uid];
        const isActive = curUnit === uid;
        
        // Determine active classes based on unit
        let activeClass = '';
        if (isActive) {
          if (uid === 'CG') activeClass = 'bg-[rgba(45,90,160,0.14)] border-[rgba(45,90,160,0.35)] text-[#4A8FD4] light:text-[#7EB9FF]';
          else if (uid === 'RC') activeClass = 'bg-[rgba(26,110,66,0.12)] border-[rgba(26,110,66,0.3)] text-[var(--green)] light:text-[#4AE88A]';
          else if (uid === 'BA') activeClass = 'bg-[rgba(184,92,0,0.12)] border-[rgba(184,92,0,0.3)] text-[var(--orange)] light:text-[#FFA040]';
          else if (uid === 'CONS') activeClass = 'bg-[rgba(200,151,58,0.12)] border-[rgba(200,151,58,0.3)] text-[var(--gold)]';
        } else {
          activeClass = 'border-[var(--border)] text-[var(--txt3)] bg-transparent hover:text-[var(--txt2)]';
        }

        return (
          <button
            key={uid}
            onClick={() => setCurUnit(uid)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer border transition-all duration-150 flex items-center gap-1.5 ${activeClass}`}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: u.dot }}></span>
            {u.label}
          </button>
        );
      })}
    </div>
  );
};
