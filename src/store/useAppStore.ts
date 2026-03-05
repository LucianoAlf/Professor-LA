import { create } from 'zustand'
import { MonthId, QuarterId, UnitId } from '../types'
import { QUARTERS } from '../constants'

interface AppStore {
  curQ: QuarterId
  curUnit: UnitId
  curMonth: MonthId
  curPDIQ: QuarterId
  isLight: boolean
  sbOpen: boolean
  sbCollapsed: boolean
  activePage: string
  setCurQ: (q: QuarterId) => void
  setCurUnit: (u: UnitId) => void
  setCurMonth: (m: MonthId) => void
  setCurPDIQ: (q: QuarterId) => void
  setIsLight: (isLight: boolean) => void
  setSbOpen: (sbOpen: boolean) => void
  setSbCollapsed: (sbCollapsed: boolean) => void
  setActivePage: (page: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  curQ: 'Q1',
  curUnit: 'CG',
  curMonth: QUARTERS.Q1.months[0],
  curPDIQ: 'Q1',
  isLight: false,
  sbOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  sbCollapsed: false,
  activePage: 'dashboard',
  setCurQ: (curQ) => set({ curQ }),
  setCurUnit: (curUnit) => set({ curUnit }),
  setCurMonth: (curMonth) => set({ curMonth }),
  setCurPDIQ: (curPDIQ) => set({ curPDIQ }),
  setIsLight: (isLight) => set({ isLight }),
  setSbOpen: (sbOpen) => set({ sbOpen }),
  setSbCollapsed: (sbCollapsed) => set({ sbCollapsed }),
  setActivePage: (activePage) => set({ activePage }),
}))
