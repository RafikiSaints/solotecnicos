import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MetricaCard } from '@/components/dashboard/EstadisticasGraficos'
import { precioFormateado } from '@/lib/planes'

export default async function AdminHome() {
  const sb = createServiceClient()
  const [tec, resPend, certPend, susActivas, totalIngresos] = await Promise.all([
    sb.from('tecnicos').select('id', { count: 'exact', head: true }),
    sb.from('resenas').select('id', { count: 'exact', head: true }).eq('aprobada', false),
    sb.from('tecnico_certificaciones').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    sb.from('suscripciones').select('monto, tipo_pago, estado'),
    sb.from('suscripciones').select('monto').in('estado', ['activo', 'cancelado', 'vencido']),
  ])

  // MRR (Monthly Recurring Revenue) = ingresos mensuales recurrentes
  // Convertimos anuales a equivalente mensual (anual / 12)
  const activas = (susActivas.data || []).filter(s => s.estado === 'activo')
  const mrr = activas.reduce((sum, s) => {
    if (s.tipo_pago === 'anual') return sum + s.monto / 12
    return sum + s.monto
  }, 0)
  const ingresosTotales = (totalIngresos.data || []).reduce((sum, s) => sum + s.monto, 0)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl text-azul font-bold">Panel administrativo</h1>
        <p className="text-sm text-gris-3">Visión general de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricaCard label="Técnicos totales" valor={tec.count || 0} />
        <MetricaCard label="Reseñas pendientes" valor={resPend.count || 0} />
        <MetricaCard label="Certificaciones pendientes" valor={certPend.count || 0} />
        <MetricaCard label="Suscripciones activas" valor={activas.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gris-3 font-semibold uppercase">MRR (estimado)</span>
            <span className="text-[10px] text-azul-mid bg-azul-mid/10 px-2 py-0.5 rounded-full">Métrica clave SaaS</span>
          </div>
          <div className="font-display text-4xl font-bold text-azul mt-2">{precioFormateado(Math.round(mrr))}</div>
          <p className="text-xs text-gris-4 mt-2">
            <strong>MRR (Monthly Recurring Revenue)</strong> = ingresos mensuales recurrentes. Suma los planes mensuales + ¼ del anual. Es la métrica clave para medir crecimiento de un negocio SaaS.
          </p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gris-3 font-semibold uppercase">Ingresos totales</span>
            <span className="text-[10px] text-verde bg-verde/10 px-2 py-0.5 rounded-full">Histórico</span>
          </div>
          <div className="font-display text-4xl font-bold text-azul mt-2">{precioFormateado(ingresosTotales)}</div>
          <p className="text-xs text-gris-4 mt-2">
            Suma de todos los pagos exitosos desde el inicio (activos + cancelados + vencidos).
          </p>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="card">
        <h3 className="font-display text-xl text-azul mb-3 font-bold">Acciones rápidas</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {((resPend.count || 0) > 0) && (
            <Link href="/admin/resenas" className="flex items-center gap-3 p-3 rounded-md border border-rojo/30 bg-rojo/5 hover:bg-rojo/10">
              <span className="text-2xl">⭐</span>
              <div>
                <strong className="text-azul block">{resPend.count} reseñas pendientes</strong>
                <span className="text-xs text-gris-4">Modera y aprueba</span>
              </div>
            </Link>
          )}
          {((certPend.count || 0) > 0) && (
            <Link href="/admin/certificaciones" className="flex items-center gap-3 p-3 rounded-md border border-oro/30 bg-oro/5 hover:bg-oro/10">
              <span className="text-2xl">🏅</span>
              <div>
                <strong className="text-azul block">{certPend.count} certificaciones pendientes</strong>
                <span className="text-xs text-gris-4">Revisa documentos</span>
              </div>
            </Link>
          )}
          <Link href="/admin/tecnicos" className="flex items-center gap-3 p-3 rounded-md border border-borde hover:bg-papel">
            <span className="text-2xl">👥</span>
            <div>
              <strong className="text-azul block">Gestionar técnicos</strong>
              <span className="text-xs text-gris-4">{tec.count || 0} registrados</span>
            </div>
          </Link>
          <Link href="/admin/estadisticas" className="flex items-center gap-3 p-3 rounded-md border border-borde hover:bg-papel">
            <span className="text-2xl">📊</span>
            <div>
              <strong className="text-azul block">Estadísticas globales</strong>
              <span className="text-xs text-gris-4">Crecimiento y conversión</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
