'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { tiempoTranscurrido } from '@/lib/utils'
import { HiloMensajes } from './HiloMensajes'
import { Lock } from 'lucide-react'
import { puedeHacer } from '@/lib/planes'
import type { Cotizacion, Tecnico } from '@/types/database.types'

export function BandejaMensajes({ tecnico, cotizaciones }: { tecnico: Tecnico; cotizaciones: Cotizacion[] }) {
  const [activa, setActiva] = useState<Cotizacion | null>(cotizaciones[0] || null)
  const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'respondida' | 'cerrada'>('todas')

  const lista = cotizaciones.filter(c => filtro === 'todas' || c.estado === filtro)
  const verFotos = puedeHacer(tecnico, 'puede_ver_fotos_cotizacion')

  const toneEstado = { pendiente: 'rojo', vista: 'oro', respondida: 'verde', cerrada: 'gris' } as const
  const toneUrgencia = { normal: 'gris', urgente: 'oro', '24h': 'rojo' } as const

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-160px)]">
      <div className="border border-borde rounded-lg bg-white overflow-hidden flex flex-col">
        <div className="border-b border-borde p-3 flex gap-1 text-xs">
          {(['todas', 'pendiente', 'respondida', 'cerrada'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-2 py-1 rounded ${filtro === f ? 'bg-azul text-white' : 'text-gris-4 hover:bg-papel'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1">
          {!lista.length && <p className="text-center text-sm text-gris-3 p-6">No hay mensajes</p>}
          {lista.map(c => (
            <button
              key={c.id}
              onClick={() => setActiva(c)}
              className={`w-full text-left p-3 border-b border-borde hover:bg-papel ${activa?.id === c.id ? 'bg-papel' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <strong className="text-azul text-sm">{c.cliente_nombre}</strong>
                <span className="text-[10px] text-gris-3">{tiempoTranscurrido(c.created_at)}</span>
              </div>
              <p className="text-xs text-gris-4 line-clamp-2 mt-1">{c.descripcion}</p>
              <div className="flex gap-1 mt-2">
                <Badge tone={toneEstado[c.estado]}>{c.estado}</Badge>
                {c.urgencia !== 'normal' && <Badge tone={toneUrgencia[c.urgencia]}>{c.urgencia}</Badge>}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="border border-borde rounded-lg bg-white overflow-hidden">
        {activa ? (
          <HiloMensajes cotizacion={activa} verFotos={verFotos} tecnicoId={tecnico.id} />
        ) : (
          <div className="h-full flex items-center justify-center text-gris-3 text-sm">
            Selecciona una cotización
          </div>
        )}
      </div>
    </div>
  )
}
