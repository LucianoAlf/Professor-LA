import React, { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Trash2, ZoomIn, ZoomOut } from 'lucide-react'
import Cropper, { type Area } from 'react-easy-crop'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { DatePicker } from '../components/ui/date-picker'
import { Input } from '../components/ui/input'
import { supabase } from '../lib/supabase'
import { useUnidades } from '../hooks/useUnidades'

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

const getCroppedImageBlob = async (imageSrc: string, cropPixels: Area, preferredType: string) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Nao foi possivel abrir o editor da imagem.')
  }

  canvas.width = Math.max(1, Math.round(cropPixels.width))
  canvas.height = Math.max(1, Math.round(cropPixels.height))

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  const mimeType =
    preferredType === 'image/png' || preferredType === 'image/webp' ? preferredType : 'image/jpeg'

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Nao foi possivel gerar a imagem recortada.'))
          return
        }
        resolve(blob)
      },
      mimeType,
      0.92,
    )
  })
}

interface ProfessorFormState {
  nome: string
  email: string
  telefone: string
  instrumento: string
  fotoUrl: string
  dataInicio: string
  unidadeIds: string[]
}

const FOTO_BUCKET = 'professores-fotos'

const extractStoragePathFromUrl = (url: string) => {
  const marker = `/storage/v1/object/public/${FOTO_BUCKET}/`
  const index = url.indexOf(marker)
  if (index < 0) return null
  return url.slice(index + marker.length)
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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<ProfessorFormState>(DEFAULT_FORM)
  const [editingProfessorId, setEditingProfessorId] = useState<string | null>(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [croppingFoto, setCroppingFoto] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProfessorCardData | null>(null)
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null)
  const [selectedImageType, setSelectedImageType] = useState('image/jpeg')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

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
      await queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      await queryClient.invalidateQueries({ queryKey: ['annual-data'] })
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

  const removePhotoFromStorage = async (photoUrl: string) => {
    const path = extractStoragePathFromUrl(photoUrl)
    if (!path) return
    await supabase.storage.from(FOTO_BUCKET).remove([path])
  }

  const closeCropModal = () => {
    if (selectedImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImageSrc)
    }
    setIsCropModalOpen(false)
    setSelectedImageSrc(null)
    setSelectedImageType('image/jpeg')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setCroppingFoto(false)
  }

  const uploadProfessorPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione apenas arquivos de imagem (JPG, PNG ou WEBP).')
      return false
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem deve ter no maximo 5MB.')
      return false
    }

    setUploadingFoto(true)
    setUploadError(null)

    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `professores/${Date.now()}-${crypto.randomUUID()}.${extension}`

      const { error: uploadErrorStorage } = await supabase.storage
        .from(FOTO_BUCKET)
        .upload(path, file, { upsert: false })

      if (uploadErrorStorage) throw uploadErrorStorage

      const { data } = supabase.storage.from(FOTO_BUCKET).getPublicUrl(path)
      const nextUrl = data.publicUrl

      const oldPhotoUrl = form.fotoUrl
      setForm((prev) => ({ ...prev, fotoUrl: nextUrl }))

      if (oldPhotoUrl && oldPhotoUrl !== nextUrl) {
        await removePhotoFromStorage(oldPhotoUrl)
      }
      return true
    } catch (error: any) {
      setUploadError(error?.message ?? 'Erro ao fazer upload da foto.')
      return false
    } finally {
      setUploadingFoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione apenas arquivos de imagem (JPG, PNG ou WEBP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem deve ter no maximo 5MB.')
      return
    }

    setUploadError(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setSelectedImageType(file.type || 'image/jpeg')
    setSelectedImageSrc(URL.createObjectURL(file))
    setIsCropModalOpen(true)
  }

  const handleCropComplete = (_croppedArea: Area, nextCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(nextCroppedAreaPixels)
  }

  const handleConfirmCrop = async () => {
    if (!selectedImageSrc || !croppedAreaPixels) {
      setUploadError('Ajuste o enquadramento antes de confirmar.')
      return
    }

    setCroppingFoto(true)
    setUploadError(null)

    try {
      const blob = await getCroppedImageBlob(selectedImageSrc, croppedAreaPixels, selectedImageType)
      const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
      const croppedFile = new File([blob], `professor-recorte-${Date.now()}.${extension}`, {
        type: blob.type,
      })

      const uploaded = await uploadProfessorPhoto(croppedFile)
      if (uploaded) closeCropModal()
    } catch (error: any) {
      setUploadError(error?.message ?? 'Erro ao recortar a imagem.')
    } finally {
      setCroppingFoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!form.fotoUrl) return
    await removePhotoFromStorage(form.fotoUrl)
    setForm((prev) => ({ ...prev, fotoUrl: '' }))
    setUploadError(null)
  }

  const handleEdit = (professor: ProfessorCardData) => {
    setUploadError(null)
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

  const handleDelete = (professor: ProfessorCardData) => {
    setDeleteTarget(professor)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    await deleteProfessor.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const closeDeleteModal = () => {
    if (deleteProfessor.isPending) return
    setDeleteTarget(null)
  }

  const isSaving = createProfessor.isPending || updateProfessor.isPending

  const clearForm = () => {
    setUploadError(null)
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
              <label className="text-xs font-semibold text-[var(--txt2)]">Foto do professor</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFoto}
                >
                  <ImagePlus className="h-4 w-4" />
                  {uploadingFoto ? 'Enviando foto...' : 'Selecionar imagem'}
                </Button>

                {form.fotoUrl && (
                  <Button type="button" variant="outline" onClick={handleRemovePhoto}>
                    <Trash2 className="h-4 w-4" />
                    Remover foto
                  </Button>
                )}
              </div>

              <div className="text-[11px] text-[var(--txt3)]">Formatos: JPG, PNG ou WEBP. Tamanho maximo: 5MB.</div>
              <div className="text-[11px] text-[var(--txt3)]">Ao selecionar, voce pode recortar, ampliar e ajustar o enquadramento antes de enviar.</div>

              {form.fotoUrl && (
                <div className="pt-1">
                  <img
                    src={form.fotoUrl}
                    alt="Pre-visualizacao da foto"
                    className="h-16 w-16 rounded-full object-cover border border-[var(--border)]"
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

            {uploadError && <Badge variant="warning">{uploadError}</Badge>}
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

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 shadow-2xl">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-[var(--txt)]">Confirmar exclusao</h3>
              <p className="mt-1 text-xs text-[var(--txt3)]">
                Tem certeza que deseja excluir o professor {deleteTarget.nome}? Essa acao remove os vinculos ativos dele nas unidades.
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDeleteModal} disabled={deleteProfessor.isPending}>
                Cancelar
              </Button>
              <Button
                type="button"
                className="bg-[var(--red)] text-white hover:bg-[color-mix(in_srgb,var(--red)_85%,black)]"
                onClick={handleConfirmDelete}
                disabled={deleteProfessor.isPending}
              >
                {deleteProfessor.isPending ? 'Excluindo...' : 'Excluir professor'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCropModalOpen && selectedImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 shadow-2xl">
            <div className="mb-3">
              <h3 className="text-base font-semibold text-[var(--txt)]">Ajustar foto do professor</h3>
              <p className="mt-1 text-xs text-[var(--txt3)]">
                Arraste para enquadrar e use o zoom para aproximar ou afastar.
              </p>
            </div>

            <div className="relative h-[360px] overflow-hidden rounded-xl border border-[var(--border)] bg-[rgba(255,255,255,0.03)]">
              <Cropper
                image={selectedImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                objectFit="contain"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--txt2)]">
                <ZoomOut className="h-3.5 w-3.5" />
                <span>Zoom</span>
                <ZoomIn className="h-3.5 w-3.5" />
              </div>
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full accent-[var(--gold)]"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeCropModal} disabled={croppingFoto || uploadingFoto}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleConfirmCrop} disabled={croppingFoto || uploadingFoto}>
                {croppingFoto || uploadingFoto ? 'Processando...' : 'Aplicar recorte'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
