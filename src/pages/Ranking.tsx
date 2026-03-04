import React from 'react';
import { useAppContext } from '../AppContext';
import { QUARTERS, UNITS } from '../constants';
import { Pill, UnitBadge, RankPos, AptoBadge, AvalText } from '../components/ui';

export const Ranking: React.FC = () => {
  const { curQ, curUnit, calcQ } = useAppContext();
  const data = calcQ(curQ, curUnit);
  const q = QUARTERS[curQ];
  const isCons = curUnit === 'CONS';

  return (
    <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          Resultado Final · {q.label}
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          🏆 Ranking <em className="text-[var(--gold)] not-italic">{curQ}</em>
        </div>
        <div className="text-xs text-[var(--txt3)] mt-1.5">
          Ordenado por Health Score — maior para menor.
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="w-11 px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">#</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Professor</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Score Ret.</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Score Conv.</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Score Média</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Score PDI</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Health Score</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">vs 80 pts</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Prof. 360</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Avaliação</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={`${d.uid}-${d.name}-${i}`} className="border-b border-[var(--border)] transition-colors hover:bg-[var(--surface)]">
                <td className="px-2.5 py-3 align-middle"><RankPos rank={d.rank} /></td>
                <td className="px-2.5 py-3 align-middle">
                  <div className="font-bold text-[var(--txt)] text-sm flex items-center gap-2">
                    {d.name} {isCons && <UnitBadge uid={d.uid} />}
                  </div>
                </td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sR} /></td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sC} /></td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sM} /></td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sP} type="pdi" /></td>
                <td className="px-2.5 py-3 align-middle">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-[13px] font-bold font-mono border ${d.hs >= 80 ? 'bg-[rgba(26,110,66,0.14)] text-[#1A6E42] border-[rgba(26,110,66,0.25)] light:text-[#4AE88A]' : d.hs >= 60 ? 'bg-[rgba(200,151,58,0.14)] text-[var(--goldD)] border-[rgba(200,151,58,0.24)] light:text-[var(--gold)]' : 'bg-[rgba(166,28,28,0.12)] text-[#A61C1C] border-[rgba(166,28,28,0.22)] light:text-[#FF8080]'}`}>
                    {d.hs.toFixed(1)}
                  </span>
                </td>
                <td className="px-2.5 py-3 align-middle">
                  <span className={`font-mono text-xs ${d.hs >= 80 ? 'text-[#1A6E42]' : 'text-[#A61C1C]'}`}>
                    {d.hs >= 80 ? '+' : ''}{(d.hs - 80).toFixed(1)}
                  </span>
                </td>
                <td className="px-2.5 py-3 align-middle"><AptoBadge apto={d.apto} /></td>
                <td className="px-2.5 py-3 align-middle"><AvalText hs={d.hs} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
