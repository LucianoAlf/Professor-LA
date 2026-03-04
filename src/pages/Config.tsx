import React from 'react';
import { useAppContext } from '../AppContext';

export const Config: React.FC = () => {
  const { cfg } = useAppContext();

  const items = [
    { label: 'Taxa de Retenção', pct: cfg.weights.ret * 100, color: 'var(--green)' },
    { label: 'Taxa de Conversão', pct: cfg.weights.conv * 100, color: 'var(--ink3)' },
    { label: 'Média Alunos/Turma', pct: cfg.weights.media * 100, color: 'var(--gold)' },
    { label: 'PDI — Desenv. Individual', pct: cfg.weights.pdi * 100, color: 'var(--orange)' },
  ];

  return (
    <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          Sistema
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          ⚙️ <em className="text-[var(--gold)] not-italic">Configurações</em>
        </div>
        <div className="text-xs text-[var(--txt3)] mt-1.5">
          Parâmetros do Health Score. Altere aqui e todos os cálculos atualizam automaticamente.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">
            ⚖️ Pesos do Health Score
          </div>
          
          {items.map((it, i) => (
            <div key={i} className={`flex justify-between items-center py-2.5 ${i < items.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
              <div className="text-[13px] text-[var(--txt2)]">{it.label}</div>
              <div className="text-right">
                <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">{it.pct}%</div>
                <div className="w-20 h-1 bg-[var(--border)] rounded-sm mt-1">
                  <div className="h-full rounded-sm" style={{ width: `${it.pct}%`, background: it.color }}></div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-[rgba(200,151,58,0.07)] border border-[rgba(200,151,58,0.15)] rounded-lg px-3.5 py-3 flex justify-between items-center mt-3">
            <span className="text-xs font-bold text-[rgba(255,255,255,0.45)] tracking-[1px] uppercase">Total dos pesos</span>
            <span className="font-mono text-[15px] font-bold text-[var(--gold)]">100%</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5">
            📏 Benchmarks e Escala
          </div>
          
          <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
            <div className="text-[13px] text-[var(--txt2)]">
              Benchmark Retenção
              <small className="block text-[11px] text-[var(--txt3)] mt-0.5">referência de desempenho esperado</small>
            </div>
            <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">80%</div>
          </div>
          
          <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
            <div className="text-[13px] text-[var(--txt2)]">
              Benchmark Conversão
              <small className="block text-[11px] text-[var(--txt3)] mt-0.5">referência de desempenho esperado</small>
            </div>
            <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">80%</div>
          </div>
          
          <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
            <div className="text-[13px] text-[var(--txt2)]">
              Mínimo Média/Turma
              <small className="block text-[11px] text-[var(--txt3)] mt-0.5">valor que gera 0 pontos</small>
            </div>
            <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">{cfg.mediaMin.toFixed(1)}</div>
          </div>
          
          <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
            <div className="text-[13px] text-[var(--txt2)]">
              Máximo Média/Turma
              <small className="block text-[11px] text-[var(--txt3)] mt-0.5">valor que gera 100 pontos</small>
            </div>
            <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">{cfg.mediaMax.toFixed(1)}</div>
          </div>

          <div className="text-[11px] font-bold text-[var(--txt3)] tracking-[1.5px] uppercase mb-3.5 mt-4.5">
            ✂️ Prof. 360 — Corte
          </div>
          
          <div className="flex justify-between items-center py-2.5">
            <div className="text-[13px] text-[var(--txt2)]">
              Nota mínima Prof. 360
              <small className="block text-[11px] text-[var(--txt3)] mt-0.5">abaixo = ❌ Inapto</small>
            </div>
            <div className="font-mono text-[13px] font-semibold text-[var(--gold)]">{cfg.corte360} pts</div>
          </div>
        </div>
      </div>
    </div>
  );
};
