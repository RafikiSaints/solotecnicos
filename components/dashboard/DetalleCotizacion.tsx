'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Phone, MessageCircle, Mail, Lock, Save, Check, Clock, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { tiempoTranscurrido, formatearFecha } from '@/lib/utils'
import type { Cotizacion, CotizacionEstado } from '@/types/database.types'

interface Props {
  cotizacion: Cotizacion
  verFotos: boolean
  puedeWhatsapp: boolean
  tecnicoNombre: string
  onUpdate?: (c: Cotizacion) => void
}

const ESTADOS: { value: CotizacionEstado; label: string; tone: any; icon: any }[] = [
  { value: 'pendiente',   label: 'Pendiente',   tone: 'rojo',  icon: Clock },
  { value: 'vista',       label: 'Vista',       tone: 'oro',   icon: Eye },
  { value: 'contactada',  label: 'Contactada',  tone: 'azul',  icon: Check },
  { value: 'cerrada',     label: 'Cerrada',     tone: 'gris',  icon: X },
]

export function DetalleCotizacion({ cotizacion: initial, verFotos, puedeWhatsapp, tecnicoNombre, onUpdate }: Props) {
  const [cotizacion, setCotizacion] = useState(initial)
  const [notas, setNotas] = useState(initial.notas_internas || '')
  const [guardandoNotas, setGuardandoNotas] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const push = useToast(s => s.push)
  const supabase = createClient()

  // Auto-marcar como "vista" cuando se abre por primera vez
  useEffect(() => {
    if (cotizacion.estado === 'pendiente') {
      cambiarEstado('vista', true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cotizacion.id])

  // Reset cuando cambia la cotización
  useEffect(() => {
    setCotizacion(initial)
    setNotas(initial.notas_internas || '')
  }, [initial])

  async function cambiarEstado(nuevoEstado: CotizacionEstado, silent = false) {
    setCambiandoEstado(true)
    const patch: any = { estado: nuevoEstado }
    if (nuevoEstado === 'vista' && !cotizacion.leida_en) {
      patch.leida_en = new Date().toISOString()
    }
    const { data } = await supabase.from('cotizaciones').update(patch).eq('id', cotizacion.id).select().single()
    setCambiandoEstado(false)
    if (data) {
      setCotizacion(data)
      onUpdate?.(data)
      if (!silent) push(`Marcado como "${nuevoEstado}"`)
    }
  }

  async function guardarNotas() {
    setGuardandoNotas(true)
    await supabase.from('cotizaciones').update({ notas_internas: notas }).eq('id', cotizacion.id)
    setGuardandoNotas(false)
    push('Notas guardadas')
  }

  // Mensaje pre-poblado para WhatsApp/email
  const mensajeBase = `Hola ${cotizacion.cliente_nombre}, soy de ${tecnicoNombre}. Recibí tu solicitud sobre: "${cotizacion.descripcion.slice(0, 80)}${cotizacion.descripcion.length > 80 ? '...' : ''}". `
  const waLink = cotizacion.cliente_telefono
    ? `https://wa.me/${cotizacion.cliente_telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensajeBase)}`
    : null
  const emailLink = `mailto:${cotizacion.cliente_email}?subject=${encodeURIComponent(`Re: tu solicitud — ${tecnicoNombre}`)}&body=${encodeURIComponent(mensajeBase)}`

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-borde p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-display text-xl text-azul font-bold">{cotizacion.cliente_nombre}</h3>
            <p className="text-xs text-gris-3">
              Recibida {tiempoTranscurrido(cotizacion.created_at)} · {formatearFecha(cotizacion.created_at)}
            </p>
          </div>
          {cotizacion.urgencia !== 'normal' && (
            <Badge tone={cotizacion.urgencia === '24h' ? 'rojo' : 'oro'}>
              {cotizacion.urgencia === '24h' ? '🚨 EMERGENCIA' : '⚡ URGENTE'}
            </Badge>
          )}
        </div>

        {/* Botones de contacto rápido */}
        <div className="flex flex-wrap gap-2">
          {cotizacion.cliente_telefono && (
            <a href={`tel:${cotizacion.cliente_telefono}`}>
              <Button size="sm" variant="primary"><Phone size={14} /> Llamar</Button>
            </a>
          )}
          {waLink && puedeWhatsapp && (
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="!bg-verde hover:!bg-verde/90"><MessageCircle size={14} /> WhatsApp</Button>
            </a>
          )}
          {waLink && !puedeWhatsapp && (
            <a href="/dashboard/plan" title="Disponible en plan PRO">
              <Button size="sm" variant="outline" className="!border-oro/40 !text-oro hover:!bg-oro/5">
                <Lock size={12} /> WhatsApp · PRO
              </Button>
            </a>
          )}
          <a href={emailLink}>
            <Button size="sm" variant="outline"><Mail size={14} /> Email</Button>
          </a>
        </div>

        {/* Datos de contacto en texto */}
        <div className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="text-gris-3">Email:</span>{' '}
            <a href={`mailto:${cotizacion.cliente_email}`} className="text-azul-mid hover:underline font-medium">
              {cotizacion.cliente_email}
            </a>
          </div>
          {cotizacion.cliente_telefono && (
            <div>
              <span className="text-gris-3">Teléfono:</span>{' '}
              <a href={`tel:${cotizacion.cliente_telefono}`} className="text-azul-mid hover:underline font-medium">
                {cotizacion.cliente_telefono}
              </a>
            </div>
          )}
          {cotizacion.comuna_servicio && (
            <div className="sm:col-span-2">
              <span className="text-gris-3">📍 Comuna del servicio:</span>{' '}
              <span className="text-azul font-medium">{cotizacion.comuna_servicio}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Descripción */}
        <div>
          <h4 className="text-xs font-semibold text-gris-3 uppercase tracking-wide mb-2">Descripción del problema</h4>
          <div className="bg-papel rounded-lg p-4 text-sm text-gris-4 whitespace-pre-wrap leading-relaxed">
            {cotizacion.descripcion}
          </div>
        </div>

        {/* Fotos */}
        {cotizacion.fotos_urls && cotizacion.fotos_urls.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gris-3 uppercase tracking-wide mb-2">Fotos adjuntas</h4>
            <div className="flex gap-2 flex-wrap">
              {cotizacion.fotos_urls.map((url, i) => (
                <div key={i} className="relative h-24 w-24 rounded-md overflow-hidden border border-borde">
                  <Image src={url} alt="" fill className={`object-cover ${verFotos ? '' : 'blur-md'}`} />
                  {!verFotos && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Lock size={14} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!verFotos && (
              <p className="text-xs text-rojo mt-2">🔒 Las fotos del cliente requieren plan PRO o Elite</p>
            )}
          </div>
        )}

        {/* Notas internas */}
        <div>
          <h4 className="text-xs font-semibold text-gris-3 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Lock size={11} /> Notas internas (solo tú las ves)
          </h4>
          <Textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Ej: Cliente prefiere mañanas. Cotizé $45.000 por whatsapp. Agendado lunes 3PM..."
            className="min-h-[100px]"
          />
          <Button size="sm" variant="outline" onClick={guardarNotas} loading={guardandoNotas} className="mt-2">
            <Save size={14} /> Guardar notas
          </Button>
        </div>
      </div>

      {/* Footer: cambiar estado */}
      <div className="border-t border-borde p-4 bg-papel">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="text-xs font-semibold text-gris-3 uppercase tracking-wide">Estado:</h4>
          <Badge tone={ESTADOS.find(e => e.value === cotizacion.estado)?.tone || 'gris'}>
            {ESTADOS.find(e => e.value === cotizacion.estado)?.label}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map(e => {
            const Icon = e.icon
            const active = cotizacion.estado === e.value
            return (
              <button
                key={e.value}
                onClick={() => cambiarEstado(e.value)}
                disabled={cambiandoEstado || active}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${active ? 'bg-azul text-white border-azul' : 'bg-white text-gris-4 border-borde hover:border-azul'}`}
              >
                <Icon size={12} />
                {e.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
