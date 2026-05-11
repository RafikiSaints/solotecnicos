'use client'
import { useState } from 'react'
import { PlanCard } from '@/components/dashboard/PlanCard'
import { TogglePeriodo } from '@/components/planes/TogglePeriodo'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { planVigente, PLANES, precioFormateado } from '@/lib/planes'
import { formatearFecha } from '@/lib/utils'
import type { Tecnico, Suscripcion } from '@/types/database.types'

export function PlanGestion({ tecnico, email, suscripciones }: { tecnico: Tecnico; email: string; suscripciones: Suscripcion[] }) {
  const [periodo, setPeriodo] = useState<'mensual' | 'anual'>('mensual')
  const plan = planVigente(tecnico)
  const activa = suscripciones.find(s => s.estado === 'activo')

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-wide text-gris-3">Plan actual</span>
            <h2 className="font-display text-3xl text-azul mt-1">{PLANES[plan].nombre}</h2>
            {tecnico.plan_vence_en && plan !== 'gratis' && (
              <p className="text-sm text-gris-4 mt-1">Vence el {formatearFecha(tecnico.plan_vence_en)}</p>
            )}
          </div>
          {activa && <Badge tone="verde">Activa</Badge>}
        </div>
        {activa && (
          <div className="mt-4 pt-4 border-t border-borde grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-gris-3">Tipo</div>
              <div className="font-medium text-azul">{activa.tipo_pago}</div>
            </div>
            <div>
              <div className="text-xs text-gris-3">Monto</div>
              <div className="font-medium text-azul">{precioFormateado(activa.monto)}</div>
            </div>
            <div>
              <div className="text-xs text-gris-3">Próximo cobro</div>
              <div className="font-medium text-azul">{activa.proximo_cobro ? formatearFecha(activa.proximo_cobro) : '—'}</div>
            </div>
          </div>
        )}
      </div>

      {plan === 'gratis' ? (
        <div>
          <div className="flex justify-center mb-6">
            <TogglePeriodo periodo={periodo} onChange={setPeriodo} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <PlanCard tecnicoId={tecnico.id} email={email} plan="pro" periodo={periodo} destacado />
            <PlanCard tecnicoId={tecnico.id} email={email} plan="elite" periodo={periodo} />
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 className="font-display text-xl text-azul mb-2">Gestiona tu plan</h3>
          <p className="text-sm text-gris-4 mb-4">¿Quieres cambiar de plan o cancelar?</p>
          <div className="flex gap-2">
            <Button variant="outline">Cambiar plan</Button>
            <Button variant="ghost">Cancelar suscripción</Button>
          </div>
        </div>
      )}

      {suscripciones.length > 0 && (
        <div className="card">
          <h3 className="font-display text-xl text-azul mb-3">Historial de pagos</h3>
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
                  <td>{PLANES[s.plan].nombre}</td>
                  <td>{precioFormateado(s.monto)}</td>
                  <td><Badge tone={s.estado === 'activo' ? 'verde' : 'gris'}>{s.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
