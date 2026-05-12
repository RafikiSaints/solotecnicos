import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const schema = z.object({
  user_id: z.string().uuid(),
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().nullable().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.parse(body)
    const sb = createServiceClient()

    // Si ya existe perfil para este user_id, retornar OK
    const { data: existente } = await sb.from('clientes').select('id').eq('user_id', parsed.user_id).maybeSingle()
    if (existente) {
      return NextResponse.json({ ok: true, ya_existia: true })
    }

    const { error } = await sb.from('clientes').insert({
      user_id: parsed.user_id,
      nombre: parsed.nombre,
      email: parsed.email,
      telefono: parsed.telefono || null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
