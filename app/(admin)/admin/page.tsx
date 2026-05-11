import { createClient } from '@/lib/supabase/server'
import { MetricaCard } from '@/components/dashboard/EstadisticasGraficos'

export default async function AdminHome() {
  const sb = createClient()
  const [tec, resPend, certPend, susActivas] = await Promise.all([
    sb.from('tecnicos').select('id', { count: 'exact', head: true }),
    sb.from('resenas').select('id', { count: 'exact', head: true }).eq('aprobada', false),
    sb.from('tecnico_certificaciones').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    sb.from('suscripciones').select('monto').eq('estado', 'activo'),
  ])

  const mrr = (susActivas.data || []).reduce((a, s) => a + (s.monto || 0), 0)

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-display text-3xl text-azul">Panel administrativo</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricaCard label="Técnicos totales" valor={tec.count || 0} />
        <MetricaCard label="Reseñas pendientes" valor={resPend.count || 0} />
        <MetricaCard label="Certs. pendientes" valor={certPend.count || 0} />
        <MetricaCard label="MRR (estimado)" valor={`$${(mrr / 1000).toFixed(0)}K`} />
      </div>
    </div>
  )
}
