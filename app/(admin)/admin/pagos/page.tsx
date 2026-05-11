import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { precioFormateado, PLANES } from '@/lib/planes'
import { formatearFecha } from '@/lib/utils'
import { MetricaCard } from '@/components/dashboard/EstadisticasGraficos'

export default async function AdminPagos() {
  const sb = createClient()
  const { data: suscripciones } = await sb.from('suscripciones')
    .select('*, tecnicos(nombre_empresa)')
    .order('created_at', { ascending: false })
    .limit(100)

  const activas = suscripciones?.filter(s => s.estado === 'activo') || []
  const mrr = activas.reduce((a, s) => a + (s.tipo_pago === 'anual' ? s.monto / 12 : s.monto), 0)
  const totalIngresos = (suscripciones || []).filter(s => s.estado === 'activo' || s.estado === 'cancelado').reduce((a, s) => a + s.monto, 0)

  return (
    <div>
      <h1 className="font-display text-3xl text-azul mb-4">Pagos</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricaCard label="Suscripciones activas" valor={activas.length} />
        <MetricaCard label="MRR estimado" valor={precioFormateado(mrr)} />
        <MetricaCard label="Ingresos totales" valor={precioFormateado(totalIngresos)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gris-3 uppercase border-b border-borde">
            <tr><th className="pb-2">Técnico</th><th>Plan</th><th>Tipo</th><th>Monto</th><th>Estado</th><th>Vence</th></tr>
          </thead>
          <tbody>
            {suscripciones?.map((s: any) => (
              <tr key={s.id} className="border-b border-borde">
                <td className="py-2">{s.tecnicos?.nombre_empresa}</td>
                <td>{PLANES[s.plan as 'gratis' | 'pro' | 'elite'].nombre}</td>
                <td>{s.tipo_pago}</td>
                <td>{precioFormateado(s.monto)}</td>
                <td><Badge tone={s.estado === 'activo' ? 'verde' : s.estado === 'vencido' ? 'rojo' : 'gris'}>{s.estado}</Badge></td>
                <td>{s.vence_en ? formatearFecha(s.vence_en) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
