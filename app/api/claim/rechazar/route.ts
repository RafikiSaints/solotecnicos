import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const sb = createClient()
    const { data: { user: adminUser } } = await sb.auth.getUser()
    if (!adminUser || adminUser.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'no autorizado' }, { status: 403 })
    }

    const { claim_id, motivo } = await req.json()
    if (!claim_id) return NextResponse.json({ error: 'falta claim_id' }, { status: 400 })

    const svc = createServiceClient()
    await svc.from('claim_requests').update({
      estado: 'rechazada',
      motivo_rechazo: motivo || null,
      aprobada_por: adminUser.id,
      aprobada_en: new Date().toISOString(),
    }).eq('id', claim_id)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
