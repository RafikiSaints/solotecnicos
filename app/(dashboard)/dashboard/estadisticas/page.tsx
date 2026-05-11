import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GraficoLinea, GraficoBarras, MetricaCard } from '@/components/dashboard/EstadisticasGraficos'
import { UpgradePrompt } from '@/components/ui/UpgradePrompt'
import { puedeHacer } from '@/lib/planes'

export default async function EstadisticasPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/registro-tecnico')

  if (!puedeHacer(tecnico, 'estadisticas')) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="font-display text-3xl text-azul mb-4">Estadísticas</h1>
        <UpgradePrompt feature="Métricas detalladas: visitas, contactos, posición en búsquedas, alertas de demanda. Disponible en PRO." />
      </div>
    )
  }

  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: visitas } = await sb.from('visitas').select('*').eq('tecnico_id', tecnico.id).gte('fecha', desde)

  const dias: { fecha: string; valor: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    dias.push({ fecha: d.slice(5), valor: visitas?.filter(v => v.fecha === d).length || 0 })
  }

  const porTipo = {
    perfil: visitas?.filter(v => v.tipo === 'perfil').length || 0,
    contacto: visitas?.filter(v => v.tipo === 'contacto').length || 0,
    whatsapp: visitas?.filter(v => v.tipo === 'whatsapp').length || 0,
    telefono: visitas?.filter(v => v.tipo === 'telefono').length || 0,
    cotizacion: visitas?.filter(v => v.tipo === 'cotizacion').length || 0,
  }
  const porTipoChart = Object.entries(porTipo).map(([k, v]) => ({ fecha: k, valor: v }))

  // Origen por región
  const regiones: Record<string, number> = {}
  visitas?.forEach(v => {
    if (v.region_visitante) regiones[v.region_visitante] = (regiones[v.region_visitante] || 0) + 1
  })

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="font-display text-3xl text-azul">Estadísticas</h1>
      <p className="text-gris-4 -mt-2">Últimos 30 días</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricaCard label="Visitas perfil" valor={porTipo.perfil} />
        <MetricaCard label="Clicks contacto" valor={porTipo.contacto + porTipo.whatsapp + porTipo.telefono} />
        <MetricaCard label="Cotizaciones" valor={porTipo.cotizacion} />
        <MetricaCard label="Total reseñas" valor={tecnico.total_resenas} />
      </div>

      <GraficoLinea data={dias} label="Visitas diarias" />
      <GraficoBarras data={porTipoChart} label="Tipo de acción" />

      <div className="card">
        <h4 className="font-display text-lg text-azul mb-3">Origen por región</h4>
        {Object.keys(regiones).length === 0 ? (
          <p className="text-sm text-gris-3">Sin datos de origen aún</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(regiones).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([reg, n]) => (
              <li key={reg} className="flex items-center gap-3">
                <span className="text-sm text-azul w-40">{reg}</span>
                <div className="flex-1 h-2 bg-papel rounded-full overflow-hidden">
                  <div className="h-full bg-azul" style={{ width: `${(n / Math.max(...Object.values(regiones))) * 100}%` }} />
                </div>
                <span className="text-sm text-gris-4 w-10 text-right">{n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
