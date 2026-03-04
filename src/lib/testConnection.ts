import { supabase } from './supabase'

export async function testConnection() {
  const { data, error } = await supabase.from('_dummy_').select('*').limit(1)
  if (error && error.code !== 'PGRST116') {
    console.error('Supabase connection error:', error)
    return false
  }
  console.log('✅ Supabase conectado com sucesso')
  return true
}
