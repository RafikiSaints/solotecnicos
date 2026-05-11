import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'

const dim = z.number().min(1).max(5)
const schema = z.object({
  tecnico_id: z.string().uuid(),
  autor_nombre: z.string().min(2),
  autor_email: z.string().email().optional().nullable(),
  titulo: z.string().optional().nullable(),
  comentario: z.string().min(30),
  rating_atencion: dim, rating_calidad: dim, rating_respuesta: dim,
  rating_resolucion: dim, rating_rapidez: dim, rating_precio: dim, rating_garantia: dim,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body._h) return NextResponse.json({ ok: true })
    const parsed = schema.parse(body)
    const sb = createServiceClient()
    const { error } = await sb.from('resenas').insert({ ...parsed, aprobada: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
