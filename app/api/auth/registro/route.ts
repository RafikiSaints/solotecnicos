import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import Bienvenida from '@/emails/Bienvenida'

const schema = z.object({
  user_id: z.string().uuid(),
  nombre_empresa: z.string().min(2),
  telefono: z.string().optional().nullable(),
  email_publico: z.string().email().optional().nullable(),
  region_id: z.number().nullable().optional(),
  categoria_id: z.number().nullable().optional(),
})

/**
 * Crea el perfil de técnico desde el servidor (service_role salta RLS).
 * Envía email de bienvenida tras crear el perfil.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.parse(body)
    const sb = createServiceClient()

    // 1. Verificar que el user existe y no tiene perfil ya
    const { data: existente } = await sb.from('tecnicos').select('id').eq('user_id', parsed.user_id).maybeSingle()
    if (existente) {
      return NextResponse.json({ ok: true, tecnico_id: existente.id, ya_existia: true })
    }

    // 2. Insertar técnico
    const { categoria_id, ...rest } = parsed
    const { data: tecnico, error } = await sb.from('tecnicos').insert(rest).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // 3. Asignar categoría
    if (categoria_id && tecnico) {
      await sb.from('tecnico_categorias').insert({ tecnico_id: tecnico.id, categoria_id })
    }

    // 4. Email de bienvenida (best-effort, no falla si email falla)
    if (parsed.email_publico) {
      try {
        await enviarEmail({
          to: parsed.email_publico,
          subject: '¡Bienvenido a SoloTécnicos!',
          react: Bienvenida({ nombre: parsed.nombre_empresa }),
        })
      } catch (emailErr) {
        console.warn('Email bienvenida falló:', emailErr)
      }
    }

    return NextResponse.json({ ok: true, tecnico_id: tecnico.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
