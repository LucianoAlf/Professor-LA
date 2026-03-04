import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { QUARTERS, UNITS, UNIT_PROFESSORS } from '../constants';
import { MonthId, QuarterId } from '../types';

export const Lancamento: React.FC = () => {
  const { curUnit, curMonth, setCurMonth, monthly, setMonthly } = useAppContext();
  const uid = curUnit === 'CONS' ? 'CG' : curUnit;
  const profs = UNIT_PROFESSORS[uid];
  const data = monthly[uid][curMonth];
  const [saveText, setSaveText] = useState('💾 Salvar');

  const handleSave = () => {
    setSaveText('✅ Salvo!');
    setTimeout(() => setSaveText('💾 Salvar'), 1600);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMonthly(prev => {
      const newMonthly = { ...prev };
      newMonthly[uid][curMonth] = [...newMonthly[uid][curMonth]];
      newMonthly[uid][curMonth][index] = {
        ...newMonthly[uid][curMonth][index],
        [field]: numValue
      };
      return newMonthly;
    });
  };

  return (
    <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          Operação
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          Lançamento <em className="text-[var(--gold)] not-italic">Mensal</em>
        </div>
        <div className="text-xs text-[var(--txt3)] mt-1.5">
          Selecione o mês e preencha os dados de cada professor.
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap items-center">
        {(Object.keys(QUARTERS) as QuarterId[]).map(qc => (
          <React.Fragment key={qc}>
            <span className="text-[9px] tracking-[1px] uppercase text-[rgba(200,151,58,0.55)] px-1 font-bold">{qc}</span>
            {QUARTERS[qc].months.map((m, i) => (
              <button
                key={m}
                onClick={() => setCurMonth(m)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all duration-150 ${curMonth === m ? 'bg-[rgba(45,90,160,0.12)] border-[rgba(45,90,160,0.3)] text-[var(--ink3)] light:text-[#7EB9FF]' : 'border-[var(--border)] text-[var(--txt3)] bg-transparent hover:border-[rgba(45,90,160,0.4)] hover:text-[var(--txt2)]'}`}
              >
                {QUARTERS[qc].names[i]}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {profs.map((name, i) => (
          <div key={name} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-3">
            <div className="bg-[rgba(45,90,160,0.12)] px-4 py-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-[var(--txt)]">{name}</h3>
              <span className="text-[11px] text-[var(--txt3)]">{curMonth} · {UNITS[uid].label} · {data[i].alunos} alunos</span>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(5,1fr)_1.8fr] gap-2.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Retenção %</label>
                <input type="number" step=".01" min="0" max="1" value={data[i].ret} onChange={(e) => handleChange(i, 'ret', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Conversão %</label>
                <input type="number" step=".01" min="0" max="1" value={data[i].conv} onChange={(e) => handleChange(i, 'conv', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Média/Turma</label>
                <input type="number" step=".1" min="0" value={data[i].media} onChange={(e) => handleChange(i, 'media', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Nota 360</label>
                <input type="number" min="0" max="100" value={data[i].nota360} onChange={(e) => handleChange(i, 'nota360', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Qtd Alunos</label>
                <input type="number" min="0" value={data[i].alunos} onChange={(e) => handleChange(i, 'alunos', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Observações</label>
                <input type="text" placeholder="opcional..." className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-sans text-[var(--txt3)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 mt-3.5 flex-wrap">
        <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-[0.3px] cursor-pointer border-none transition-all duration-150 font-sans bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--goldD)]">
          {saveText}
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-[0.3px] cursor-pointer transition-all duration-150 font-sans bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-color)] border border-[var(--btn-ghost-border)] hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--txt)]">
          🔄 Recalcular tudo
        </button>
      </div>
    </div>
  );
};
