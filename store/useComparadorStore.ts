'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TecnicoConRelaciones } from '@/types/database.types'

interface ComparadorState {
  tecnicos: TecnicoConRelaciones[]
  toggle: (t: TecnicoConRelaciones) => void
  remove: (id: string) => void
  clear: () => void
  isSelected: (id: string) => boolean
}

export const useComparadorStore = create<ComparadorState>()(
  persist(
    (set, get) => ({
      tecnicos: [],
      toggle: (t) => {
        const exists = get().tecnicos.find(x => x.id === t.id)
        if (exists) {
          set({ tecnicos: get().tecnicos.filter(x => x.id !== t.id) })
        } else if (get().tecnicos.length < 3) {
          set({ tecnicos: [...get().tecnicos, t] })
        }
      },
      remove: (id) => set({ tecnicos: get().tecnicos.filter(x => x.id !== id) }),
      clear: () => set({ tecnicos: [] }),
      isSelected: (id) => !!get().tecnicos.find(t => t.id === id),
    }),
    { name: 'comparador-st' }
  )
)
