import React, { useEffect, useMemo, useState } from 'react';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { ToolChip } from '../components/ui/tool-chip';
import { Tooltip } from '../components/ui/tooltip';
import { parseFlexibleNumber } from '../lib/number';
import { useConfigPesos, useUpdateConfigPesosMutation } from '../hooks/useConfigPesos';
import {
  useCreateKpiMutation,
  useDeleteKpiMutation,
  useKpiDefinitions,
  useSyncKpisMutation,
  useUpdateKpiMutation,
} from '../hooks/useKpiDefinitions';
import { KpiDefinition, KpiOrigem, KpiTipoScore } from '../types/database';

interface ConfigFormState {
  benchmark_retencao: number;
  benchmark_conversao: number;
  nota_corte_360: number;
  media_turma_min: number;
  media_turma_max: number;
}

interface KpiFormState {
  nome: string;
  slug: string;
  origem: KpiOrigem;
  campo_origem: string;
  tipo_score: KpiTipoScore;
  min_ref: number;
  max_ref: number;
  peso: number;
  entra_no_health_score: boolean;
  ativo: boolean;
}

interface KpiEditableRow extends KpiDefinition {
  pesoUi: number;
}

const DEFAULT_FORM: ConfigFormState = {
  benchmark_retencao: 80,
  benchmark_conversao: 80,
  nota_corte_360: 80,
  media_turma_min: 1,
  media_turma_max: 2.5,
};

const DEFAULT_KPI_FORM: KpiFormState = {
  nome: '',
  slug: '',
  origem: 'lancamento',
  campo_origem: 'qtd_alunos',
  tipo_score: 'direto',
  min_ref: 0,
  max_ref: 100,
  peso: 0,
  entra_no_health_score: true,
  ativo: true,
};

const toUiPercent = (value?: number, fallback = 0) => {
  const raw = value ?? fallback;
  return raw <= 1 ? raw * 100 : raw;
};

const toDbWeight = (value: number) => value / 100;

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const KPI_SOURCE_FIELDS: Record<KpiOrigem, Array<{ value: string; label: string }>> = {
  lancamento: [
    { value: 'taxa_retencao', label: 'Taxa de retenção' },
    { value: 'taxa_conversao', label: 'Taxa de conversão' },
    { value: 'media_turma', label: 'Média de alunos/turma' },
    { value: 'qtd_alunos', label: 'Número de alunos' },
    { value: 'nota_prof360', label: 'Nota Prof. 360 (média mensal)' },
  ],
  pdi: [{ value: 'nota', label: 'Nota do PDI trimestral' }],
  calculado: [{ value: 'custom', label: 'Cálculo manual (future-proof)' }],
};

const KPI_ORIGEM_OPTIONS = [
  { value: 'lancamento', label: 'Lançamento mensal' },
  { value: 'pdi', label: 'PDI trimestral' },
  { value: 'calculado', label: 'Calculado' },
];

const KPI_TIPO_SCORE_OPTIONS = [
  { value: 'direto', label: 'Direto (0 a 100)' },
  { value: 'percentual', label: 'Percentual' },
  { value: 'faixa', label: 'Faixa (min/max)' },
];

export const Config: React.FC = () => {
  const { anoLetivoId } = useAppContext();
  const configQuery = useConfigPesos(anoLetivoId);
  const kpiQuery = useKpiDefinitions(anoLetivoId);
  const updateConfigMutation = useUpdateConfigPesosMutation();
  const syncKpisMutation = useSyncKpisMutation();
  const createKpiMutation = useCreateKpiMutation();
  const updateKpiMutation = useUpdateKpiMutation();
  const deleteKpiMutation = useDeleteKpiMutation();

  const [savedBadge, setSavedBadge] = useState(false);
  const [form, setForm] = useState<ConfigFormState>(DEFAULT_FORM);
  const [kpiRows, setKpiRows] = useState<KpiEditableRow[]>([]);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiEditableRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KpiEditableRow | null>(null);
  const [draggingKpiId, setDraggingKpiId] = useState<string | null>(null);
  const [dragOverKpiId, setDragOverKpiId] = useState<string | null>(null);
  const [kpiForm, setKpiForm] = useState<KpiFormState>(DEFAULT_KPI_FORM);

  useEffect(() => {
    if (!configQuery.data) return;

    setForm({
      benchmark_retencao: toUiPercent(configQuery.data.benchmark_retencao, 0.8),
      benchmark_conversao: toUiPercent(configQuery.data.benchmark_conversao, 0.8),
      nota_corte_360: configQuery.data.nota_corte_360 ?? 80,
      media_turma_min: configQuery.data.media_turma_min ?? 1,
      media_turma_max: configQuery.data.media_turma_max ?? 2.5,
    });
  }, [configQuery.data]);

  useEffect(() => {
    if (!kpiQuery.data) return;

    setKpiRows(
      kpiQuery.data
        .slice()
        .sort((a, b) => a.ordem - b.ordem)
        .map((kpi) => ({
          ...kpi,
          pesoUi: toUiPercent(kpi.peso, 0),
        }))
    );
  }, [kpiQuery.data]);

  const totalPesos = useMemo(
    () =>
      kpiRows
        .filter((item) => item.ativo && item.entra_no_health_score)
        .reduce((acc, item) => acc + item.pesoUi, 0),
    [kpiRows]
  );

  const pesosValidos = Math.abs(totalPesos - 100) < 0.0001;

  const isLoading = configQuery.isLoading || kpiQuery.isLoading;
  const isError =
    configQuery.isError ||
    kpiQuery.isError ||
    updateConfigMutation.isError ||
    syncKpisMutation.isError ||
    createKpiMutation.isError ||
    updateKpiMutation.isError ||
    deleteKpiMutation.isError;

  const isPendingMutation =
    updateConfigMutation.isPending ||
    syncKpisMutation.isPending ||
    createKpiMutation.isPending ||
    updateKpiMutation.isPending ||
    deleteKpiMutation.isPending;

  const canSave =
    !isLoading &&
    !isPendingMutation &&
    pesosValidos &&
    form.media_turma_max > form.media_turma_min &&
    Boolean(anoLetivoId);

  const helperMessage =
    form.media_turma_max <= form.media_turma_min
      ? 'media_turma_max deve ser maior que media_turma_min.'
      : !pesosValidos
      ? 'A soma dos pesos ativos que entram no Health Score precisa ser exatamente 100%.'
      : 'Configuração pronta para salvar.';

  const helperVariant =
    form.media_turma_max <= form.media_turma_min ? 'danger' : pesosValidos ? 'success' : 'warning';

  const totalVariant = pesosValidos ? 'success' : 'danger';

  const handleFormNumberChange = (field: keyof ConfigFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: parseFlexibleNumber(value, 0) }));
    setSavedBadge(false);
  };

  const handleKpiRowChange = (id: string, field: keyof KpiEditableRow, value: number | boolean) => {
    setKpiRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
    setSavedBadge(false);
  };

  const moveKpiByDrop = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setKpiRows((prev) => {
      const sourceIndex = prev.findIndex((item) => item.id === sourceId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);

      if (sourceIndex < 0 || targetIndex < 0) {
        return prev;
      }

      const next = prev.slice();
      const [item] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });

    setDraggingKpiId(null);
    setDragOverKpiId(null);
    setSavedBadge(false);
  };

  const openCreateKpiModal = () => {
    setEditingKpi(null);
    setKpiForm(DEFAULT_KPI_FORM);
    setIsKpiModalOpen(true);
  };

  const openEditKpiModal = (kpi: KpiEditableRow) => {
    setEditingKpi(kpi);
    setKpiForm({
      nome: kpi.nome,
      slug: kpi.slug,
      origem: kpi.origem,
      campo_origem: kpi.campo_origem ?? 'qtd_alunos',
      tipo_score: kpi.tipo_score,
      min_ref: kpi.min_ref ?? 0,
      max_ref: kpi.max_ref ?? 100,
      peso: toUiPercent(kpi.peso, 0),
      entra_no_health_score: kpi.entra_no_health_score,
      ativo: kpi.ativo,
    });
    setIsKpiModalOpen(true);
  };

  const closeKpiModal = () => {
    if (createKpiMutation.isPending || updateKpiMutation.isPending) return;
    setIsKpiModalOpen(false);
    setEditingKpi(null);
    setKpiForm(DEFAULT_KPI_FORM);
  };

  const handleSaveKpiModal = async () => {
    if (!anoLetivoId) return;

    const fallbackSlug = slugify(kpiForm.nome);
    if (!fallbackSlug) return;

    const existingSlugs = new Set(kpiRows.filter((row) => row.id !== editingKpi?.id).map((row) => row.slug));
    let safeSlug = slugify(kpiForm.slug || fallbackSlug);
    if (!safeSlug) safeSlug = fallbackSlug;
    if (existingSlugs.has(safeSlug)) {
      safeSlug = `${safeSlug}_${Date.now().toString().slice(-4)}`;
    }

    const payload = {
      nome: kpiForm.nome.trim(),
      slug: safeSlug,
      origem: kpiForm.origem,
      campo_origem: kpiForm.campo_origem,
      tipo_score: kpiForm.tipo_score,
      min_ref: kpiForm.tipo_score === 'faixa' ? kpiForm.min_ref : 0,
      max_ref: kpiForm.tipo_score === 'faixa' ? kpiForm.max_ref : 100,
      peso: toDbWeight(kpiForm.peso),
      entra_no_health_score: kpiForm.entra_no_health_score,
      ativo: kpiForm.ativo,
      ordem: editingKpi?.ordem ?? kpiRows.length * 10 + 10,
    };

    if (!payload.nome) return;

    if (editingKpi) {
      await updateKpiMutation.mutateAsync({
        id: editingKpi.id,
        payload,
      });
    } else {
      await createKpiMutation.mutateAsync({
        anoLetivoId,
        payload,
      });
    }

    closeKpiModal();
    setSavedBadge(false);
  };

  const handleConfirmDeleteKpi = async () => {
    if (!deleteTarget || !anoLetivoId) return;
    await deleteKpiMutation.mutateAsync({ id: deleteTarget.id, anoLetivoId });
    setDeleteTarget(null);
    setSavedBadge(false);
  };

  const handleSave = async () => {
    if (!canSave || !anoLetivoId) return;

    await Promise.all([
      updateConfigMutation.mutateAsync({
        anoLetivoId,
        payload: {
          benchmark_retencao: toDbWeight(form.benchmark_retencao),
          benchmark_conversao: toDbWeight(form.benchmark_conversao),
          nota_corte_360: Math.round(form.nota_corte_360),
          media_turma_min: form.media_turma_min,
          media_turma_max: form.media_turma_max,
        },
      }),
      syncKpisMutation.mutateAsync({
        anoLetivoId,
        payload: kpiRows.map((row, index) => ({
          id: row.id,
          nome: row.nome,
          slug: row.slug,
          origem: row.origem,
          campo_origem: row.campo_origem,
          tipo_score: row.tipo_score,
          min_ref: row.min_ref,
          max_ref: row.max_ref,
          entra_no_health_score: row.entra_no_health_score,
          ativo: row.ativo,
          ordem: (index + 1) * 10,
          peso: toDbWeight(row.pesoUi),
        })),
      }),
    ]);

    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1800);
  };

  if (isLoading) {
    return (
      <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 w-full rounded-xl bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
        <div className="rounded-xl border border-[var(--red)]/30 bg-[rgba(166,28,28,0.10)] p-4 text-sm text-[var(--txt)]">
          Erro ao carregar/salvar configurações do Supabase. Tente novamente.
        </div>
      </div>
    );
  }

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
          Gerencie KPIs, pesos e benchmarks para coordenadores sem depender de código hardcoded.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>⚖️ KPIs do Health Score</CardTitle>
              <Button type="button" variant="outline" onClick={openCreateKpiModal}>
                <Plus className="h-4 w-4" />
                Novo KPI
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {kpiRows.map((kpi) => (
                <div
                  key={kpi.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    draggingKpiId === kpi.id
                      ? 'border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_14%,transparent)] shadow-[0_20px_34px_rgba(0,0,0,0.35)] scale-[1.02] rotate-[0.6deg] -translate-y-0.5'
                      : dragOverKpiId === kpi.id
                      ? 'border-[var(--gold)]/80 bg-[color-mix(in_srgb,var(--gold)_9%,transparent)] translate-y-0.5'
                      : 'border-[var(--border)]'
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (draggingKpiId && draggingKpiId !== kpi.id) {
                      setDragOverKpiId(kpi.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverKpiId === kpi.id) {
                      setDragOverKpiId(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const sourceId = event.dataTransfer.getData('text/plain');
                    if (sourceId) {
                      moveKpiByDrop(sourceId, kpi.id);
                    }
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-[var(--txt)]">{kpi.nome}</div>
                      <div className="text-[11px] text-[var(--txt3)] mt-0.5">
                        slug: {kpi.slug} · origem: {kpi.origem} · campo: {kpi.campo_origem || '-'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Tooltip content="Arraste para reordenar">
                        <ToolChip
                          type="button"
                          active={draggingKpiId === kpi.id}
                          className="cursor-grab hover:cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData('text/plain', kpi.id);
                            event.dataTransfer.effectAllowed = 'move';
                            setDraggingKpiId(kpi.id);
                          }}
                          onDragEnd={() => {
                            setDraggingKpiId(null);
                            setDragOverKpiId(null);
                          }}
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </ToolChip>
                      </Tooltip>

                      <Tooltip content="Editar KPI">
                        <ToolChip type="button" onClick={() => openEditKpiModal(kpi)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </ToolChip>
                      </Tooltip>

                      <Tooltip content="Excluir KPI">
                        <ToolChip
                          type="button"
                          danger
                          onClick={() => setDeleteTarget(kpi)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ToolChip>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-2 items-end">
                    <div>
                      <label className="text-[11px] text-[var(--txt3)]">Peso (%)</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={kpi.pesoUi}
                        onChange={(event) => handleKpiRowChange(kpi.id, 'pesoUi', parseFlexibleNumber(event.target.value, 0))}
                        className="text-right"
                      />
                    </div>

                    <Checkbox
                      checked={kpi.entra_no_health_score}
                      onCheckedChange={(checked) => handleKpiRowChange(kpi.id, 'entra_no_health_score', checked)}
                      label="Considerar no Health Score (soma na nota final)"
                    />

                    <Checkbox
                      checked={kpi.ativo}
                      onCheckedChange={(checked) => handleKpiRowChange(kpi.id, 'ativo', checked)}
                      label="KPI ativo (habilita cálculo)"
                    />
                  </div>
                </div>
              ))}

              {!kpiRows.length && (
                <div className="text-xs text-[var(--txt3)] rounded-lg border border-[var(--border)] p-3">
                  Nenhum KPI cadastrado para este ano letivo. Clique em <strong>Novo KPI</strong> para criar.
                </div>
              )}

              {!!kpiRows.length && <p className="text-[11px] text-[var(--txt3)]">Use o ícone de arrastar para reordenar os KPIs.</p>}
            </div>

            <div className="bg-[rgba(200,151,58,0.07)] border border-[rgba(200,151,58,0.15)] rounded-lg px-3.5 py-3 flex justify-between items-center mt-3">
              <span className="text-xs font-bold text-[rgba(255,255,255,0.45)] tracking-[1px] uppercase">
                Total dos pesos ativos
              </span>
              <Badge variant={totalVariant} className="font-mono">
                {totalPesos.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📏 Benchmarks e Escala</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
              <div className="text-[13px] text-[var(--txt2)]">
                Benchmark Retenção (visual)
                <small className="block text-[11px] text-[var(--txt3)] mt-0.5">não entra no Health Score</small>
              </div>
              <Input
                type="number"
                step={0.1}
                min={0}
                max={100}
                value={form.benchmark_retencao}
                onChange={(event) => handleFormNumberChange('benchmark_retencao', event.target.value)}
                className="w-[110px] text-right"
              />
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
              <div className="text-[13px] text-[var(--txt2)]">
                Benchmark Conversão (visual)
                <small className="block text-[11px] text-[var(--txt3)] mt-0.5">não entra no Health Score</small>
              </div>
              <Input
                type="number"
                step={0.1}
                min={0}
                max={100}
                value={form.benchmark_conversao}
                onChange={(event) => handleFormNumberChange('benchmark_conversao', event.target.value)}
                className="w-[110px] text-right"
              />
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
              <div className="text-[13px] text-[var(--txt2)]">
                Mínimo Média/Turma
                <small className="block text-[11px] text-[var(--txt3)] mt-0.5">valor que gera 0 pontos</small>
              </div>
              <Input
                type="number"
                step={0.1}
                min={0}
                value={form.media_turma_min}
                onChange={(event) => handleFormNumberChange('media_turma_min', event.target.value)}
                className="w-[110px] text-right"
              />
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
              <div className="text-[13px] text-[var(--txt2)]">
                Máximo Média/Turma
                <small className="block text-[11px] text-[var(--txt3)] mt-0.5">valor que gera 100 pontos</small>
              </div>
              <Input
                type="number"
                step={0.1}
                min={0}
                value={form.media_turma_max}
                onChange={(event) => handleFormNumberChange('media_turma_max', event.target.value)}
                className="w-[110px] text-right"
              />
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-[var(--border)]">
              <div className="text-[13px] text-[var(--txt2)]">
                Nota mínima Prof. 360
                <small className="block text-[11px] text-[var(--txt3)] mt-0.5">corte comportamental (não entra no HS)</small>
              </div>
              <Input
                type="number"
                step={1}
                min={0}
                max={100}
                value={form.nota_corte_360}
                onChange={(event) => handleFormNumberChange('nota_corte_360', event.target.value)}
                className="w-[110px] text-right"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant={helperVariant}>{helperMessage}</Badge>
              {savedBadge && <Badge variant="success">Salvo ✓</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 flex gap-2.5 flex-wrap">
        <Button onClick={handleSave} disabled={!canSave}>
          {isPendingMutation ? 'Salvando...' : 'Salvar configurações'}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setForm(DEFAULT_FORM);
            setSavedBadge(false);
          }}
          disabled={isPendingMutation}
        >
          Restaurar padrão
        </Button>
      </div>

      {isKpiModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 shadow-2xl">
            <h3 className="text-base font-semibold text-[var(--txt)]">
              {editingKpi ? 'Editar KPI' : 'Novo KPI'}
            </h3>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="md:col-span-2">
                <label className="text-xs text-[var(--txt3)]">Nome do KPI</label>
                <Input
                  value={kpiForm.nome}
                  onChange={(event) => {
                    const name = event.target.value;
                    setKpiForm((prev) => ({
                      ...prev,
                      nome: name,
                      slug: prev.slug || slugify(name),
                    }));
                  }}
                  placeholder="Ex.: Número de alunos"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--txt3)]">Slug técnico</label>
                <Input
                  value={kpiForm.slug}
                  onChange={(event) => setKpiForm((prev) => ({ ...prev, slug: slugify(event.target.value) }))}
                  placeholder="numero_alunos"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--txt3)]">Peso (%)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={kpiForm.peso}
                  onChange={(event) =>
                    setKpiForm((prev) => ({
                      ...prev,
                      peso: parseFlexibleNumber(event.target.value, 0),
                    }))
                  }
                />
              </div>

              <div>
                <label className="text-xs text-[var(--txt3)]">Origem</label>
                <Select
                  value={kpiForm.origem}
                  options={KPI_ORIGEM_OPTIONS}
                  onValueChange={(value) => {
                    const origem = value as KpiOrigem;
                    setKpiForm((prev) => ({
                      ...prev,
                      origem,
                      campo_origem: KPI_SOURCE_FIELDS[origem][0]?.value ?? '',
                    }));
                  }}
                />
              </div>

              <div>
                <label className="text-xs text-[var(--txt3)]">Campo de origem</label>
                <Select
                  value={kpiForm.campo_origem}
                  options={KPI_SOURCE_FIELDS[kpiForm.origem].map((field) => ({ value: field.value, label: field.label }))}
                  onValueChange={(value) => setKpiForm((prev) => ({ ...prev, campo_origem: value }))}
                />
              </div>

              <div>
                <label className="text-xs text-[var(--txt3)]">Tipo de score</label>
                <Select
                  value={kpiForm.tipo_score}
                  options={KPI_TIPO_SCORE_OPTIONS}
                  onValueChange={(value) => setKpiForm((prev) => ({ ...prev, tipo_score: value as KpiTipoScore }))}
                />
              </div>

              {kpiForm.tipo_score === 'faixa' && (
                <>
                  <div>
                    <label className="text-xs text-[var(--txt3)]">Mínimo (0 pontos)</label>
                    <Input
                      type="number"
                      step={0.1}
                      value={kpiForm.min_ref}
                      onChange={(event) =>
                        setKpiForm((prev) => ({
                          ...prev,
                          min_ref: parseFlexibleNumber(event.target.value, 0),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[var(--txt3)]">Máximo (100 pontos)</label>
                    <Input
                      type="number"
                      step={0.1}
                      value={kpiForm.max_ref}
                      onChange={(event) =>
                        setKpiForm((prev) => ({
                          ...prev,
                          max_ref: parseFlexibleNumber(event.target.value, 0),
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <Checkbox
                checked={kpiForm.entra_no_health_score}
                onCheckedChange={(checked) => setKpiForm((prev) => ({ ...prev, entra_no_health_score: checked }))}
                label="Considerar no Health Score (soma na nota final)"
              />

              <Checkbox
                checked={kpiForm.ativo}
                onCheckedChange={(checked) => setKpiForm((prev) => ({ ...prev, ativo: checked }))}
                label="KPI ativo (habilita cálculo)"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeKpiModal} disabled={isPendingMutation}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSaveKpiModal} disabled={isPendingMutation || !kpiForm.nome.trim()}>
                {editingKpi ? 'Atualizar KPI' : 'Criar KPI'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 shadow-2xl">
            <h3 className="text-base font-semibold text-[var(--txt)]">Excluir KPI</h3>
            <p className="mt-1 text-xs text-[var(--txt3)]">
              Tem certeza que deseja excluir o KPI <strong>{deleteTarget.nome}</strong>? Essa ação remove a configuração dele para este ano letivo.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteKpiMutation.isPending}>
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-[var(--red)] text-white hover:bg-[color-mix(in_srgb,var(--red)_85%,black)]"
                onClick={handleConfirmDeleteKpi}
                disabled={deleteKpiMutation.isPending}
              >
                {deleteKpiMutation.isPending ? 'Excluindo...' : 'Excluir KPI'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
