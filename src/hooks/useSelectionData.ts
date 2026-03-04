import { useMemo } from 'react'
import { QuarterId, UnitId } from '../types'
import { useTrimestres } from './useTrimestres'
import { useUnidades } from './useUnidades'

export function useUnidadeByCodigo(curUnit: UnitId) {
  const unidades = useUnidades()

  const unidadeSelecionada = useMemo(() => {
    if (curUnit === 'CONS') return null
    return (unidades.data ?? []).find((item) => item.codigo === curUnit)
  }, [unidades.data, curUnit])

  return {
    ...unidades,
    unidadeSelecionada,
  }
}

export function useTrimestreByCodigo(anoLetivoId: string | undefined, quarter: QuarterId) {
  const trimestres = useTrimestres(anoLetivoId)

  const trimestreSelecionado = useMemo(() => {
    return (trimestres.data ?? []).find((item) => item.codigo === quarter)
  }, [trimestres.data, quarter])

  return {
    ...trimestres,
    trimestreSelecionado,
  }
}
