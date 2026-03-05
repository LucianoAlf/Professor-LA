import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { DatePicker } from '../components/ui/date-picker'
import { Input } from '../components/ui/input'
import { supabase } from '../lib/supabase'
import { useUnidades } from '../hooks/useUnidades'

interface ProfessorFormState {
  nome: string
  email: string
  telefone: string
  instrumento: string
  dataInicio: string
  unidadeIds: string[]
}

const getRelationObject = <T,>(value: T | T[] | null | undefined): T | null => {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

const DEFAULT_FORM: ProfessorFormState = {
  nome: '',
  email: '',
  telefone: '',
  instrumento: '',
  dataInicio: new Date().toISOString().slice(0, 10),
  unidadeIds: [],
}

export const Professores: React.FC = () => {
  const queryClient = useQueryClient()
  const unidadesQuery = useUnidades()
  const [form, setForm] = useState<ProfessorFormState>(DEFAULT_FORM)

  const professoresQuery = useQuery({
    queryKey: ['professores-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_unidade')
        .select('id, ativo, data_inicio, professor:professor_id(id, nome, email, telefone, instrumento), unidade:unidade_id(id, nome, codigo)')
        .eq('ativo', true)

      if (error) throw error
      return data ?? []
    },
  })

  const groupedProfessores = useMemo(() => {
    const map = new Map<string, any>()

    for (const item of professoresQuery.data ?? []) {
      const professor = getRelationObject<any>(item.professor)
      const unidade = getRelationObject<any>(item.unidade)
      if (!professor?.id) continue

      if (!map.has(professor.id)) {
        map.set(professor.id, {
          ...professor,
          unidades: [],
        })
      }

      const current = map.get(professor.id)
      if (unidade?.nome) {
        current.unidades.push(unidade.nome)
      }
    }

    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [professoresQuery.data])

  const createProfessor = useMutation({
    mutationFn: async (payload: ProfessorFormState) => {
      const { data: professor, error: professorError } = await supabase
        .from('professores')
        .insert({
          nome: payload.nome,
          email: payload.email || null,
          telefone: payload.telefone || null,
          instrumento: payload.instrumento || null,
          ativo: true,
        })
        .select('id')
        .single()

      if (professorError) throw professorError

      const vinculos = payload.unidadeIds.map((unidadeId) => ({
        professor_id: professor.id,
        unidade_id: unidadeId,
        ativo: true,
        data_inicio: payload.dataInicio,
      }))

      const { error: vinculoError } = await supabase
        .from('professor_unidade')
        .insert(vinculos)

      if (vinculoError) throw vinculoError
    },
    onSuccess: async () => {
      setForm(DEFAULT_FORM)
      await queryClient.invalidateQueries({ queryKey: ['professores-admin'] })
      await queryClient.invalidateQueries({ queryKey: ['professores-by-unidade'] })
    },
  })

  const toggleUnidade = (unidadeId: string) => {
    setForm((prev) => ({
      ...prev,
      unidadeIds: prev.unidadeIds.includes(unidadeId)
        ? prev.unidadeIds.filter((id) => id !== unidadeId)
        : [...prev.unidadeIds, unidadeId],
    }))
  }

  const handleSave = async () => {
    if (!form.nome.trim() || form.unidadeIds.length === 0) return
    await createProfessor.mutateAsync(form)
  }

  return (
    <div className="animate-[fadeIn_0.25s_ease] p-5 md:px-7 md:py-6 pb-12">
      <div className="mb-5">
        <div className="text-[10px] tracking-[3px] uppercase text-[var(--gold)] font-semibold mb-2 flex items-center gap-2.5 before:content-[''] before:w-[18px] before:h-0.5 before:bg-[var(--gold)]">
          Cadastros
        </div>
        <div className="font-serif text-[clamp(20px,2.2vw,28px)] font-black text-[var(--txt)] leading-[1.1]">
          👩‍🏫 <em className="text-[var(--gold)] not-italic">Professores</em>
        </div>
        <div className="text-xs text-[var(--txt3)] mt-1.5">
          Cadastre professores e vincule às unidades para aparecerem nos lançamentos e PDI.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>➕ Novo professor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--txt2)]">Nome completo *</label>
              <Input value={form.nome} onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--txt2)]">E-mail</label>
                <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--txt2)]">WhatsApp</label>
                <Input value={form.telefone} onChange={(e) => setForm((prev) => ({ ...prev, telefone: e.target.value }))} placeholder="5521999999999" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--txt2)]">Curso / Especialidade</label>
                <Input value={form.instrumento} onChange={(e) => setForm((prev) => ({ ...prev, instrumento: e.target.value }))} placeholder="Ex.: Violão" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--txt2)]">Data de admissão</label>
                <DatePicker value={form.dataInicio} onChange={(nextDate) => setForm((prev) => ({ ...prev, dataInicio: nextDate }))} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--txt2)]">Unidades de atuação *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(unidadesQuery.data ?? []).map((unidade) => {
                  const active = form.unidadeIds.includes(unidade.id)
                  return (
                    <button
                      key={unidade.id}
                      type="button"
                      onClick={() => toggleUnidade(unidade.id)}
                      className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                        active
                          ? 'border-[rgba(200,151,58,0.45)] bg-[rgba(200,151,58,0.12)] text-[var(--gold)]'
                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--txt2)]'
                      }`}
                    >
                      {unidade.nome}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2.5">
              <Button onClick={handleSave} disabled={createProfessor.isPending || !form.nome.trim() || form.unidadeIds.length === 0}>
                {createProfessor.isPending ? 'Salvando...' : 'Salvar professor'}
              </Button>
              <Button variant="outline" onClick={() => setForm(DEFAULT_FORM)} disabled={createProfessor.isPending}>
                Limpar
              </Button>
            </div>

            {createProfessor.isError && (
              <Badge variant="danger">Erro ao salvar professor. Verifique os dados e tente novamente.</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📚 Professores cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {professoresQuery.isLoading && <div className="text-xs text-[var(--txt3)]">Carregando...</div>}
            {professoresQuery.isError && (
              <Badge variant="danger">Erro ao carregar professores do banco.</Badge>
            )}

            {!professoresQuery.isLoading && !professoresQuery.isError && (
              <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
                {groupedProfessores.map((professor) => (
                  <div key={professor.id} className="rounded-lg border border-[var(--border)] p-3 bg-[var(--surface)]">
                    <div className="text-sm font-semibold text-[var(--txt)]">{professor.nome}</div>
                    <div className="text-xs text-[var(--txt3)] mt-1">
                      {professor.instrumento || 'Especialidade não informada'}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {professor.unidades.map((unidade: string) => (
                        <Badge key={`${professor.id}-${unidade}`}>{unidade}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {!groupedProfessores.length && (
                  <div className="text-xs text-[var(--txt3)]">Nenhum professor cadastrado ainda.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
