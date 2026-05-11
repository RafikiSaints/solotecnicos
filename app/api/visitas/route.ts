import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { tecnico_id, tipo } = await req.json()
    if (!tecnico_id || !tipo) return NextResponse.json({ error: 'falta data' }, { status: 400 })
    const sb = createServiceClient()
    await sb.from('visitas').insert({ tecnico_id, tipo, hora: new Date().getHours() })

    // Incrementar contadores cacheados (best-effort)
    if (tipo === 'perfil') {
      await sb.rpc('increment_visitas', { tid: tecnico_id }).then(() => {}, () => {})
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
