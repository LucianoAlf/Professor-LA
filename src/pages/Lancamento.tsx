import React, { useEffect, useState } from 'react';
import { useAppContext } from '../AppContext';
import { QUARTERS, UNITS } from '../constants';
import { MonthId, QuarterId } from '../types';
import { useConfigPesos } from '../hooks/useConfigPesos';
import { useLancamentos } from '../hooks/useLancamentos';
import { useSaveLancamentosMutation } from '../hooks/useMetricsMutations';
import { useProfessoresByUnidade } from '../hooks/useProfessoresByUnidade';
import { useTrimestreByCodigo, useUnidadeByCodigo } from '../hooks/useSelectionData';

interface LancamentoFormItem {
  professorUnidadeId: string;
  professorNome: string;
  alunosRenovacaoTotal: number;
  alunosRenovacaoOk: number;
  experimentaisTotal: number;
  experimentaisMatricula: number;
  totalTurmas: number;
  totalAlunosTurmas: number;
  notaProf360: number;
}

export const Lancamento: React.FC = () => {
  const { curUnit, curMonth, setCurMonth, curQ, anoLetivoId, cfg } = useAppContext();
  const [formRows, setFormRows] = useState<LancamentoFormItem[]>([]);
  const [saveText, setSaveText] = useState('💾 Salvar');

  const unidadeData = useUnidadeByCodigo(curUnit);
  const trimestreData = useTrimestreByCodigo(anoLetivoId, curQ);
  const professoresQuery = useProfessoresByUnidade(unidadeData.unidadeSelecionada?.id);
  const lancamentosQuery = useLancamentos(unidadeData.unidadeSelecionada?.id, anoLetivoId, curMonth);
  const configPesosQuery = useConfigPesos(anoLetivoId);
  const saveMutation = useSaveLancamentosMutation();

  useEffect(() => {
    if (!professoresQuery.data) return;

    const byProfessorUnidade = new Map((lancamentosQuery.data ?? []).map((item) => [item.professor_unidade_id, item]));

    setFormRows(
      professoresQuery.data.map((prof) => {
        const atual = byProfessorUnidade.get(prof.id);
        return {
          professorUnidadeId: prof.id,
          professorNome: prof.professor.nome,
          alunosRenovacaoTotal: atual?.alunos_renovacao_total ?? 0,
          alunosRenovacaoOk: atual?.alunos_renovacao_ok ?? 0,
          experimentaisTotal: atual?.experimentais_total ?? 0,
          experimentaisMatricula: atual?.experimentais_matricula ?? 0,
          totalTurmas: atual?.total_turmas ?? 0,
          totalAlunosTurmas: atual?.total_alunos_turmas ?? 0,
          notaProf360: atual?.nota_prof360 ?? 0,
        };
      })
    );
  }, [professoresQuery.data, lancamentosQuery.data]);

  const isConsolidado = curUnit === 'CONS';
  const uid = curUnit === 'CONS' ? 'CG' : curUnit;

  const handleSave = async () => {
    if (!anoLetivoId || !trimestreData.trimestreSelecionado?.id || !formRows.length) return;
    await saveMutation.mutateAsync({
      anoLetivoId,
      trimestreId: trimestreData.trimestreSelecionado.id,
      mes: curMonth,
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
      rows: formRows,
    });

    setSaveText('✅ Salvo!');
    setTimeout(() => setSaveText('💾 Salvar'), 1600);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: numValue } : row))
    );
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

      {isConsolidado && (
        <div className="rounded-xl border border-[var(--gold)]/30 bg-[rgba(200,151,58,0.10)] p-4 text-sm text-[var(--txt)] mb-4">
          No modo Consolidado, o lançamento mensal fica desabilitado. Selecione uma unidade específica (CG, RC ou BA).
        </div>
      )}

      {(professoresQuery.isLoading || lancamentosQuery.isLoading) && !isConsolidado && (
        <div className="space-y-2 mb-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 w-full rounded-xl bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      )}

      {(professoresQuery.isError || lancamentosQuery.isError || saveMutation.isError) && !isConsolidado && (
        <div className="rounded-xl border border-[var(--red)]/30 bg-[rgba(166,28,28,0.10)] p-4 text-sm text-[var(--txt)] mb-4">
          Erro ao carregar/salvar lançamentos no Supabase.
        </div>
      )}

      {!isConsolidado && !professoresQuery.isLoading && !lancamentosQuery.isLoading && (
      <div className="grid grid-cols-1 gap-3">
        {formRows.map((row, i) => (
          <div key={row.professorUnidadeId} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden mb-3">
            <div className="bg-[rgba(45,90,160,0.12)] px-4 py-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-[var(--txt)]">{row.professorNome}</h3>
              <span className="text-[11px] text-[var(--txt3)]">{curMonth} · {UNITS[uid].label} · {row.totalAlunosTurmas} alunos</span>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(5,1fr)_1.8fr] gap-2.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Renov. Total</label>
                <input type="number" min="0" value={row.alunosRenovacaoTotal} onChange={(e) => handleChange(i, 'alunosRenovacaoTotal', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Renov. OK</label>
                <input type="number" min="0" value={row.alunosRenovacaoOk} onChange={(e) => handleChange(i, 'alunosRenovacaoOk', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Experim. Total</label>
                <input type="number" min="0" value={row.experimentaisTotal} onChange={(e) => handleChange(i, 'experimentaisTotal', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Experim. Matric.</label>
                <input type="number" min="0" value={row.experimentaisMatricula} onChange={(e) => handleChange(i, 'experimentaisMatricula', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Qtd Turmas</label>
                <input type="number" min="0" value={row.totalTurmas} onChange={(e) => handleChange(i, 'totalTurmas', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[1px] uppercase text-[var(--txt3)] font-semibold">Nota 360 / Total Alunos</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="0" max="100" value={row.notaProf360} onChange={(e) => handleChange(i, 'notaProf360', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
                  <input type="number" min="0" value={row.totalAlunosTurmas} onChange={(e) => handleChange(i, 'totalAlunosTurmas', e.target.value)} className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[13px] font-mono text-[var(--input-color)] outline-none w-full transition-colors focus:border-[var(--gold)]" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="flex gap-2.5 mt-3.5 flex-wrap">
        <button onClick={handleSave} disabled={isConsolidado || saveMutation.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-[0.3px] cursor-pointer border-none transition-all duration-150 font-sans bg-[var(--gold)] text-[var(--ink)] hover:bg-[var(--goldD)] disabled:opacity-50 disabled:cursor-not-allowed">
          {saveText}
        </button>
        <button onClick={handleSave} disabled={isConsolidado || saveMutation.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-[0.3px] cursor-pointer transition-all duration-150 font-sans bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-color)] border border-[var(--btn-ghost-border)] hover:bg-[var(--btn-ghost-hover)] hover:text-[var(--txt)] disabled:opacity-50 disabled:cursor-not-allowed">
          🔄 Recalcular tudo
        </button>
      </div>
    </div>
  );
};
