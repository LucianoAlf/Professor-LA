import React, { Fragment } from 'react';
import { useAppContext } from '../AppContext';
import { QUARTERS, UNITS } from '../constants';
import { Pill, UnitBadge, RankPos, AptoBadge, AvalText } from '../components/ui';
import { useDashboardData } from '../hooks/useDashboardData';

const MONTH_NAMES: Record<number, string> = {
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
};

export const Ranking: React.FC = () => {
  const { curQ, curUnit, anoLetivoId } = useAppContext();
  const rankingQuery = useDashboardData(curUnit, curQ, anoLetivoId);
  const data = rankingQuery.data ?? [];
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

      {rankingQuery.isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-10 w-full rounded-lg bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      )}

      {rankingQuery.isError && (
        <div className="rounded-xl border border-[var(--red)]/30 bg-[rgba(166,28,28,0.10)] p-4 text-sm text-[var(--txt)]">
          Erro ao carregar o ranking. Tente novamente.
        </div>
      )}

      {!rankingQuery.isLoading && !rankingQuery.isError && (
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
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">KPI Extra</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Health Score</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">vs 80 pts</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Prof. 360</th>
              <th className="px-2.5 py-2 text-left text-[10px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold border-b border-[var(--border)]">Avaliação</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <Fragment key={`${d.uid}-${d.name}-${i}`}>
              <tr className="border-b border-[var(--border)] transition-colors hover:bg-[var(--surface)]">
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
                <td className="px-2.5 py-3 align-middle"><Pill value={d.sE} /></td>
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
              <tr className="border-b border-[var(--border)] bg-[rgba(45,90,160,0.05)]">
                <td></td>
                <td colSpan={10} className="px-2.5 py-2.5">
                  <details>
                    <summary className="cursor-pointer text-xs font-semibold text-[var(--txt2)]">
                      Ver meses do trimestre ({q.names.join(' / ')})
                    </summary>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full min-w-[520px] border-collapse text-xs">
                        <thead>
                          <tr>
                            <th className="px-2 py-1.5 text-left text-[var(--txt3)]">Mês</th>
                            <th className="px-2 py-1.5 text-left text-[var(--txt3)]">Retenção</th>
                            <th className="px-2 py-1.5 text-left text-[var(--txt3)]">Conversão</th>
                            <th className="px-2 py-1.5 text-left text-[var(--txt3)]">Média/Turma</th>
                            <th className="px-2 py-1.5 text-left text-[var(--txt3)]">Nota 360</th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.monthly.map((month) => (
                            <tr key={`${d.uid}-${d.name}-${month.mes}`} className="border-t border-[var(--border)]/60">
                              <td className="px-2 py-1.5 text-[var(--txt)]">{MONTH_NAMES[month.mes] ?? month.mes}</td>
                              <td className="px-2 py-1.5 font-mono">{month.ret.toFixed(1)}%</td>
                              <td className="px-2 py-1.5 font-mono">{month.conv.toFixed(1)}%</td>
                              <td className="px-2 py-1.5 font-mono">{month.media.toFixed(2)}</td>
                              <td className="px-2 py-1.5 font-mono">{month.nota360.toFixed(0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </td>
              </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};
