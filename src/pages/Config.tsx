import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../AppContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useConfigPesos, useUpdateConfigPesosMutation } from '../hooks/useConfigPesos';

interface ConfigFormState {
  peso_retencao: number;
  peso_conversao: number;
  peso_media_turma: number;
  peso_pdi: number;
  peso_extra: number;
  benchmark_retencao: number;
  benchmark_conversao: number;
  nota_corte_360: number;
  media_turma_min: number;
  media_turma_max: number;
}

const DEFAULT_FORM: ConfigFormState = {
  peso_retencao: 35,
  peso_conversao: 25,
  peso_media_turma: 25,
  peso_pdi: 15,
  peso_extra: 0,
  benchmark_retencao: 80,
  benchmark_conversao: 80,
  nota_corte_360: 80,
  media_turma_min: 1,
  media_turma_max: 2.5,
};

const toUiPercent = (value?: number, fallback = 0) => {
  const raw = value ?? fallback;
  return raw <= 1 ? raw * 100 : raw;
};

const toDbWeight = (value: number) => value / 100;

export const Config: React.FC = () => {
  const { anoLetivoId } = useAppContext();
  const configQuery = useConfigPesos(anoLetivoId);
  const updateConfigMutation = useUpdateConfigPesosMutation();
  const [savedBadge, setSavedBadge] = useState(false);
  const [form, setForm] = useState<ConfigFormState>(DEFAULT_FORM);

  useEffect(() => {
    if (!configQuery.data) return;

    setForm({
      peso_retencao: toUiPercent(configQuery.data.peso_retencao, 0.35),
      peso_conversao: toUiPercent(configQuery.data.peso_conversao, 0.25),
      peso_media_turma: toUiPercent(configQuery.data.peso_media_turma, 0.25),
      peso_pdi: toUiPercent(configQuery.data.peso_pdi, 0.15),
      peso_extra: toUiPercent(configQuery.data.peso_extra, 0),
      benchmark_retencao: toUiPercent(configQuery.data.benchmark_retencao, 0.8),
      benchmark_conversao: toUiPercent(configQuery.data.benchmark_conversao, 0.8),
      nota_corte_360: configQuery.data.nota_corte_360 ?? 80,
      media_turma_min: configQuery.data.media_turma_min ?? 1,
      media_turma_max: configQuery.data.media_turma_max ?? 2.5,
    });
  }, [configQuery.data]);

  const totalPesos = useMemo(
    () =>
      form.peso_retencao +
      form.peso_conversao +
      form.peso_media_turma +
      form.peso_pdi +
      form.peso_extra,
    [form]
  );

  const pesosValidos = Math.abs(totalPesos - 100) < 0.0001;

  const handleNumberChange = (field: keyof ConfigFormState, value: string) => {
    const parsed = Number(value);
    setForm((prev) => ({ ...prev, [field]: Number.isFinite(parsed) ? parsed : 0 }));
    setSavedBadge(false);
  };

  const handleSave = async () => {
    if (!configQuery.data?.id || !pesosValidos) return;

    await updateConfigMutation.mutateAsync({
      id: configQuery.data.id,
      payload: {
        peso_retencao: toDbWeight(form.peso_retencao),
        peso_conversao: toDbWeight(form.peso_conversao),
        peso_media_turma: toDbWeight(form.peso_media_turma),
        peso_pdi: toDbWeight(form.peso_pdi),
        peso_extra: toDbWeight(form.peso_extra),
        benchmark_retencao: toDbWeight(form.benchmark_retencao),
        benchmark_conversao: toDbWeight(form.benchmark_conversao),
        nota_corte_360: Math.round(form.nota_corte_360),
        media_turma_min: form.media_turma_min,
        media_turma_max: form.media_turma_max,
      },
    });

    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1800);
  };

  const items = [
    { key: 'peso_retencao', label: 'Taxa de Retenção', color: 'var(--green)' },
    { key: 'peso_conversao', label: 'Taxa de Conversão', color: 'var(--ink3)' },
    { key: 'peso_media_turma', label: 'Média Alunos/Turma', color: 'var(--gold)' },
    { key: 'peso_pdi', label: 'PDI — Desenv. Individual', color: 'var(--orange)' },
    { key: 'peso_extra', label: 'Peso Extra (KPI futuro)', color: '#8AA5C9' },
  ] as const;

  const isLoading = configQuery.isLoading;
  const isError = configQuery.isError || updateConfigMutation.isError;

  const canSave =
    !isLoading &&
    !updateConfigMutation.isPending &&
    pesosValidos &&
    form.media_turma_max > form.media_turma_min;

  const totalVariant = pesosValidos ? 'success' : 'danger';

  const helperMessage =
    form.media_turma_max <= form.media_turma_min
      ? 'media_turma_max deve ser maior que media_turma_min.'
      : !pesosValidos
      ? 'A soma dos pesos precisa ser exatamente 100% para salvar.'
      : 'Configuração pronta para salvar.';

  const helperVariant =
    form.media_turma_max <= form.media_turma_min ? 'danger' : pesosValidos ? 'success' : 'warning';

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
          Parâmetros do Health Score. Altere aqui e todos os cálculos atualizam automaticamente.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>⚖️ Pesos do Health Score</CardTitle>
          </CardHeader>
          <CardContent>
          
          {items.map((it, i) => (
            <div key={i} className={`flex justify-between items-center py-2.5 ${i < items.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
              <div className="text-[13px] text-[var(--txt2)]">{it.label}</div>
              <div className="text-right">
                <div className="font-mono text-[13px] font-semibold text-[var(--gold)] mb-1">
                  {form[it.key].toFixed(1)}%
                </div>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={form[it.key]}
                  onChange={(event) => handleNumberChange(it.key, event.target.value)}
                  className="w-[108px] text-right"
                />
                <div className="w-20 h-1 bg-[var(--border)] rounded-sm mt-1">
                  <div className="h-full rounded-sm" style={{ width: `${Math.max(0, Math.min(100, form[it.key]))}%`, background: it.color }}></div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-[rgba(200,151,58,0.07)] border border-[rgba(200,151,58,0.15)] rounded-lg px-3.5 py-3 flex justify-between items-center mt-3">
            <span className="text-xs font-bold text-[rgba(255,255,255,0.45)] tracking-[1px] uppercase">Total dos pesos</span>
            <Badge variant={totalVariant} className="font-mono">{totalPesos.toFixed(1)}%</Badge>
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
              onChange={(event) => handleNumberChange('benchmark_retencao', event.target.value)}
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
              onChange={(event) => handleNumberChange('benchmark_conversao', event.target.value)}
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
              onChange={(event) => handleNumberChange('media_turma_min', event.target.value)}
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
              onChange={(event) => handleNumberChange('media_turma_max', event.target.value)}
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
              onChange={(event) => handleNumberChange('nota_corte_360', event.target.value)}
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
          {updateConfigMutation.isPending ? 'Salvando...' : '💾 Salvar configurações'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setForm(DEFAULT_FORM)}
          disabled={updateConfigMutation.isPending}
        >
          Restaurar padrão
        </Button>
      </div>
    </div>
  );
};
