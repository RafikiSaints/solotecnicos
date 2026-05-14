'use client'
import { create } from 'zustand'

/**
 * Store global del técnico "enfocado" en el mapa.
 * Lo usan: TarjetaTecnico (botón "Ver en mapa") y MapaDirectorio (zoom + popup).
 * No se persiste — solo dura mientras el usuario está en la vista.
 */
interface State {
  selectedId: string | null
  /** Incremento que se cambia cada vez que se selecciona — fuerza al mapa
   *  a re-enfocar incluso si vuelves a clickear la misma tarjeta. */
  tick: number
  select: (id: string | null) => void
}

export const useTecnicoSeleccionadoStore = create<State>(set => ({
  selectedId: null,
  tick: 0,
  select: (id) => set(s => ({ selectedId: id, tick: s.tick + 1 })),
}))
