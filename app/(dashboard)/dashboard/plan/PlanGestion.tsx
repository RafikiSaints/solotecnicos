'use client'
import { useState } from 'react'
import { PlanCard } from '@/components/dashboard/PlanCard'
import { TogglePeriodo } from '@/components/planes/TogglePeriodo'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { planVigente, PLANES, precioFormateado } from '@/lib/planes'
import { formatearFecha } from '@/lib/utils'
import { ArrowRightLeft, Ban, Sparkles } from 'lucide-react'
import type { Tecnico, Suscripcion } from '@/types/database.types'

export function PlanGestion({ tecnico, email, suscripciones: ini }: { tecnico: Tecnico; email: string; suscripciones: Suscripcion[] }) {
  const [periodo, setPeriodo] = useState<'mensual' | 'anual'>('anual') // arranca en anual para sugerir el ahorro
  const [suscripciones, setSuscripciones] = useState(ini)
  const [openCambiar, setOpenCambiar] = useState(false)
  const [openCancelar, setOpenCancelar] = useState(false)
  const [cargando, setCargando] = useState(false)
  const push = useToast(s => s.push)
  const supabase = createClient()
  const plan = planVigente(tecnico)
  const activa = suscripciones.find(s => s.estado === 'activo')

  async function cancelarSuscripcion() {
    setCargando(true)
    // Marcar la suscripción como cancelada (pero mantener el plan hasta vencimiento)
    if (activa) {
      const { error } = await supabase.from('suscripciones').update({
        estado: 'cancelado',
        cancelado_en: new Date().toISOString(),
      }).eq('id', activa.id)
      if (!error) {
        setSuscripciones(suscripciones.map(s => s.id === activa.id ? { ...s, estado: 'cancelado', cancelado_en: new Date().toISOString() } : s))
        push('Suscripción cancelada. Mantienes el plan hasta su vencimiento.')
      } else {
        push(`Error: ${error.message}`, 'error')
      }
    }
    setCargando(false)
    setOpenCancelar(false)
  }

  return (
    <div className="space-y-8">
      {/* CARD ESTADO ACTUAL */}
      <div className="rounded-xl border-2 border-borde bg-white p-6 shadow-soft">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <span className="text-xs uppercase tracking-wide text-gris-3 font-semibold">Tu plan actual</span>
            <h2 className={`font-display text-4xl mt-1 font-extrabold ${plan === 'elite' ? 'text-oro' : plan === 'pro' ? 'text-azul-mid' : 'text-gris-4'}`}>
              {plan !== 'gratis' && <Sparkles className="inline mb-1 mr-2" size={28} />}
              {PLANES[plan].nombre}
            </h2>
            {tecnico.plan_vence_en && plan !== 'gratis' && (
              <p className="text-sm text-gris-4 mt-1">
                {activa?.estado === 'cancelado'
                  ? <>Activo hasta <strong>{formatearFecha(tecnico.plan_vence_en)}</strong> (no se renovará)</>
                  : <>Vence el <strong>{formatearFecha(tecnico.plan_vence_en)}</strong></>}
              </p>
            )}
          </div>
          {activa && (
            <Badge tone={activa.estado === 'cancelado' ? 'rojo' : 'verde'}>
              {activa.estado === 'cancelado' ? '🛑 Cancelada' : '✓ Activa'}
            </Badge>
          )}
        </div>

        {activa && (
          <div className="mt-5 pt-5 border-t border-borde grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-gris-3">Tipo</div>
              <div className="font-semibold text-azul capitalize">{activa.tipo_pago}</div>
            </div>
            <div>
              <div className="text-xs text-gris-3">Monto</div>
              <div className="font-semibold text-azul">{precioFormateado(activa.monto)}</div>
            </div>
            <div>
              <div className="text-xs text-gris-3">Próximo cobro</div>
              <div className="font-semibold text-azul">
                {activa.estado === 'cancelado' ? '—' : activa.proximo_cobro ? formatearFecha(activa.proximo_cobro) : '—'}
              </div>
            </div>
          </div>
        )}

        {plan !== 'gratis' && (
          <div className="mt-6 pt-5 border-t border-borde flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenCambiar(true)}>
              <ArrowRightLeft size={14} /> Cambiar de plan
            </Button>
            {activa?.estado === 'activo' && (
              <Button variant="ghost" size="sm" onClick={() => setOpenCancelar(true)} className="!text-rojo hover:!bg-rojo/5">
                <Ban size={14} /> Cancelar suscripción
              </Button>
            )}
          </div>
        )}
      </div>

      {/* SELECCIÓN DE PLAN (si gratis) o opción de upgrade */}
      {plan === 'gratis' && (
        <SeleccionDePlanes
          periodo={periodo}
          onPeriodo={setPeriodo}
          tecnico={tecnico}
          email={email}
        />
      )}

      {/* HISTORIAL */}
      {suscripciones.length > 0 && (
        <div className="card">
          <h3 className="font-display text-xl text-azul mb-3 font-bold">Historial de pagos</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gris-3 uppercase border-b border-borde">
                <th className="pb-2">Fecha</th>
                <th>Plan</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {suscripciones.map(s => (
                <tr key={s.id} className="border-b border-borde">
                  <td className="py-2">{formatearFecha(s.created_at)}</td>
                  <td>{PLANES[s.plan].nombre} <span className="text-xs text-gris-3">({s.tipo_pago})</span></td>
                  <td>{precioFormateado(s.monto)}</td>
                  <td>
                    <Badge tone={s.estado === 'activo' ? 'verde' : s.estado === 'cancelado' ? 'rojo' : 'gris'}>
                      {s.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CAMBIAR PLAN */}
      <Modal open={openCambiar} onClose={() => setOpenCambiar(false)} title="Cambiar de plan" size="lg">
        <p className="text-sm text-gris-4 mb-4">Elige el plan que quieras activar. El cambio se aplica al siguiente período.</p>
        <SeleccionDePlanes periodo={periodo} onPeriodo={setPeriodo} tecnico={tecnico} email={email} />
      </Modal>

      {/* MODAL CANCELAR */}
      <Modal open={openCancelar} onClose={() => setOpenCancelar(false)} title="¿Cancelar suscripción?">
        <div className="space-y-4">
          <p className="text-sm text-gris-4">
            Si cancelas, <strong>mantienes el plan {PLANES[plan].nombre} hasta el {tecnico.plan_vence_en ? formatearFecha(tecnico.plan_vence_en) : 'vencimiento'}</strong>.
          </p>
          <p className="text-sm text-gris-4">
            Después de esa fecha tu cuenta vuelve al plan Gratis. <strong>Tus datos, fotos y reseñas no se pierden</strong> — puedes reactivar el plan cuando quieras.
          </p>
          <div className="rounded-md bg-papel p-3 text-xs text-gris-3">
            <strong>Importante:</strong> Esta acción solo afecta la renovación. No te devolveremos el cobro del período actual.
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setOpenCancelar(false)}>No, mantener</Button>
            <Button variant="danger" onClick={cancelarSuscripcion} loading={cargando}>
              Sí, cancelar suscripción
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function SeleccionDePlanes({ periodo, onPeriodo, tecnico, email }: { periodo: 'mensual' | 'anual'; onPeriodo: (p: 'mensual' | 'anual') => void; tecnico: Tecnico; email: string }) {
  const ahorroPro = PLANES.pro.precio_mensual * 12 - PLANES.pro.precio_anual
  const ahorroElite = PLANES.elite.precio_mensual * 12 - PLANES.elite.precio_anual

  return (
    <div className="space-y-6">
      {/* Banner de promo anual */}
      <div className="rounded-xl bg-gradient-cool text-white p-5 flex items-center gap-4">
        <span className="text-3xl">🎁</span>
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold">Paga anual y ahorra 2 meses</h3>
          <p className="text-sm text-white/90">
            Plan Anual: solo {precioFormateado(PLANES.pro.precio_anual)} (PRO) — equivale a pagar 10 meses por 12.
          </p>
        </div>
      </div>

      {/* Toggle prominente */}
      <div className="flex justify-center">
        <TogglePeriodo periodo={periodo} onChange={onPeriodo} />
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          {periodo === 'anual' && (
            <div className="absolute -top-2 -right-2 z-10 bg-verde text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-md">
              AHORRAS {precioFormateado(ahorroPro)}
            </div>
          )}
          <PlanCard tecnicoId={tecnico.id} email={email} plan="pro" periodo={periodo} destacado current={tecnico.plan === 'pro'} />
        </div>
        <div className="relative">
          {periodo === 'anual' && (
            <div className="absolute -top-2 -right-2 z-10 bg-verde text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-md">
              AHORRAS {precioFormateado(ahorroElite)}
            </div>
          )}
          <PlanCard tecnicoId={tecnico.id} email={email} plan="elite" periodo={periodo} current={tecnico.plan === 'elite'} />
        </div>
      </div>
    </div>
  )
}
