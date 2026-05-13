import { createServiceClient } from '@/lib/supabase/server'
import { PagosTable } from './PagosTable'
import { precioFormateado, PLANES } from '@/lib/planes'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPagos() {
  const sb = createServiceClient()
  const { data: suscripciones } = await sb.from('suscripciones')
    .select('*, tecnicos(nombre_empresa, slug)')
    .order('created_at', { ascending: false })

  const todas = suscripciones || []
  const activas = todas.filter((s: any) => s.estado === 'activo')
  const mrr = activas.reduce((sum: number, s: any) => sum + (s.tipo_pago === 'anual' ? s.monto / 12 : s.monto), 0)
  const totalIngresos = todas
    .filter((s: any) => ['activo', 'cancelado', 'vencido'].includes(s.estado))
    .reduce((sum: number, s: any) => sum + s.monto, 0)

  // Estadísticas mensuales (últimos 6 meses)
  const meses: { mes: string; total: number }[] = []
  const ahora = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() - i + 1, 0)
    const mesStr = d.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
    const total = todas
      .filter((s: any) => {
        const created = new Date(s.created_at)
        return created >= d && created <= finMes
      })
      .reduce((sum: number, s: any) => sum + s.monto, 0)
    meses.push({ mes: mesStr, total })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-azul font-bold">Pagos y suscripciones</h1>
        <p className="text-sm text-gris-3">{todas.length} transacciones en total</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metrica label="Suscripciones activas" valor={activas.length} />
        <Metrica label="MRR estimado" valor={precioFormateado(Math.round(mrr))} subtitulo="ingresos mensuales recurrentes" />
        <Metrica label="Ingresos totales" valor={precioFormateado(totalIngresos)} subtitulo="histórico" />
        <Metrica label="ARR proyectado" valor={precioFormateado(Math.round(mrr * 12))} subtitulo="MRR × 12" />
      </div>

      {/* Gráfico simple por mes */}
      {meses.some(m => m.total > 0) && (
        <div className="card">
          <h3 className="font-display text-lg text-azul font-bold mb-3">Ingresos últimos 6 meses</h3>
          <div className="flex items-end gap-2 h-32">
            {meses.map(m => {
              const max = Math.max(...meses.map(x => x.total), 1)
              const h = (m.total / max) * 100
              return (
                <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-gris-3">{precioFormateado(m.total)}</div>
                  <div className="w-full bg-azul-mid rounded-t" style={{ height: `${Math.max(h, 5)}%` }} />
                  <div className="text-[10px] text-gris-4 capitalize">{m.mes}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <PagosTable suscripciones={todas as any} />
    </div>
  )
}

function Metrica({ label, valor, subtitulo }: { label: string; valor: string | number; subtitulo?: string }) {
  return (
    <div className="card">
      <div className="text-xs text-gris-3 font-semibold uppercase">{label}</div>
      <div className="font-display text-2xl font-bold text-azul mt-1">{valor}</div>
      {subtitulo && <div className="text-[11px] text-gris-3 mt-1">{subtitulo}</div>}
    </div>
  )
}
