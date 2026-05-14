'use client'
import { create } from 'zustand'

/**
 * Store global del servicio seleccionado para cotizar.
 * Lo usan: PerfilPublico (click en una tarjeta de servicio) y
 * FormularioCotizacion (prefill del textarea).
 */
interface State {
  servicio: string | null
  tick: number  // fuerza re-fill aunque se elija el mismo servicio dos veces
  setServicio: (s: string | null) => void
  clear: () => void
}

export const useCotizacionStore = create<State>(set => ({
  servicio: null,
  tick: 0,
  setServicio: (s) => set(st => ({ servicio: s, tick: st.tick + 1 })),
  clear: () => set({ servicio: null }),
}))
