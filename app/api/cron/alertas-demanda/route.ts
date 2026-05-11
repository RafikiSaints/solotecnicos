import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import AlertaDemanda from '@/emails/AlertaDemanda'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const sb = createServiceClient()

  // Búsquedas de la última semana (aproximación usando tabla visitas)
  const haceUnaSem = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: visitas } = await sb.from('visitas')
    .select('region_visitante, tecnico_id')
    .gte('fecha', haceUnaSem)

  // Agrupar por región
  const conteoRegion: Record<string, number> = {}
  visitas?.forEach(v => {
    if (v.region_visitante) conteoRegion[v.region_visitante] = (conteoRegion[v.region_visitante] || 0) + 1
  })

  // Encontrar técnicos gratis en regiones con alta demanda (>5 búsquedas)
  const haceUnaSemDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const { data: tecnicosGratis } = await sb.from('tecnicos')
    .select('id, nombre_empresa, email_publico, regiones(nombre, slug)')
    .eq('plan', 'gratis')
    .eq('activo', true)
    .or(`ultima_alerta_demanda.is.null,ultima_alerta_demanda.lt.${haceUnaSemDate.toISOString()}`)

  let enviados = 0
  for (const t of tecnicosGratis || []) {
    const region = (t as any).regiones?.nombre
    const busquedasRegion = region ? conteoRegion[region] || 0 : 0
    if (busquedasRegion > 5 && t.email_publico) {
      await enviarEmail({
        to: t.email_publico,
        subject: `${busquedasRegion} personas buscaron técnicos en ${region}`,
        react: AlertaDemanda({ tecnicoNombre: t.nombre_empresa, region: region || 'tu región', busquedas: busquedasRegion }),
      })
      await sb.from('tecnicos').update({ ultima_alerta_demanda: new Date().toISOString() }).eq('id', t.id)
      enviados++
    }
  }
  return NextResponse.json({ ok: true, enviados })
}
