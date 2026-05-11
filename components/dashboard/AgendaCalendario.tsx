'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Cita } from '@/types/database.types'

export function AgendaCalendario({ citas }: { citas: Cita[] }) {
  const [mes, setMes] = useState(new Date())

  const year = mes.getFullYear()
  const month = mes.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startOffset = (firstDay.getDay() + 6) % 7 // lunes = 0

  const citasPorDia = new Map<string, Cita[]>()
  citas.forEach(c => {
    const arr = citasPorDia.get(c.fecha) || []
    arr.push(c)
    citasPorDia.set(c.fecha, arr)
  })

  function fechaStr(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMes(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-papel rounded">
          <ChevronLeft size={16} />
        </button>
        <h3 className="font-display text-lg text-azul">
          {mes.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
        </h3>
        <button onClick={() => setMes(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-papel rounded">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="text-center font-semibold text-gris-3 py-1">{d}</div>
        ))}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1
          const fecha = fechaStr(d)
          const dia = citasPorDia.get(fecha) || []
          const today = new Date().toDateString() === new Date(year, month, d).toDateString()
          return (
            <div
              key={d}
              className={`min-h-[64px] p-1 rounded border ${today ? 'border-azul bg-azul/5' : 'border-borde'}`}
            >
              <div className={`text-xs font-semibold ${today ? 'text-azul' : 'text-gris-4'}`}>{d}</div>
              <div className="space-y-0.5 mt-1">
                {dia.slice(0, 2).map(c => (
                  <div key={c.id} className="text-[10px] truncate px-1 py-0.5 rounded bg-rojo/10 text-rojo">
                    {c.hora_inicio.slice(0, 5)} {c.cliente_nombre}
                  </div>
                ))}
                {dia.length > 2 && (
                  <div className="text-[10px] text-gris-3">+{dia.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
