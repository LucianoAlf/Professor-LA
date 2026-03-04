import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { QUARTERS, UNITS, UNIT_PROFESSORS } from '../constants';
import { QuarterId } from '../types';

export const PDI: React.FC = () => {
  const { curUnit, curPDIQ, setCurPDIQ, pdiData, setPdiData } = useAppContext();
  const uid = curUnit === 'CONS' ? 'CG' : curUnit;
  const profs = UNIT_PROFESSORS[uid];
  const [saveText, setSaveText] = useState('💾 Salvar PDI');

  const handleSave = () => {
    setSaveText('✅ PDI Salvo!');
    setTimeout(() => setSaveText('💾 Salvar PDI'), 1600);
  };

  const handleChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPdiData(prev => {
      const newPdi = { ...prev };
      newPdi[uid][curPDIQ] = [...newPdi[uid][curPDIQ]];
      newPdi[uid][curPDIQ][index] = numValue;
      return newPdi;
    });
  };

  return (
    <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          PDI — Programa de Desenvolvimento Individual
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          PDI <em className="text-[var(--gold)] not-italic">{curPDIQ}</em>
        </div>
        <div className="text-xs text-[var(--txt3)] mt-1.5">
          Lançado uma vez por trimestre pela Comissão Pedagógica.
        </div>
      </div>

      <div className="flex gap-1.5 mb-4.5">
        {(Object.keys(QUARTERS) as QuarterId[]).map(q => (
          <button
            key={q}
            onClick={() => setCurPDIQ(q)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer border transition-all duration-150 ${curPDIQ === q ? 'bg-[rgba(200,151,58,0.12)] border-[rgba(200,151,58,0.35)] text-[var(--gold)]' : 'border-[var(--border)] text-[var(--txt3)] bg-transparent hover:border-[rgba(200,151,58,0.4)] hover:text-[var(--txt2)]'}`}
          >
            {q} — {QUARTERS[q].names[0].slice(0,3)}/{QUARTERS[q].names[1].slice(0,3)}/{QUARTERS[q].names[2].slice(0,3)}
          </button>
        ))}
      </div>

      <div className="bg-[var(--pdi-bg)] border border-[rgba(184,92,0,0.18)] rounded-xl p-4.5 mb-4">
        <h3 className="text-xs font-bold text-[var(--orange)] uppercase tracking-[1px] mb-1">
          🎯 Notas PDI — {curPDIQ} · {UNITS[uid].label} · 2026
        </h3>
        <p className="text-xs text-[var(--txt3)] mb-3.5 leading-[1.65]">
          Nota 0–100 por professor. Contextual — o Joel (violino, poucos alunos) é avaliado no seu próprio contexto, não comparado com professores de outros instrumentos ou demandas.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {profs.map((name, i) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-[11px] text-[var(--txt2)] font-semibold">{name}</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={pdiData[uid][curPDIQ][i]} 
                onChange={(e) => handleChange(i, e.target.value)}
                className="bg-[var(--pdi-bg)] border border-[var(--pdi-border)] rounded-lg p-2 text-[15px] font-mono text-[var(--orange)] outline-none w-full text-center font-bold focus:border-[var(--orange)]" 
              />
            </div>
          ))}
        </div>
        
        <div className="flex gap-2.5 mt-3.5 flex-wrap">
          <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-[0.3px] cursor-pointer border-none transition-all duration-150 font-sans bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--goldD)]">
            {saveText}
          </button>
        </div>
      </div>
    </div>
  );
};
