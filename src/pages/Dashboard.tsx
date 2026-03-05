import React from 'react';
import { useAppContext } from '../AppContext';
import { QUARTERS, UNITS } from '../constants';
import { Pill, UnitBadge, RankPos, AptoBadge, AvalText } from '../components/ui';
import { useDashboardData } from '../hooks/useDashboardData';

export const Dashboard: React.FC = () => {
  const { curQ, curUnit, anoLetivoId } = useAppContext();
  const dashboardQuery = useDashboardData(curUnit, curQ, anoLetivoId);
  const data = dashboardQuery.data ?? [];
  const q = QUARTERS[curQ];
  const isCons = curUnit === 'CONS';
  const uLabel = isCons ? 'Consolidado — todas as unidades' : UNITS[curUnit].label;

  const mediaHs = data.length ? data.reduce((s, d) => s + d.hs, 0) / data.length : 0;
  const acima80 = data.filter(d => d.hs >= 80).length;
  const aptos = data.filter(d => d.apto).length;

  return (
    <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          {q.label} · {uLabel}
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          Health Score <em className="text-[var(--gold)] not-italic">Trimestral</em>
        </div>
        <div className="text-xs text-[var(--txt3)] mt-1.5">
          Resultados calculados com base nos lançamentos do trimestre.
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 relative overflow-hidden transition-transform hover:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-[var(--gold)] before:to-transparent">
          <div className="text-[10px] tracking-[1.5px] uppercase text-[var(--txt3)] mb-2 font-semibold">Professores</div>
          <div className="font-serif text-[34px] font-black leading-none text-[var(--gold)]">{data.length}</div>
          <div className="text-[11px] text-[var(--txt3)] mt-1.5">avaliados este trimestre</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 relative overflow-hidden transition-transform hover:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-[var(--ink3)] before:to-transparent">
          <div className="text-[10px] tracking-[1.5px] uppercase text-[var(--txt3)] mb-2 font-semibold">Média Health Score</div>
          <div className="font-serif text-[34px] font-black leading-none text-[#4A8FD4] light:text-[#7EB9FF]">{mediaHs.toFixed(1)}</div>
          <div className="text-[11px] text-[var(--txt3)] mt-1.5">média do grupo</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 relative overflow-hidden transition-transform hover:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-[var(--green)] before:to-transparent">
          <div className="text-[10px] tracking-[1.5px] uppercase text-[var(--txt3)] mb-2 font-semibold">Acima de 80 pts</div>
          <div className="font-serif text-[34px] font-black leading-none text-[var(--green)] light:text-[#4AE88A]">{acima80}</div>
          <div className="text-[11px] text-[var(--txt3)] mt-1.5">desempenho excelente</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 relative overflow-hidden transition-transform hover:-translate-y-0.5 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-[var(--orange)] before:to-transparent">
          <div className="text-[10px] tracking-[1.5px] uppercase text-[var(--txt3)] mb-2 font-semibold">Aptos Prof. 360</div>
          <div className="font-serif text-[34px] font-black leading-none text-[var(--orange)] light:text-[#FFA040]">{aptos}</div>
          <div className="text-[11px] text-[var(--txt3)] mt-1.5">elegíveis ao programa</div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-[rgba(200,151,58,0.25)] to-transparent my-5"></div>

      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          Resultado
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          Ranking <em className="text-[var(--gold)] not-italic">{curQ}</em>
        </div>
      </div>

      {dashboardQuery.isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-10 w-full rounded-lg bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      )}

      {dashboardQuery.isError && (
        <div className="rounded-xl border border-[var(--red)]/30 bg-[rgba(166,28,28,0.10)] p-4 text-sm text-[var(--txt)]">
          Erro ao carregar dados do Supabase. Tente novamente em instantes.
        </div>
      )}

      {!dashboardQuery.isLoading && !dashboardQuery.isError && (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="w-11 px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">#</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Professor</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Retenção</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Conversão</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Média/Turma</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">PDI</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">KPI Extra</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Health Score</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]"></th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Prof. 360</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Status</th>
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
                  <div className="text-[11px] text-[var(--txt3)] mt-0.5">
                    {d.aAl.toFixed(0)} alunos · média/turma {d.aMedia.toFixed(2)}
                  </div>
                </td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sR} /></td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sC} /></td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sM} /></td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sP} type="pdi" /></td>
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sE} /></td>
                <td className="px-2.5 py-3 align-middle">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-[13px] font-bold font-mono border ${d.hs >= 80 ? 'bg-[rgba(26,110,66,0.14)] text-[#1A6E42] border-[rgba(26,110,66,0.25)] light:text-[#4AE88A]' : d.hs >= 60 ? 'bg-[rgba(200,151,58,0.14)] text-[var(--goldD)] border-[rgba(200,151,58,0.24)] light:text-[var(--gold)]' : 'bg-[rgba(166,28,28,0.12)] text-[#A61C1C] border-[rgba(166,28,28,0.22)] light:text-[#FF8080]'}`}>
                      {d.hs.toFixed(1)}
                    </span>
                    <div className="w-20 h-1.5 bg-[var(--border)] rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full ${d.hs >= 80 ? 'bg-gradient-to-r from-[var(--green)] to-[#4AE88A]' : d.hs >= 60 ? 'bg-gradient-to-r from-[var(--goldD)] to-[var(--gold)]' : 'bg-gradient-to-r from-[var(--red)] to-[#FF8080]'}`} 
                        style={{ width: `${d.hs}%` }}
                      ></div>
                    </div>
                  </div>
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
      )}
    </div>
  );
};
