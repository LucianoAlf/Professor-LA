import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { QUARTERS, UNITS } from '../constants';
import { QuarterId } from '../types';
import { useConfigPesos } from '../hooks/useConfigPesos';
import { useSavePdiMutation } from '../hooks/useMetricsMutations';
import { usePDI } from '../hooks/usePDI';
import { useProfessoresByUnidade } from '../hooks/useProfessoresByUnidade';
import { useTrimestreByCodigo, useUnidadeByCodigo } from '../hooks/useSelectionData';

interface PdiFormItem {
  professorUnidadeId: string;
  professorNome: string;
  notaPdi: number;
}

export const PDI: React.FC = () => {
  const { curUnit, curPDIQ, setCurPDIQ, anoLetivoId, cfg } = useAppContext();
  const uid = curUnit === 'CONS' ? 'CG' : curUnit;
  const [formRows, setFormRows] = useState<PdiFormItem[]>([]);
  const [saveText, setSaveText] = useState('💾 Salvar PDI');

  const unidadeData = useUnidadeByCodigo(curUnit);
  const trimestreData = useTrimestreByCodigo(anoLetivoId, curPDIQ);
  const professoresQuery = useProfessoresByUnidade(unidadeData.unidadeSelecionada?.id);
  const pdiQuery = usePDI(unidadeData.unidadeSelecionada?.id, trimestreData.trimestreSelecionado?.id);
  const configPesosQuery = useConfigPesos(anoLetivoId);
  const saveMutation = useSavePdiMutation();

  useEffect(() => {
    if (!professoresQuery.data) return;

    const pdiByProfessorUnidade = new Map((pdiQuery.data ?? []).map((item) => [item.professor_unidade_id, item]));

    setFormRows(
      professoresQuery.data.map((prof) => ({
        professorUnidadeId: prof.id,
        professorNome: prof.professor.nome,
        notaPdi: pdiByProfessorUnidade.get(prof.id)?.nota_pdi ?? 0,
      }))
    );
  }, [professoresQuery.data, pdiQuery.data]);

  const handleSave = async () => {
    if (!anoLetivoId || !trimestreData.trimestreSelecionado?.id || !formRows.length) return;

    await saveMutation.mutateAsync({
      trimestreId: trimestreData.trimestreSelecionado.id,
      anoLetivoId,
      configPesos: configPesosQuery.data ?? {
        id: 'cfg',
        ano_letivo_id: anoLetivoId,
        peso_retencao: cfg.weights.ret,
        peso_conversao: cfg.weights.conv,
        peso_media_turma: cfg.weights.media,
        peso_pdi: cfg.weights.pdi,
        benchmark_media_min: cfg.mediaMin,
        benchmark_media_max: cfg.mediaMax,
        corte_prof360: cfg.corte360,
      },
      rows: formRows.map((row) => ({
        professorUnidadeId: row.professorUnidadeId,
        notaPdi: row.notaPdi,
      })),
    });

    setSaveText('✅ PDI Salvo!');
    setTimeout(() => setSaveText('💾 Salvar PDI'), 1600);
  };

  const handleChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormRows((prev) => prev.map((row, i) => (i === index ? { ...row, notaPdi: numValue } : row)));
  };

  const isConsolidado = curUnit === 'CONS';

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

      {isConsolidado && (
        <div className="rounded-xl border border-[var(--gold)]/30 bg-[rgba(200,151,58,0.10)] p-4 text-sm text-[var(--txt)] mb-4">
          No modo Consolidado, o lançamento de PDI fica desabilitado. Selecione uma unidade específica (CG, RC ou BA).
        </div>
      )}

      {(professoresQuery.isLoading || pdiQuery.isLoading) && !isConsolidado && (
        <div className="space-y-2 mb-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-12 w-full rounded-lg bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      )}

      {(professoresQuery.isError || pdiQuery.isError || saveMutation.isError) && !isConsolidado && (
        <div className="rounded-xl border border-[var(--red)]/30 bg-[rgba(166,28,28,0.10)] p-4 text-sm text-[var(--txt)] mb-4">
          Erro ao carregar/salvar notas de PDI no Supabase.
        </div>
      )}

      <div className="bg-[var(--pdi-bg)] border border-[rgba(184,92,0,0.18)] rounded-xl p-4.5 mb-4">
        <h3 className="text-xs font-bold text-[var(--orange)] uppercase tracking-[1px] mb-1">
          🎯 Notas PDI — {curPDIQ} · {UNITS[uid].label} · 2026
        </h3>
        <p className="text-xs text-[var(--txt3)] mb-3.5 leading-[1.65]">
          Nota 0–100 por professor. Contextual — o Joel (violino, poucos alunos) é avaliado no seu próprio contexto, não comparado com professores de outros instrumentos ou demandas.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {formRows.map((row, i) => (
            <div key={row.professorUnidadeId} className="flex flex-col gap-1.5">
              <label className="text-[11px] text-[var(--txt2)] font-semibold">{row.professorNome}</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={row.notaPdi} 
                onChange={(e) => handleChange(i, e.target.value)}
                className="bg-[var(--pdi-bg)] border border-[var(--pdi-border)] rounded-lg p-2 text-[15px] font-mono text-[var(--orange)] outline-none w-full text-center font-bold focus:border-[var(--orange)]" 
              />
            </div>
          ))}
        </div>
        
        <div className="flex gap-2.5 mt-3.5 flex-wrap">
          <button onClick={handleSave} disabled={isConsolidado || saveMutation.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-[0.3px] cursor-pointer border-none transition-all duration-150 font-sans bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--goldD)] disabled:opacity-50 disabled:cursor-not-allowed">
            {saveText}
          </button>
        </div>
      </div>
    </div>
  );
};
