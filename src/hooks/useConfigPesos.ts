import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { ConfigPesos } from '../types/database'

const DEFAULT_PESOS: ConfigPesos = {
  id: 'default',
  ano_letivo_id: '',
  peso_retencao: 0.35,
  peso_conversao: 0.25,
  peso_media_turma: 0.25,
  peso_pdi: 0.15,
  peso_extra: 0,
  media_turma_min: 1,
  media_turma_max: 2.5,
  nota_corte_360: 80,
  benchmark_retencao: 0.8,
  benchmark_conversao: 0.8,
  benchmark_media_min: 1,
  benchmark_media_max: 2.5,
  corte_prof360: 80,
}

function normalizeConfigPesos(config: ConfigPesos): ConfigPesos {
  const mediaMin = config.media_turma_min ?? config.benchmark_media_min ?? DEFAULT_PESOS.media_turma_min ?? 1
  const mediaMax = config.media_turma_max ?? config.benchmark_media_max ?? DEFAULT_PESOS.media_turma_max ?? 2.5
  const notaCorte = config.nota_corte_360 ?? config.corte_prof360 ?? DEFAULT_PESOS.nota_corte_360 ?? 80

  return {
    ...DEFAULT_PESOS,
    ...config,
    media_turma_min: mediaMin,
    media_turma_max: mediaMax,
    nota_corte_360: notaCorte,
    benchmark_media_min: mediaMin,
    benchmark_media_max: mediaMax,
    corte_prof360: notaCorte,
  }
}

export function useConfigPesos(anoLetivoId?: string) {
  return useQuery({
    queryKey: ['config-pesos', anoLetivoId],
    enabled: Boolean(anoLetivoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('config_pesos')
        .select('*')
        .eq('ano_letivo_id', anoLetivoId)
        .maybeSingle()

      if (error) throw error
      const config = (data as ConfigPesos | null) ?? { ...DEFAULT_PESOS, ano_letivo_id: anoLetivoId ?? '' }
      return normalizeConfigPesos(config)
    },
  })
}

interface UpdateConfigPesosInput {
  anoLetivoId: string
  payload: Partial<ConfigPesos>
}

export function useUpdateConfigPesosMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ anoLetivoId, payload }: UpdateConfigPesosInput) => {
      const { error } = await supabase
        .from('config_pesos')
        .upsert(
          {
            ano_letivo_id: anoLetivoId,
            ...payload,
          },
          { onConflict: 'ano_letivo_id' }
        )

      if (error) throw error
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['config-pesos'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      await queryClient.invalidateQueries({ queryKey: ['annual-data'] })
      await queryClient.invalidateQueries({ queryKey: ['health-scores'] })
    },
  })
}
