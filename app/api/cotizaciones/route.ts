import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import NuevaCotizacion from '@/emails/NuevaCotizacion'

const schema = z.object({
  tecnico_id: z.string().uuid(),
  cliente_nombre: z.string().min(2),
  cliente_email: z.string().email(),
  cliente_telefono: z.string().optional().nullable(),
  descripcion: z.string().min(20),
  urgencia: z.enum(['normal', 'urgente', '24h']).default('normal'),
  comuna_servicio: z.string().optional().nullable(),
  categoria_id: z.number().nullable().optional(),
  fotos_urls: z.array(z.string()).optional().nullable(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body._h) return NextResponse.json({ ok: true }) // honeypot
    const parsed = schema.parse(body)

    const sb = createServiceClient()
    const { data: cot, error } = await sb.from('cotizaciones').insert(parsed).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Registrar visita
    sb.from('visitas').insert({ tecnico_id: parsed.tecnico_id, tipo: 'cotizacion', hora: new Date().getHours() }).then(() => {})

    // Email al técnico
    const { data: tec } = await sb.from('tecnicos').select('email_publico, nombre_empresa, plan').eq('id', parsed.tecnico_id).single()
    if (tec?.email_publico) {
      await enviarEmail({
        to: tec.email_publico,
        subject: `Nueva cotización de ${parsed.cliente_nombre}`,
        react: NuevaCotizacion({ tecnicoNombre: tec.nombre_empresa, cliente: parsed.cliente_nombre, descripcion: parsed.descripcion, plan: tec.plan as any }),
      })
    }

    return NextResponse.json({ ok: true, id: cot.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
