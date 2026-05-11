'use client'
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Tecnico } from '@/types/database.types'

interface AuthState {
  user: User | null
  tecnico: Tecnico | null
  setUser: (u: User | null) => void
  setTecnico: (t: Tecnico | null) => void
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  tecnico: null,
  setUser: (user) => set({ user }),
  setTecnico: (tecnico) => set({ tecnico }),
}))
