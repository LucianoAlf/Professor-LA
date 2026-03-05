import React, { createContext, useContext, useMemo } from 'react'
import { QuarterId, UnitId, MonthId, Config } from './types'
import { useAppStore } from './store/useAppStore'
import { useAnoLetivoAtual } from './hooks/useAnosLetivos'
import { useConfigPesos } from './hooks/useConfigPesos'

const normalizeWeight = (value?: number) => {
  const raw = value ?? 0
  return raw > 1 ? raw / 100 : raw
}

interface AppContextType {
  curQ: QuarterId
  setCurQ: (q: QuarterId) => void
  curUnit: UnitId
  setCurUnit: (u: UnitId) => void
  curMonth: MonthId
  setCurMonth: (m: MonthId) => void
  curPDIQ: QuarterId
  setCurPDIQ: (q: QuarterId) => void
  isLight: boolean
  setIsLight: (l: boolean) => void
  sbOpen: boolean
  setSbOpen: (o: boolean) => void
  activePage: string
  setActivePage: (p: string) => void
  cfg: Config
  anoLetivoId?: string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    curQ,
    setCurQ,
    curUnit,
    setCurUnit,
    curMonth,
    setCurMonth,
    curPDIQ,
    setCurPDIQ,
    isLight,
    setIsLight,
    sbOpen,
    setSbOpen,
    activePage,
    setActivePage,
  } = useAppStore()

  const anoLetivo = useAnoLetivoAtual()
  const configPesos = useConfigPesos(anoLetivo.data?.id)

  const cfg = useMemo<Config>(() => {
    const pesos = configPesos.data
    const mediaMin = pesos?.media_turma_min ?? pesos?.benchmark_media_min ?? 1
    const mediaMax = pesos?.media_turma_max ?? pesos?.benchmark_media_max ?? 2.5
    const corte360 = pesos?.nota_corte_360 ?? pesos?.corte_prof360 ?? 80

    return {
      weights: {
        ret: normalizeWeight(pesos?.peso_retencao ?? 35),
        conv: normalizeWeight(pesos?.peso_conversao ?? 25),
        media: normalizeWeight(pesos?.peso_media_turma ?? 25),
        pdi: normalizeWeight(pesos?.peso_pdi ?? 15),
      },
      mediaMin,
      mediaMax,
      corte360,
    }
  }, [configPesos.data])

  return (
    <AppContext.Provider value={{
      curQ,
      setCurQ,
      curUnit,
      setCurUnit,
      curMonth,
      setCurMonth,
      curPDIQ,
      setCurPDIQ,
      isLight,
      setIsLight,
      sbOpen,
      setSbOpen,
      activePage,
      setActivePage,
      cfg,
      anoLetivoId: anoLetivo.data?.id,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}
