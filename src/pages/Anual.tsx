import React from 'react';
import { useAppContext } from '../AppContext';
import { UNITS } from '../constants';
import { Pill, UnitBadge, RankPos, AvalText } from '../components/ui';

export const Anual: React.FC = () => {
  const { curUnit, calcAnn, calcQUnit } = useAppContext();
  const data = calcAnn(curUnit);
  const isCons = curUnit === 'CONS';
  const units = isCons ? ['CG', 'RC', 'BA'] : [curUnit];

  return (
    <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          Consolidado
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          📅 Resultado <em className="text-[var(--gold)] not-italic">Anual 2026</em>
        </div>
        <div className="text-xs text-[var(--txt3)] mt-1.5">
          Média dos 3 trimestres (Q1 + Q2 + Q3). Ranking final do professor do ano.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {units.map(uid => (
          <div key={uid} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1px] uppercase mb-3">
              📈 {UNITS[uid].label}
            </div>
            {(['Q1', 'Q2', 'Q3'] as const).map(qc => {
              const best = calcQUnit(qc, uid)[0];
              return (
                <div key={qc} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-b-0">
                  <div className="text-[13px] font-semibold text-[var(--txt)]">
                    <span className="text-[var(--gold)] mr-1.5">🏆 {qc}</span>{best.name}
                  </div>
                  <div className={`font-mono text-[13px] font-bold ${best.hs >= 80 ? 'text-[var(--green)]' : best.hs >= 60 ? 'text-[var(--gold)]' : 'text-[var(--red)]'}`}>
                    {best.hs.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="h-px bg-gradient-to-r from-[rgba(200,151,58,0.25)] to-transparent my-5"></div>

      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          Ranking Final
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          🥇 Professor <em className="text-[var(--gold)] not-italic">do Ano</em>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="w-11 px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">#</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Professor</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">HS Q1</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">HS Q2</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">HS Q3</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">HS Anual</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Ret. Anual</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Conv. Anual</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">PDI Anual</th>
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
                <td className="px-2.5 py-3 align-middle"><Pill value={d.hsQ1} type="hs" /></td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.hsQ2} type="hs" /></td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.hsQ3} type="hs" /></td>
                <td className="px-2.5 py-3 align-middle">
                  <span className={`inline-block px-3.5 py-1.5 rounded-full text-sm font-bold font-mono border ${d.hsAnn >= 80 ? 'bg-[rgba(26,110,66,0.14)] text-[#1A6E42] border-[rgba(26,110,66,0.25)] light:text-[#4AE88A]' : d.hsAnn >= 60 ? 'bg-[rgba(200,151,58,0.14)] text-[var(--goldD)] border-[rgba(200,151,58,0.24)] light:text-[var(--gold)]' : 'bg-[rgba(166,28,28,0.12)] text-[#A61C1C] border-[rgba(166,28,28,0.22)] light:text-[#FF8080]'}`}>
                    {d.hsAnn.toFixed(1)}
                  </span>
                </td>
                <td className="px-2.5 py-3 align-middle font-mono text-xs">{(d.retAnn * 100).toFixed(1)}%</td>
                <td className="px-2.5 py-3 align-middle font-mono text-xs">{(d.convAnn * 100).toFixed(1)}%</td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.pdiAnn} type="pdi" /></td>
                <td className="px-2.5 py-3 align-middle"><AvalText hs={d.hsAnn} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
