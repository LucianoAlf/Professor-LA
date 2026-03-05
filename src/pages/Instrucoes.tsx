import React from 'react';

export const Instrucoes: React.FC = () => {
  return (
    <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          Guia de Uso
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          📋 <em className="text-[var(--gold)] not-italic">Instruções</em>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-3.5">
        <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">
          📅 Estrutura do Ano 2026
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3.5">
          <div className="bg-[rgba(45,90,160,0.12)] border border-[rgba(45,90,160,0.2)] rounded-lg p-3.5 text-center">
            <div className="text-[11px] font-bold text-[var(--ink3)] tracking-[1px] uppercase mb-1.5">Q1</div>
            <div className="text-[13px] text-[var(--txt)] font-semibold">Março · Abril · Maio</div>
          </div>
          <div className="bg-[rgba(45,90,160,0.12)] border border-[rgba(45,90,160,0.2)] rounded-lg p-3.5 text-center">
            <div className="text-[11px] font-bold text-[var(--ink3)] tracking-[1px] uppercase mb-1.5">Q2</div>
            <div className="text-[13px] text-[var(--txt)] font-semibold">Junho · Julho · Agosto</div>
          </div>
          <div className="bg-[rgba(45,90,160,0.12)] border border-[rgba(45,90,160,0.2)] rounded-lg p-3.5 text-center">
            <div className="text-[11px] font-bold text-[var(--ink3)] tracking-[1px] uppercase mb-1.5">Q3</div>
            <div className="text-[13px] text-[var(--txt)] font-semibold">Set. · Outubro · Novembro</div>
          </div>
        </div>
        <div className="px-3.5 py-3 bg-[rgba(200,151,58,0.07)] rounded-lg text-xs text-[var(--txt2)] leading-[1.7]">
          Janeiro, Fevereiro e Dezembro ficam fora do ciclo de avaliação.
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-3.5">
        <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">
          📋 Passo a Passo
        </div>
        <div className="flex flex-col gap-3.5">
          <div className="flex gap-3.5 items-start">
            <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-[var(--gold)] text-[var(--ink)]">1</div>
            <div>
              <div className="text-[13px] font-bold text-[var(--txt)] mb-1">⚙️ Configurar pesos</div>
              <div className="text-xs text-[var(--txt2)] leading-[1.65]">Verifique os pesos em Configurações. Somam 100%? A Comissão Pedagógica decide a distribuição.</div>
            </div>
          </div>
          <div className="flex gap-3.5 items-start">
            <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-[var(--ink3)] text-[#fff]">2</div>
            <div>
              <div className="text-[13px] font-bold text-[var(--txt)] mb-1">📥 Lançamento mensal</div>
              <div className="text-xs text-[var(--txt2)] leading-[1.65]">Ao final de cada mês: Retenção %, Conversão %, Média/Turma, Nota 360 e Qtd Alunos.</div>
            </div>
          </div>
          <div className="flex gap-3.5 items-start">
            <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-[var(--orange)] text-[#fff]">3</div>
            <div>
              <div className="text-[13px] font-bold text-[var(--txt)] mb-1">🎯 PDI trimestral</div>
              <div className="text-xs text-[var(--txt2)] leading-[1.65]">Uma vez por trimestre: nota 0–100 contextual, definida pela Comissão para cada professor.</div>
            </div>
          </div>
          <div className="flex gap-3.5 items-start">
            <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-[var(--green)] text-[#fff]">4</div>
            <div>
              <div className="text-[13px] font-bold text-[var(--txt)] mb-1">📊 Ver resultados</div>
              <div className="text-xs text-[var(--txt2)] leading-[1.65]">Dashboard e Ranking atualizam automaticamente. Ao final do Q3, consulte Resultado Anual para o professor do ano.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-3.5">
        <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">
          📊 Os KPIs e seus pesos
        </div>
        
        <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
          <div className="text-[13px] text-[var(--txt2)]">
            Retenção (35%)
            <small className="block text-[11px] text-[var(--txt3)] mt-0.5">% alunos que renovaram no período</small>
          </div>
          <div className="text-right">
            <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">35%</div>
            <div className="w-20 h-1 bg-[var(--border)] rounded-sm mt-1">
              <div className="h-full rounded-sm w-[35%] bg-[var(--green)]"></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
          <div className="text-[13px] text-[var(--txt2)]">
            Conversão (25%)
            <small className="block text-[11px] text-[var(--txt3)] mt-0.5">% experimentais que viraram matrícula</small>
          </div>
          <div className="text-right">
            <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">25%</div>
            <div className="w-20 h-1 bg-[var(--border)] rounded-sm mt-1">
              <div className="h-full rounded-sm w-[25%] bg-[var(--ink3)]"></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
          <div className="text-[13px] text-[var(--txt2)]">
            Média Alunos/Turma (25%)
            <small className="block text-[11px] text-[var(--txt3)] mt-0.5">eficiência operacional e lucratividade</small>
          </div>
          <div className="text-right">
            <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">25%</div>
            <div className="w-20 h-1 bg-[var(--border)] rounded-sm mt-1">
              <div className="h-full rounded-sm w-[25%] bg-[var(--gold)]"></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center py-2.5">
          <div className="text-[13px] text-[var(--txt2)]">
            PDI — Desenv. Individual (15%)
            <small className="block text-[11px] text-[var(--txt3)] mt-0.5">avaliação contextual pela coordenação</small>
          </div>
          <div className="text-right">
            <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">15%</div>
            <div className="w-20 h-1 bg-[var(--border)] rounded-sm mt-1">
              <div className="h-full rounded-sm w-[15%] bg-[var(--orange)]"></div>
            </div>
          </div>
        </div>

        <div className="mt-2.5 p-2.5 border-t border-[var(--border)] text-xs text-[var(--txt2)]">
          🔒 <strong className="text-[var(--txt)]">Prof. 360</strong> — corte comportamental ≥80. Não entra no cálculo do Health Score.
        </div>
      </div>
    </div>
  );
};
