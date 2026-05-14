'use client'
import { DIAS_SEMANA } from '@/lib/utils'
import type { Horarios } from '@/types/database.types'

/**
 * Horarios "vacíos" — todos los días cerrados.
 * Útil como default para técnicos sin horario definido.
 */
export const HORARIOS_VACIOS: Horarios = {
  lunes:     { abierto: false, abre: null, cierra: null },
  martes:    { abierto: false, abre: null, cierra: null },
  miercoles: { abierto: false, abre: null, cierra: null },
  jueves:    { abierto: false, abre: null, cierra: null },
  viernes:   { abierto: false, abre: null, cierra: null },
  sabado:    { abierto: false, abre: null, cierra: null },
  domingo:   { abierto: false, abre: null, cierra: null },
}

/**
 * Devuelve true si TODOS los días están cerrados (es decir, el técnico no
 * ha configurado su horario todavía).
 */
export function horarioVacio(h: Horarios | null | undefined): boolean {
  if (!h) return true
  return DIAS_SEMANA.every(d => !h[d.key]?.abierto)
}

interface Props {
  horarios: Horarios
  onChange: (h: Horarios) => void
  atiende24h?: boolean
  onToggle24h?: (v: boolean) => void
}

export function HorarioPicker({ horarios, onChange, atiende24h, onToggle24h }: Props) {
  function actualizar(dia: keyof Horarios, campo: 'abre' | 'cierra' | 'abierto', valor: any) {
    onChange({
      ...horarios,
      [dia]: { ...horarios[dia], [campo]: valor },
    })
  }

  function copiarLunesATodos() {
    const l = horarios.lunes
    if (!l.abierto) return
    const next: Horarios = { ...horarios }
    for (const d of DIAS_SEMANA) {
      if (d.key === 'lunes') continue
      next[d.key] = { ...l }
    }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {onToggle24h && (
        <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-borde">
          <input
            type="checkbox"
            checked={!!atiende24h}
            onChange={e => onToggle24h(e.target.checked)}
          />
          <span className="text-sm font-medium">🌙 Atendemos 24 horas todos los días</span>
        </label>
      )}

      {!atiende24h && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gris-3">Define cuándo atiendes. Si no está abierto, queda como "Cerrado".</p>
            <button
              type="button"
              onClick={copiarLunesATodos}
              disabled={!horarios.lunes.abierto}
              className="text-xs text-azul-mid hover:underline disabled:opacity-40 disabled:no-underline"
            >
              Copiar lunes al resto
            </button>
          </div>
          <div className="space-y-2">
            {DIAS_SEMANA.map(d => {
              const h = horarios[d.key]
              return (
                <div key={d.key} className="grid grid-cols-[90px_1fr_1fr_70px] gap-2 items-center">
                  <span className="text-sm font-medium">{d.label}</span>
                  <input
                    type="time"
                    value={h?.abre || ''}
                    onChange={e => actualizar(d.key, 'abre', e.target.value)}
                    className="px-2 py-1.5 text-sm rounded-md border-2 border-borde focus:outline-none focus:border-azul-mid disabled:opacity-50 disabled:bg-papel"
                    disabled={!h?.abierto}
                  />
                  <input
                    type="time"
                    value={h?.cierra || ''}
                    onChange={e => actualizar(d.key, 'cierra', e.target.value)}
                    className="px-2 py-1.5 text-sm rounded-md border-2 border-borde focus:outline-none focus:border-azul-mid disabled:opacity-50 disabled:bg-papel"
                    disabled={!h?.abierto}
                  />
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h?.abierto ?? false}
                      onChange={e => actualizar(d.key, 'abierto', e.target.checked)}
                    />
                    Abre
                  </label>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
