import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { KpiDefinition } from '../types/database'

const DEFAULT_NEW_KPI: Omit<KpiDefinition, 'id'> = {
  ano_letivo_id: '',
  slug: '',
  nome: '',
  descricao: null,
  origem: 'lancamento',
  campo_origem: 'qtd_alunos',
  tipo_score: 'direto',
  min_ref: 0,
  max_ref: 100,
  peso: 0,
  entra_no_health_score: true,
  ativo: true,
  ordem: 999,
  criado_em: undefined,
  atualizado_em: undefined,
}

export function useKpiDefinitions(anoLetivoId?: string) {
  return useQuery({
    queryKey: ['kpi-definitions', anoLetivoId],
    enabled: Boolean(anoLetivoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_definitions')
        .select('*')
        .eq('ano_letivo_id', anoLetivoId)
        .order('ordem', { ascending: true })
        .order('criado_em', { ascending: true })

      if (error) throw error
      return (data ?? []) as KpiDefinition[]
    },
  })
}

interface SyncKpisInput {
  anoLetivoId: string
  payload: Array<
    Pick<
      KpiDefinition,
      'id' | 'ano_letivo_id' | 'peso' | 'entra_no_health_score' | 'ativo' | 'ordem' | 'tipo_score' | 'min_ref' | 'max_ref' | 'origem' | 'campo_origem' | 'nome' | 'slug'
    >
  >
}

export function useSyncKpisMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ payload }: SyncKpisInput) => {
      if (!payload.length) return

      const { error } = await supabase
        .from('kpi_definitions')
        .upsert(payload, { onConflict: 'id' })

      if (error) throw error
    },
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({ queryKey: ['kpi-definitions', vars.anoLetivoId] })
      await queryClient.invalidateQueries({ queryKey: ['health-scores'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      await queryClient.invalidateQueries({ queryKey: ['annual-data'] })
    },
  })
}

interface CreateKpiInput {
  anoLetivoId: string
  payload: Partial<Omit<KpiDefinition, 'id' | 'ano_letivo_id'>>
}

interface UpdateKpiInput {
  id: string
  payload: Partial<KpiDefinition>
}

export function useCreateKpiMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ anoLetivoId, payload }: CreateKpiInput) => {
      const nextPayload = {
        ...DEFAULT_NEW_KPI,
        ...payload,
        ano_letivo_id: anoLetivoId,
      }

      const { data, error } = await supabase
        .from('kpi_definitions')
        .insert(nextPayload)
        .select('*')
        .single()

      if (error) throw error
      return data as KpiDefinition
    },
    onSuccess: async (_created, vars) => {
      await queryClient.invalidateQueries({ queryKey: ['kpi-definitions', vars.anoLetivoId] })
      await queryClient.invalidateQueries({ queryKey: ['health-scores'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      await queryClient.invalidateQueries({ queryKey: ['annual-data'] })
    },
  })
}

export function useUpdateKpiMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateKpiInput) => {
      const { data, error } = await supabase
        .from('kpi_definitions')
        .update(payload)
        .eq('id', id)
        .select('id, ano_letivo_id')
        .single()

      if (error) throw error
      return data as { id: string; ano_letivo_id: string }
    },
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ['kpi-definitions', updated.ano_letivo_id] })
      await queryClient.invalidateQueries({ queryKey: ['health-scores'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      await queryClient.invalidateQueries({ queryKey: ['annual-data'] })
    },
  })
}

export function useDeleteKpiMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, anoLetivoId }: { id: string; anoLetivoId: string }) => {
      const { error } = await supabase
        .from('kpi_definitions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, anoLetivoId }
    },
    onSuccess: async ({ anoLetivoId }) => {
      await queryClient.invalidateQueries({ queryKey: ['kpi-definitions', anoLetivoId] })
      await queryClient.invalidateQueries({ queryKey: ['health-scores'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      await queryClient.invalidateQueries({ queryKey: ['annual-data'] })
    },
  })
}
