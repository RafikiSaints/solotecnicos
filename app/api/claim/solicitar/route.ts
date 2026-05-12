import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmail, FROM_EMAIL } from '@/lib/resend'

const schema = z.object({
  tecnico_id: z.string().uuid(),
  nombre_solicitante: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().min(8),
  mensaje: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.parse(body)
    const sb = createServiceClient()

    // Verificar que el técnico existe y NO está reclamado
    const { data: tecnico } = await sb.from('tecnicos').select('id, user_id, nombre_empresa, telefono').eq('id', parsed.tecnico_id).single()
    if (!tecnico) {
      return NextResponse.json({ error: 'Técnico no encontrado' }, { status: 404 })
    }
    if (tecnico.user_id) {
      return NextResponse.json({ error: 'Este perfil ya está reclamado' }, { status: 400 })
    }

    // Verificar que no haya solicitud pendiente del mismo email
    const { data: existente } = await sb.from('claim_requests')
      .select('id').eq('tecnico_id', parsed.tecnico_id).eq('email', parsed.email).eq('estado', 'pendiente').maybeSingle()
    if (existente) {
      return NextResponse.json({ error: 'Ya enviaste una solicitud para este perfil. Te contactaremos pronto.' }, { status: 400 })
    }

    // Insertar solicitud
    const { error } = await sb.from('claim_requests').insert({
      tecnico_id: parsed.tecnico_id,
      nombre_solicitante: parsed.nombre_solicitante,
      email: parsed.email,
      telefono: parsed.telefono,
      mensaje: parsed.mensaje || null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Email al admin avisando de nueva solicitud
    if (FROM_EMAIL) {
      try {
        const url = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'
        await enviarEmail({
          to: FROM_EMAIL,
          subject: `[Claim] Nueva solicitud — ${tecnico.nombre_empresa}`,
          react: {
            type: 'div',
            props: {
              children: [
                { type: 'p', props: { children: `Nueva solicitud de reclamo para perfil: ${tecnico.nombre_empresa}` } },
                { type: 'p', props: { children: `De: ${parsed.nombre_solicitante} (${parsed.email})` } },
                { type: 'p', props: { children: `Tel: ${parsed.telefono}` } },
                { type: 'p', props: { children: `Tel registrado en perfil: ${tecnico.telefono || 'sin teléfono'}` } },
                { type: 'p', props: { children: `Mensaje: ${parsed.mensaje || '(ninguno)'}` } },
                { type: 'p', props: { children: ['Revisar en: ', { type: 'a', props: { href: `${url}/admin/claims`, children: `${url}/admin/claims` } }] } },
              ],
            },
          } as any,
        })
      } catch (e) {
        console.warn('Email admin falló:', e)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
