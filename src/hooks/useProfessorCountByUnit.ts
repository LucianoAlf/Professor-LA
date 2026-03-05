import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UnitId } from '../types'
import { supabase } from '../lib/supabase'
import { useUnidades } from './useUnidades'

const CONSOLIDADO_UNITS = ['CG', 'RC', 'BA']

export function useProfessorCountByUnit(curUnit: UnitId) {
  const unidades = useUnidades()

  const unidadeIds = useMemo(() => {
    const codigos = curUnit === 'CONS' ? CONSOLIDADO_UNITS : [curUnit]
    return (unidades.data ?? []).filter((item) => codigos.includes(item.codigo)).map((item) => item.id)
  }, [curUnit, unidades.data])

  return useQuery({
    queryKey: ['professor-count-by-unit', curUnit, unidadeIds.join(',')],
    enabled: unidadeIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_unidade')
        .select('professor_id, ativo, professores:professor_id(id, ativo)')
        .in('unidade_id', unidadeIds)
        .eq('ativo', true)

      if (error) throw error

      const unique = new Set<string>()

      for (const item of data ?? []) {
        const professorRaw = (item as any).professores
        const professor = Array.isArray(professorRaw) ? professorRaw[0] : professorRaw

        if (professor?.id && professor?.ativo !== false) {
          unique.add(professor.id)
        }
      }

      return unique.size
    },
  })
}
