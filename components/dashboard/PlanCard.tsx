'use client'
import { useState } from 'react'
import { Sparkles, Check } from 'lucide-react'
import { PLANES, precioFormateado, ahorroAnual } from '@/lib/planes'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface PlanCardProps {
  tecnicoId: string
  email: string
  plan: 'pro' | 'elite'
  periodo: 'mensual' | 'anual'
  destacado?: boolean
  current?: boolean
}

// Ambas listas tienen la misma cantidad de bullets (9) para que las cards queden de la misma altura.
const FEATURES: Record<'pro' | 'elite', string[]> = {
  pro: [
    'Hasta 30 fotos',
    'WhatsApp visible en perfil',
    'Estadísticas de visitas y contactos',
    'Responder reseñas',
    'Badge "Verificado" en perfil',
    'Posición destacada en resultados',
    'Agenda integrada de citas',
    'Certificaciones aprobadas',
    'Alertas de demanda de tu zona',
  ],
  elite: [
    'Hasta 100 fotos',
    '🥇 Primer lugar en resultados',
    'Banner destacado en búsquedas',
    'Aparece en home destacados',
    'Múltiples puntos de atención',
    'Soporte prioritario por WhatsApp',
    'Etiquetas ilimitadas para SEO',
    'Reportes mensuales por email',
    'Todo lo de PRO incluido',
  ],
}

export function PlanCard({ tecnicoId, email, plan, periodo, destacado, current }: PlanCardProps) {
  const [loading, setLoading] = useState(false)
  const push = useToast(s => s.push)
  const p = PLANES[plan]
  const precio = periodo === 'anual' ? p.precio_anual : p.precio_mensual

  async function activar() {
    setLoading(true)
    const res = await fetch('/api/flow/crear-orden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnicoId, email, plan, tipo: periodo }),
    })
    setLoading(false)
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      push('No se pudo iniciar el pago. Verifica las credenciales de Flow.', 'error')
    }
  }

  return (
    <div className={`relative rounded-xl border-2 p-6 flex flex-col h-full ${destacado ? 'border-oro bg-oro/5' : 'border-borde bg-white'}`}>
      {/* Espacio reservado SIEMPRE para que ambas cards queden alineadas (haya badge o no) */}
      <div className="h-6 flex justify-center items-start -mt-9 mb-2">
        {destacado && (
          <div className="bg-oro text-azul text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            MÁS POPULAR
          </div>
        )}
      </div>

      <div className="text-center">
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${plan === 'elite' ? 'bg-oro/20 text-oro' : 'bg-azul/10 text-azul-mid'}`}>
          <Sparkles size={12} /> {p.nombre}
        </div>
        <div className="mt-3">
          <span className="font-display text-4xl font-bold text-azul">{precioFormateado(precio)}</span>
          <span className="text-sm text-gris-3"> / {periodo === 'anual' ? 'año' : 'mes'}</span>
        </div>
        {/* Espacio reservado SIEMPRE (haya o no ahorro) para alinear */}
        <div className="h-5 mt-1">
          {periodo === 'anual' && (
            <p className="text-xs text-verde font-semibold">
              Ahorras {precioFormateado(ahorroAnual(plan))} al año
            </p>
          )}
        </div>
      </div>

      <ul className="mt-5 space-y-2 flex-1">
        {FEATURES[plan].map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-gris-4">
            <Check size={14} className="text-verde mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full mt-6"
        variant={destacado ? 'primary' : 'outline'}
        onClick={activar}
        disabled={current}
        loading={loading}
      >
        {current ? 'Tu plan actual' : `Activar ${p.nombre}`}
      </Button>
    </div>
  )
}
