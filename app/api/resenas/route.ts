import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmail, FROM_EMAIL } from '@/lib/resend'
import ResenaRecibida from '@/emails/ResenaRecibida'

const dim = z.number().min(1).max(5)
const schema = z.object({
  tecnico_id: z.string().uuid(),
  autor_nombre: z.string().min(2),
  autor_email: z.string().email().optional().nullable(),
  autor_user_id: z.string().uuid().optional().nullable(),
  titulo: z.string().optional().nullable(),
  comentario: z.string().min(5),
  rating_atencion: dim, rating_calidad: dim, rating_respuesta: dim,
  rating_resolucion: dim, rating_rapidez: dim, rating_precio: dim, rating_garantia: dim,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body._h) return NextResponse.json({ ok: true })
    const parsed = schema.parse(body)
    const sb = createServiceClient()
    // Si viene con user_id, la marcamos como "verificada" automáticamente
    const verificado = !!parsed.autor_user_id
    const { error } = await sb.from('resenas').insert({
      ...parsed,
      autor_verificado: verificado,
      aprobada: false, // siempre pasa por moderación admin
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Email al técnico avisando + email al admin para moderar
    try {
      const { data: tec } = await sb.from('tecnicos')
        .select('email_publico, nombre_empresa, slug')
        .eq('id', parsed.tecnico_id).single()

      const promedio = (
        parsed.rating_atencion + parsed.rating_calidad + parsed.rating_respuesta +
        parsed.rating_resolucion + parsed.rating_rapidez + parsed.rating_precio +
        parsed.rating_garantia
      ) / 7

      if (tec?.email_publico) {
        await enviarEmail({
          to: tec.email_publico,
          subject: `Nueva reseña de ${parsed.autor_nombre}`,
          react: ResenaRecibida({
            tecnicoNombre: tec.nombre_empresa,
            autor: parsed.autor_nombre,
            rating: promedio,
            comentario: parsed.comentario,
          }),
        })
      }

      // Email al admin para moderar (a la dirección de envío configurada)
      if (FROM_EMAIL && tec) {
        await enviarEmail({
          to: FROM_EMAIL,
          subject: `[Moderación] Nueva reseña pendiente — ${tec.nombre_empresa}`,
          react: ResenaRecibida({
            tecnicoNombre: `Admin (técnico: ${tec.nombre_empresa})`,
            autor: parsed.autor_nombre,
            rating: promedio,
            comentario: parsed.comentario,
          }),
        })
      }
    } catch (e) {
      console.warn('Email reseña falló:', e)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
