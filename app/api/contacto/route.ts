import { NextResponse } from 'next/server'
import { z } from 'zod'
import { enviarEmail } from '@/lib/resend'

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  mensaje: z.string().min(20),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if ((body as any)._h) return NextResponse.json({ ok: true }) // honeypot
    const data = schema.parse(body)

    // Email al admin
    await enviarEmail({
      to: process.env.RESEND_FROM_EMAIL || 'hola@solotecnicos.cl',
      subject: `Mensaje de contacto: ${data.nombre}`,
      react: {
        type: 'div',
        props: {
          children: [
            { type: 'p', props: { children: `De: ${data.nombre} (${data.email})` } },
            { type: 'hr', props: {} },
            { type: 'p', props: { children: data.mensaje } },
          ],
        },
      } as any,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
