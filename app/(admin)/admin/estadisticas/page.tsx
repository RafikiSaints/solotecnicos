import { createClient } from '@/lib/supabase/server'
import { MetricaCard, GraficoBarras } from '@/components/dashboard/EstadisticasGraficos'

export default async function AdminEstadisticas() {
  const sb = createClient()
  const [tecnicos, suscripciones, regiones] = await Promise.all([
    sb.from('tecnicos').select('plan, region_id, regiones(nombre, slug)'),
    sb.from('suscripciones').select('monto, estado, plan'),
    sb.from('regiones').select('*'),
  ])

  const totalTecnicos = tecnicos.data?.length || 0
  const totalPro = tecnicos.data?.filter(t => t.plan === 'pro').length || 0
  const totalElite = tecnicos.data?.filter(t => t.plan === 'elite').length || 0
  const totalGratis = totalTecnicos - totalPro - totalElite

  const conversion = totalTecnicos > 0 ? (((totalPro + totalElite) / totalTecnicos) * 100).toFixed(1) : '0'

  const porRegion: Record<string, number> = {}
  tecnicos.data?.forEach((t: any) => {
    const r = t.regiones?.nombre
    if (r) porRegion[r] = (porRegion[r] || 0) + 1
  })
  const porRegionChart = Object.entries(porRegion).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => ({ fecha: k.slice(0, 12), valor: v }))

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="font-display text-3xl text-azul">Estadísticas globales</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricaCard label="Técnicos totales" valor={totalTecnicos} />
        <MetricaCard label="PRO" valor={totalPro} />
        <MetricaCard label="Elite" valor={totalElite} />
        <MetricaCard label="% Conversión" valor={`${conversion}%`} />
      </div>
      <GraficoBarras data={porRegionChart} label="Técnicos por región (top 10)" />
    </div>
  )
}
