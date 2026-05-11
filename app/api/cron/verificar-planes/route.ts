import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Protección con CRON_SECRET (Vercel envía Authorization: Bearer <secret>)
function autorizado(req: Request) {
  const auth = req.headers.get('authorization') || ''
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const sb = createServiceClient()
  // Llamada a función SQL `verificar_planes_vencidos`
  await sb.rpc('verificar_planes_vencidos').then(() => {}, () => {})
  // Fallback manual si la RPC no existe
  await sb.from('tecnicos').update({
    plan: 'gratis',
    verificado: false,
    destacado: false,
  }).neq('plan', 'gratis').lt('plan_vence_en', new Date().toISOString())

  await sb.from('suscripciones').update({ estado: 'vencido' })
    .eq('estado', 'activo').lt('vence_en', new Date().toISOString())

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() })
}
