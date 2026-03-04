import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { ConfigPesos } from '../types/database'

const DEFAULT_PESOS: ConfigPesos = {
  id: 'default',
  ano_letivo_id: '',
  peso_retencao: 0.35,
  peso_conversao: 0.25,
  peso_media_turma: 0.25,
  peso_pdi: 0.15,
  benchmark_media_min: 1,
  benchmark_media_max: 2.5,
  corte_prof360: 80,
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
      return (data as ConfigPesos | null) ?? { ...DEFAULT_PESOS, ano_letivo_id: anoLetivoId ?? '' }
    },
  })
}
