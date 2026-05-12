'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { tiempoTranscurrido } from '@/lib/utils'
import { DetalleCotizacion } from './DetalleCotizacion'
import { Inbox, Search } from 'lucide-react'
import { puedeHacer } from '@/lib/planes'
import type { Cotizacion, Tecnico, CotizacionEstado } from '@/types/database.types'

const TONES: Record<CotizacionEstado, any> = {
  pendiente: 'rojo',
  vista: 'oro',
  respondida: 'verde',
  contactada: 'azul',
  cerrada: 'gris',
}

export function BandejaMensajes({ tecnico, cotizaciones: ini }: { tecnico: Tecnico; cotizaciones: Cotizacion[] }) {
  const [cotizaciones, setCotizaciones] = useState(ini)
  const [activa, setActiva] = useState<Cotizacion | null>(ini[0] || null)
  const [filtro, setFiltro] = useState<'todas' | CotizacionEstado>('todas')
  const [busqueda, setBusqueda] = useState('')

  const verFotos = puedeHacer(tecnico, 'puede_ver_fotos_cotizacion')
  const puedeWhatsapp = puedeHacer(tecnico, 'whatsapp_visible')

  const lista = cotizaciones
    .filter(c => filtro === 'todas' || c.estado === filtro)
    .filter(c => {
      if (!busqueda) return true
      const q = busqueda.toLowerCase()
      return (
        c.cliente_nombre.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q) ||
        c.cliente_email.toLowerCase().includes(q)
      )
    })

  function actualizarCotizacion(c: Cotizacion) {
    setCotizaciones(prev => prev.map(x => x.id === c.id ? c : x))
    setActiva(c)
  }

  const contadores = {
    pendiente: cotizaciones.filter(c => c.estado === 'pendiente').length,
    vista: cotizaciones.filter(c => c.estado === 'vista').length,
    contactada: cotizaciones.filter(c => c.estado === 'contactada').length,
    cerrada: cotizaciones.filter(c => c.estado === 'cerrada').length,
  }

  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-4 h-[calc(100vh-200px)]">
      {/* Sidebar lista */}
      <div className="border border-borde rounded-lg bg-white overflow-hidden flex flex-col">
        <div className="border-b border-borde p-3 space-y-2">
          {/* Buscador */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-3" />
            <input
              type="search"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email…"
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-borde focus:outline-none focus:border-azul-mid"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-1 text-xs">
            <FiltroTab active={filtro === 'todas'} onClick={() => setFiltro('todas')} label="Todas" count={cotizaciones.length} />
            <FiltroTab active={filtro === 'pendiente'} onClick={() => setFiltro('pendiente')} label="Pendientes" count={contadores.pendiente} tone="rojo" />
            <FiltroTab active={filtro === 'vista'} onClick={() => setFiltro('vista')} label="Vistas" count={contadores.vista} />
            <FiltroTab active={filtro === 'contactada'} onClick={() => setFiltro('contactada')} label="Contactadas" count={contadores.contactada} />
            <FiltroTab active={filtro === 'cerrada'} onClick={() => setFiltro('cerrada')} label="Cerradas" count={contadores.cerrada} />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {!lista.length ? (
            <div className="text-center text-gris-3 p-8">
              <Inbox size={36} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">{cotizaciones.length === 0 ? 'Sin cotizaciones aún' : 'Sin resultados'}</p>
            </div>
          ) : (
            lista.map(c => (
              <button
                key={c.id}
                onClick={() => setActiva(c)}
                className={`w-full text-left p-3 border-b border-borde hover:bg-papel transition-colors ${activa?.id === c.id ? 'bg-papel border-l-4 border-l-azul-mid' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <strong className="text-azul text-sm">{c.cliente_nombre}</strong>
                  <span className="text-[10px] text-gris-3 whitespace-nowrap">{tiempoTranscurrido(c.created_at)}</span>
                </div>
                <p className="text-xs text-gris-4 line-clamp-2 mb-1.5">{c.descripcion}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge tone={TONES[c.estado]}>{c.estado}</Badge>
                  {c.urgencia !== 'normal' && (
                    <Badge tone={c.urgencia === '24h' ? 'rojo' : 'oro'}>
                      {c.urgencia === '24h' ? '🚨 24h' : '⚡ urgente'}
                    </Badge>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Panel detalle */}
      <div className="border border-borde rounded-lg overflow-hidden">
        {activa ? (
          <DetalleCotizacion
            cotizacion={activa}
            verFotos={verFotos}
            puedeWhatsapp={puedeWhatsapp}
            tecnicoNombre={tecnico.nombre_empresa}
            onUpdate={actualizarCotizacion}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gris-3 p-8 text-center">
            <Inbox size={48} className="mb-3 opacity-50" />
            <p className="text-sm">Selecciona una cotización de la lista</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FiltroTab({ active, onClick, label, count, tone }: { active: boolean; onClick: () => void; label: string; count: number; tone?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${active ? 'bg-azul text-white' : 'text-gris-4 hover:bg-papel'}`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1 text-[10px] ${active ? 'opacity-80' : tone === 'rojo' ? 'text-rojo' : 'text-gris-3'}`}>
          {count}
        </span>
      )}
    </button>
  )
}
