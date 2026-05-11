import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MetricaCard, GraficoBarras } from '@/components/dashboard/EstadisticasGraficos'
import { RadarRatings } from '@/components/dashboard/RadarRatings'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { planVigente } from '@/lib/planes'
import { tiempoTranscurrido, formatearFecha } from '@/lib/utils'

export default async function DashboardResumen() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')

  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/registro-tecnico')

  // últimos 30 días
  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [{ data: visitas }, { data: cotizaciones }] = await Promise.all([
    sb.from('visitas').select('fecha, tipo').eq('tecnico_id', tecnico.id).gte('fecha', desde),
    sb.from('cotizaciones').select('*').eq('tecnico_id', tecnico.id).order('created_at', { ascending: false }).limit(3),
  ])

  // Agrupar visitas por día (últimos 14 días para mini gráfico)
  const dias14: { fecha: string; valor: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const count = visitas?.filter(v => v.fecha === d).length || 0
    dias14.push({ fecha: d.slice(5), valor: count })
  }

  const totalVisitas = visitas?.length || 0
  const contactos = visitas?.filter(v => ['telefono', 'whatsapp', 'contacto'].includes(v.tipo)).length || 0
  const cotizCount = visitas?.filter(v => v.tipo === 'cotizacion').length || 0
  const plan = planVigente(tecnico)
  const venceEn = tecnico.plan_vence_en ? new Date(tecnico.plan_vence_en) : null
  const diasRest = venceEn ? Math.ceil((venceEn.getTime() - Date.now()) / 86400000) : null

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-3xl text-azul">Hola, {tecnico.nombre_contacto || tecnico.nombre_empresa.split(' ')[0]} 👋</h1>
        <p className="text-gris-4">Resumen de tu perfil en los últimos 30 días</p>
      </div>

      {/* Alertas plan */}
      {diasRest !== null && diasRest <= 7 && diasRest > 0 && (
        <div className="rounded-lg border border-oro/40 bg-oro/10 p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <strong className="text-azul">Tu plan {plan.toUpperCase()} vence en {diasRest} día{diasRest !== 1 ? 's' : ''}</strong>
            <p className="text-sm text-gris-4">Renueva antes del {formatearFecha(venceEn!)} para no perder los beneficios.</p>
          </div>
          <Link href="/dashboard/plan"><Button size="sm">Renovar</Button></Link>
        </div>
      )}
      {diasRest !== null && diasRest <= 0 && (
        <div className="rounded-lg border border-rojo/40 bg-rojo/10 p-4 flex items-center gap-3">
          <span className="text-2xl">🚫</span>
          <div className="flex-1">
            <strong className="text-rojo">Tu plan venció — perdiste los beneficios premium</strong>
            <p className="text-sm text-gris-4">Tu cuenta está en plan Gratis. Renueva para recuperar tus funciones.</p>
          </div>
          <Link href="/dashboard/plan"><Button size="sm">Reactivar</Button></Link>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricaCard label="Visitas al perfil" valor={totalVisitas} />
        <MetricaCard label="Contactos" valor={contactos} />
        <MetricaCard label="Cotizaciones" valor={cotizCount} />
        <MetricaCard label="Rating" valor={(tecnico.rating_promedio || 0).toFixed(1)} />
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <GraficoBarras data={dias14} label="Visitas — últimos 14 días" />
        <div className="card">
          <h4 className="text-sm font-medium text-gris-3 mb-1">Rating por dimensión</h4>
          <RadarRatings tecnico={tecnico} />
        </div>
      </div>

      {/* Cotizaciones recientes */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display text-xl text-azul">Cotizaciones recientes</h3>
          <Link href="/dashboard/mensajes" className="text-xs text-azul hover:underline">Ver todas</Link>
        </div>
        {!cotizaciones?.length ? (
          <p className="text-sm text-gris-3 text-center py-4">Sin cotizaciones aún</p>
        ) : (
          <ul className="space-y-2">
            {cotizaciones.map(c => (
              <li key={c.id} className="flex items-center gap-3 p-3 rounded border border-borde">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-azul text-sm">{c.cliente_nombre}</strong>
                    <Badge tone={c.estado === 'pendiente' ? 'rojo' : 'gris'}>{c.estado}</Badge>
                  </div>
                  <p className="text-xs text-gris-4 line-clamp-1">{c.descripcion}</p>
                </div>
                <span className="text-xs text-gris-3">{tiempoTranscurrido(c.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* CTA upgrade si gratis */}
      {plan === 'gratis' && (
        <div className="rounded-xl bg-gradient-to-br from-oro/10 to-rojo/10 border-2 border-oro/30 p-6">
          <h3 className="font-display text-xl text-azul mb-1">Podrías recibir hasta 3x más contactos</h3>
          <p className="text-sm text-gris-4 mb-4">Los técnicos PRO reciben en promedio 3x más cotizaciones que los planes gratis. Desbloquea WhatsApp visible, estadísticas, agenda y más.</p>
          <Link href="/dashboard/plan"><Button>Ver planes →</Button></Link>
        </div>
      )}
    </div>
  )
}
