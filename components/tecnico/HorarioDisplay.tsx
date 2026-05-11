'use client'
import { Clock } from 'lucide-react'
import { DIAS_SEMANA, estaAbiertoAhora } from '@/lib/utils'
import type { Horarios } from '@/types/database.types'

export function HorarioDisplay({ horarios, atiende24h }: { horarios: Horarios | null; atiende24h?: boolean }) {
  if (atiende24h) {
    return (
      <div className="card">
        <h4 className="font-display text-lg text-azul mb-2 flex items-center gap-2">
          <Clock size={18} /> Horario
        </h4>
        <p className="text-sm text-verde font-semibold">Atendemos 24 horas todos los días</p>
      </div>
    )
  }
  if (!horarios) return null
  const abierto = estaAbiertoAhora(horarios)
  const today = new Date().getDay()
  const todayIdx = today === 0 ? 6 : today - 1 // map sunday → 6
  return (
    <div className="card">
      <h4 className="font-display text-lg text-azul mb-2 flex items-center gap-2">
        <Clock size={18} /> Horario
        <span className={`ml-auto text-xs font-semibold ${abierto ? 'text-verde' : 'text-rojo'}`}>
          {abierto ? '● Abierto ahora' : '● Cerrado'}
        </span>
      </h4>
      <ul className="text-sm divide-y divide-borde">
        {DIAS_SEMANA.map((d, i) => {
          const h = horarios[d.key]
          const today = i === todayIdx
          return (
            <li key={d.key} className={`flex justify-between py-1.5 ${today ? 'font-semibold text-azul' : 'text-gris-4'}`}>
              <span>{d.label}</span>
              <span>{h?.abierto && h.abre && h.cierra ? `${h.abre} – ${h.cierra}` : 'Cerrado'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
