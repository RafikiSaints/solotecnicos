import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { cotizacion_id, contenido, tecnico_id } = await req.json()
  if (!cotizacion_id || !contenido) return NextResponse.json({ error: 'falta data' }, { status: 400 })
  const sb = createClient()
  const { error: e1 } = await sb.from('mensajes').insert({ cotizacion_id, contenido, remitente: 'tecnico', tecnico_id })
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 })

  await sb.from('cotizaciones').update({
    respuesta: contenido,
    estado: 'respondida',
    respondida_en: new Date().toISOString(),
  }).eq('id', cotizacion_id)

  return NextResponse.json({ ok: true })
}
