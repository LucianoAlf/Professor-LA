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
  fotoUrl: string
  dataInicio: string
  unidadeIds: string[]
}

interface ProfessorCardData {
  id: string
  nome: string
  email: string
  telefone: string
  instrumento: string
  fotoUrl: string
  dataInicio: string
  unidadeIds: string[]
  unidades: string[]
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
  fotoUrl: '',
  dataInicio: new Date().toISOString().slice(0, 10),
  unidadeIds: [],
}

const getInitials = (name: string) => {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export const Professores: React.FC = () => {
  const queryClient = useQueryClient()
  const unidadesQuery = useUnidades()
  const [form, setForm] = useState<ProfessorFormState>(DEFAULT_FORM)
  const [editingProfessorId, setEditingProfessorId] = useState<string | null>(null)

  const professoresQuery = useQuery({
    queryKey: ['professores-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professor_unidade')
        .select('id, unidade_id, ativo, data_inicio, professor:professor_id(id, nome, email, telefone, instrumento, foto_url, ativo), unidade:unidade_id(id, nome, codigo)')
        .eq('ativo', true)

      if (error) throw error
      return data ?? []
    },
  })

  const groupedProfessores = useMemo(() => {
    const map = new Map<string, ProfessorCardData>()

    for (const item of professoresQuery.data ?? []) {
      const professor = getRelationObject<any>(item.professor)
      const unidade = getRelationObject<any>(item.unidade)
      if (!professor?.id || professor.ativo === false || !item.ativo) continue

      if (!map.has(professor.id)) {
        map.set(professor.id, {
          id: professor.id,
          nome: professor.nome,
          email: professor.email ?? '',
          telefone: professor.telefone ?? '',
          instrumento: professor.instrumento ?? '',
          fotoUrl: professor.foto_url ?? '',
          dataInicio: item.data_inicio ?? DEFAULT_FORM.dataInicio,
          unidadeIds: [],
          unidades: [],
        })
      }

      const current = map.get(professor.id)
      if (!current) continue

      if (unidade?.nome && !current.unidades.includes(unidade.nome)) {
        current.unidades.push(unidade.nome)
      }

      if (item.unidade_id && !current.unidadeIds.includes(item.unidade_id)) {
        current.unidadeIds.push(item.unidade_id)
      }

      if (!current.dataInicio && item.data_inicio) {
        current.dataInicio = item.data_inicio
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
          foto_url: payload.fotoUrl || null,
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
      setEditingProfessorId(null)
      await queryClient.invalidateQueries({ queryKey: ['professor-count-by-unit'] })
      await queryClient.invalidateQueries({ queryKey: ['professores-admin'] })
      await queryClient.invalidateQueries({ queryKey: ['professores-by-unidade'] })
    },
  })

  const updateProfessor = useMutation({
    mutationFn: async ({ professorId, payload }: { professorId: string; payload: ProfessorFormState }) => {
      const { error: updateProfessorError } = await supabase
        .from('professores')
        .update({
          nome: payload.nome,
          email: payload.email || null,
          telefone: payload.telefone || null,
          instrumento: payload.instrumento || null,
          foto_url: payload.fotoUrl || null,
          ativo: true,
        })
        .eq('id', professorId)

      if (updateProfessorError) throw updateProfessorError

      const { data: links, error: linksError } = await supabase
        .from('professor_unidade')
        .select('id, unidade_id, ativo')
        .eq('professor_id', professorId)

      if (linksError) throw linksError

      const selected = new Set(payload.unidadeIds)
      const existing = new Map((links ?? []).map((link) => [link.unidade_id, link]))

      for (const link of links ?? []) {
        if (!selected.has(link.unidade_id) && link.ativo) {
          const { error } = await supabase
            .from('professor_unidade')
            .update({ ativo: false, data_fim: new Date().toISOString().slice(0, 10) })
            .eq('id', link.id)
          if (error) throw error
        }

        if (selected.has(link.unidade_id) && !link.ativo) {
          const { error } = await supabase
            .from('professor_unidade')
            .update({ ativo: true, data_fim: null, data_inicio: payload.dataInicio })
            .eq('id', link.id)
          if (error) throw error
        }
      }

      const newLinks = payload.unidadeIds
        .filter((unidadeId) => !existing.has(unidadeId))
        .map((unidadeId) => ({
          professor_id: professorId,
          unidade_id: unidadeId,
          ativo: true,
          data_inicio: payload.dataInicio,
        }))

      if (newLinks.length) {
        const { error: newLinksError } = await supabase.from('professor_unidade').insert(newLinks)
        if (newLinksError) throw newLinksError
      }
    },
    onSuccess: async () => {
      setForm(DEFAULT_FORM)
      setEditingProfessorId(null)
      await queryClient.invalidateQueries({ queryKey: ['professor-count-by-unit'] })
      await queryClient.invalidateQueries({ queryKey: ['professores-admin'] })
      await queryClient.invalidateQueries({ queryKey: ['professores-by-unidade'] })
    },
  })

  const deleteProfessor = useMutation({
    mutationFn: async (professorId: string) => {
      const { error: linksError } = await supabase
        .from('professor_unidade')
        .update({ ativo: false, data_fim: new Date().toISOString().slice(0, 10) })
        .eq('professor_id', professorId)

      if (linksError) throw linksError

      const { error: professorError } = await supabase
        .from('professores')
        .update({ ativo: false })
        .eq('id', professorId)

      if (professorError) throw professorError
    },
    onSuccess: async () => {
      if (editingProfessorId) {
        setEditingProfessorId(null)
        setForm(DEFAULT_FORM)
      }
      await queryClient.invalidateQueries({ queryKey: ['professor-count-by-unit'] })
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

    if (editingProfessorId) {
      await updateProfessor.mutateAsync({ professorId: editingProfessorId, payload: form })
      return
    }

    await createProfessor.mutateAsync(form)
  }

  const handleEdit = (professor: ProfessorCardData) => {
    setEditingProfessorId(professor.id)
    setForm({
      nome: professor.nome,
      email: professor.email,
      telefone: professor.telefone,
      instrumento: professor.instrumento,
      fotoUrl: professor.fotoUrl,
      dataInicio: professor.dataInicio || DEFAULT_FORM.dataInicio,
      unidadeIds: professor.unidadeIds,
    })
  }

  const handleDelete = async (professor: ProfessorCardData) => {
    const confirmed = window.confirm(`Tem certeza que deseja excluir o professor ${professor.nome}?`)
    if (!confirmed) return
    await deleteProfessor.mutateAsync(professor.id)
  }

  const isSaving = createProfessor.isPending || updateProfessor.isPending

  const clearForm = () => {
    setEditingProfessorId(null)
    setForm(DEFAULT_FORM)
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
            <CardTitle>{editingProfessorId ? '✏️ Editar professor' : '➕ Novo professor'}</CardTitle>
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--txt2)]">Foto (URL)</label>
              <Input
                value={form.fotoUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, fotoUrl: e.target.value }))}
                placeholder="https://..."
              />
              {form.fotoUrl && (
                <div className="pt-1">
                  <img
                    src={form.fotoUrl}
                    alt="Pré-visualização da foto"
                    className="h-14 w-14 rounded-full object-cover border border-[var(--border)]"
                  />
                </div>
              )}
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
              <Button onClick={handleSave} disabled={isSaving || !form.nome.trim() || form.unidadeIds.length === 0}>
                {isSaving ? 'Salvando...' : editingProfessorId ? 'Atualizar professor' : 'Salvar professor'}
              </Button>
              <Button variant="outline" onClick={clearForm} disabled={isSaving}>
                {editingProfessorId ? 'Cancelar edição' : 'Limpar'}
              </Button>
            </div>

            {(createProfessor.isError || updateProfessor.isError || deleteProfessor.isError) && (
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
              <div className="professor-scroll space-y-2 max-h-[520px] overflow-auto pr-1">
                {groupedProfessores.map((professor) => (
                  <div key={professor.id} className="rounded-xl border border-[rgba(255,255,255,0.08)] p-3 bg-[rgba(255,255,255,0.03)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {professor.fotoUrl ? (
                          <img
                            src={professor.fotoUrl}
                            alt={`Foto de ${professor.nome}`}
                            className="h-11 w-11 rounded-full object-cover border border-[var(--border)]"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full border border-[var(--border)] bg-[rgba(45,90,160,0.24)] text-[var(--txt2)] text-xs font-bold flex items-center justify-center">
                            {getInitials(professor.nome)}
                          </div>
                        )}

                        <div>
                          <div className="text-sm font-semibold text-[var(--txt)]">{professor.nome}</div>
                          <div className="text-xs text-[var(--txt3)] mt-1">
                            {professor.instrumento || 'Especialidade nao informada'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" className="h-8 px-3" onClick={() => handleEdit(professor)}>
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8 px-3 border-[rgba(166,28,28,0.3)] text-[var(--red)] hover:bg-[rgba(166,28,28,0.12)]"
                          onClick={() => handleDelete(professor)}
                          disabled={deleteProfessor.isPending}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>

                    {(professor.email || professor.telefone) && (
                      <div className="mt-2 text-xs text-[var(--txt3)] flex flex-wrap gap-x-3 gap-y-1">
                        {professor.email && <span>{professor.email}</span>}
                        {professor.telefone && <span>{professor.telefone}</span>}
                      </div>
                    )}

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
