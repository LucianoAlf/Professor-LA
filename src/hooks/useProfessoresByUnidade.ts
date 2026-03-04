import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Professor, ProfessorUnidade } from '../types/database'

export interface ProfessorUnidadeDetalhado extends ProfessorUnidade {
  professor: Professor
}

export function useProfessoresByUnidade(unidadeId?: string) {
  return useQuery({
    queryKey: ['professores-by-unidade', unidadeId],
    enabled: Boolean(unidadeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_unidade')
        .select('id, professor_id, unidade_id, ativo, professores:professor_id(id, nome, ativo)')
        .eq('unidade_id', unidadeId)
        .eq('ativo', true)

      if (error) throw error

      return (data ?? []).map((item: any) => ({
        id: item.id,
        professor_id: item.professor_id,
        unidade_id: item.unidade_id,
        ativo: item.ativo,
        professor: item.professores,
      })) as ProfessorUnidadeDetalhado[]
    },
  })
}
