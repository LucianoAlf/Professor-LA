import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Unidade } from '../types/database'

export function useUnidades() {
  return useQuery({
    queryKey: ['unidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error
      return (data ?? []) as Unidade[]
    },
  })
}
