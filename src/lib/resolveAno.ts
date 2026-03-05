import { supabase } from './supabase'

export async function resolveAnoByAnoLetivoId(anoLetivoId: string): Promise<number> {
  const { data, error } = await supabase
    .from('anos_letivos')
    .select('ano')
    .eq('id', anoLetivoId)
    .single()

  if (error || !data) throw new Error('Ano letivo não encontrado')
  return data.ano
}
