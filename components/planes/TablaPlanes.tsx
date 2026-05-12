'use client'
import { useState } from 'react'
import { Check, X, Sparkles } from 'lucide-react'
import { TogglePeriodo } from './TogglePeriodo'
import { PLANES, precioFormateado } from '@/lib/planes'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const FILAS: { label: string; key: string }[] = [
  { label: 'Fotos en perfil',           key: 'fotos' },
  { label: 'Trabajos portafolio',       key: 'trabajos_portafolio' },
  { label: 'Servicios listados',        key: 'servicios' },
  { label: 'Etiquetas de búsqueda',     key: 'etiquetas' },
  { label: 'Responder reseñas',         key: 'puede_responder_resenas' },
  { label: 'WhatsApp visible',          key: 'whatsapp_visible' },
  { label: 'Badge verificado',          key: 'badge_verificado' },
  { label: 'Posición destacada (sobre Gratis)',  key: 'posicion_destacada' },
  { label: 'Máxima prioridad (sobre PRO)',        key: 'primera_posicion' },
  { label: 'Banner "Recomendado" dorado',         key: 'banner_resultados' },
  { label: 'Agenda integrada',          key: 'agenda' },
  { label: 'Ver fotos en cotizaciones', key: 'puede_ver_fotos_cotizacion' },
  { label: 'Estadísticas detalladas',   key: 'estadisticas' },
  { label: 'Alertas de demanda',        key: 'alertas_demanda' },
  { label: 'Certificaciones',           key: 'certificaciones' },
  { label: 'Video promocional',         key: 'video' },
  { label: 'Puntos de atención múltiples', key: 'puntos_atencion' },
]

export function TablaPlanes() {
  const [periodo, setPeriodo] = useState<'mensual' | 'anual'>('mensual')

  function valor(plan: keyof typeof PLANES, key: string) {
    const v = (PLANES[plan].limites as any)[key]
    if (v === Infinity) return '∞'
    if (typeof v === 'boolean') return v ? <Check size={16} className="text-verde mx-auto" /> : <X size={16} className="text-gris-3 mx-auto" />
    return v
  }

  return (
    <div>
      <div className="flex justify-center mb-8">
        <TogglePeriodo periodo={periodo} onChange={setPeriodo} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-10">
        {(Object.keys(PLANES) as Array<keyof typeof PLANES>).map(p => {
          const plan = PLANES[p]
          const precio = periodo === 'anual' ? plan.precio_anual : plan.precio_mensual
          const destacado = p === 'pro'
          return (
            <div key={p} className={`relative rounded-xl border-2 p-6 bg-white ${destacado ? 'border-oro' : 'border-borde'}`}>
              {destacado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-oro text-azul text-xs font-bold px-3 py-1 rounded-full">
                  MÁS POPULAR
                </div>
              )}
              <div className="font-display text-2xl text-azul flex items-center gap-2">
                {p !== 'gratis' && <Sparkles size={18} className={p === 'elite' ? 'text-oro' : 'text-azul'} />}
                {plan.nombre}
              </div>
              <div className="mt-3">
                <span className="font-display text-4xl font-bold text-azul">
                  {precio === 0 ? 'Gratis' : precioFormateado(precio)}
                </span>
                {precio > 0 && <span className="text-sm text-gris-3"> / {periodo === 'anual' ? 'año' : 'mes'}</span>}
              </div>
              <Link href={p === 'gratis' ? '/registro-tecnico' : '/dashboard/plan'} className="block mt-4">
                <Button variant={destacado ? 'primary' : 'outline'} className="w-full">
                  {p === 'gratis' ? 'Empezar gratis' : `Activar ${plan.nombre}`}
                </Button>
              </Link>
            </div>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-borde">
        <table className="w-full text-sm">
          <thead className="bg-papel">
            <tr>
              <th className="text-left p-3 font-medium text-azul">Características</th>
              <th className="p-3 text-center font-medium text-azul">Gratis</th>
              <th className="p-3 text-center font-medium text-azul">PRO</th>
              <th className="p-3 text-center font-medium text-oro">Elite</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map(f => (
              <tr key={f.key} className="border-t border-borde">
                <td className="p-3 text-gris-4">{f.label}</td>
                <td className="p-3 text-center">{valor('gratis', f.key)}</td>
                <td className="p-3 text-center">{valor('pro', f.key)}</td>
                <td className="p-3 text-center">{valor('elite', f.key)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
