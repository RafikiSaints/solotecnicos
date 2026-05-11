import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import PlanPorVencer from '@/emails/PlanPorVencer'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const sb = createServiceClient()

  const en7dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const en6dias = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)

  const { data: tecnicos } = await sb.from('tecnicos')
    .select('id, nombre_empresa, email_publico, plan_vence_en')
    .neq('plan', 'gratis')
    .gte('plan_vence_en', en6dias.toISOString())
    .lt('plan_vence_en', en7dias.toISOString())

  let enviados = 0
  for (const t of tecnicos || []) {
    if (!t.email_publico) continue
    await enviarEmail({
      to: t.email_publico,
      subject: 'Tu plan vence en 7 días',
      react: PlanPorVencer({ tecnicoNombre: t.nombre_empresa, venceEn: t.plan_vence_en! }),
    })
    enviados++
  }
  return NextResponse.json({ ok: true, enviados })
}
