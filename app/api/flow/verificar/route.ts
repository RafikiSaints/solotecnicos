import { NextResponse } from 'next/server'
import { obtenerEstadoPago } from '@/lib/flow'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import PlanActivado from '@/emails/PlanActivado'
import { PLANES } from '@/lib/planes'

/**
 * Endpoint para verificar manualmente un pago de Flow.
 * Útil cuando el webhook falló y el plan no se activó.
 * Usuario logueado → consulta Flow → activa plan si está pagado.
 */
export async function POST(req: Request) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'no autenticado' }, { status: 401 })

    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: 'falta token' }, { status: 400 })

    const status = await obtenerEstadoPago(token)
    if (status.status !== 2) {
      return NextResponse.json({
        ok: false,
        statusCode: status.status,
        message: 'El pago no está confirmado'
      })
    }

    // Activar plan
    const svc = createServiceClient()
    const { data: tecnico } = await svc.from('tecnicos').select('*').eq('user_id', user.id).single()
    if (!tecnico) return NextResponse.json({ error: 'sin perfil' }, { status: 404 })

    const sub = String(status.subject || '')
    const plan: 'pro' | 'elite' = sub.toLowerCase().includes('elite') ? 'elite' : 'pro'
    const tipo: 'mensual' | 'anual' = sub.toLowerCase().includes('anual') ? 'anual' : 'mensual'

    const ahora = new Date()
    const vence = new Date(ahora)
    if (tipo === 'anual') vence.setFullYear(vence.getFullYear() + 1)
    else vence.setMonth(vence.getMonth() + 1)

    await svc.from('tecnicos').update({
      plan,
      plan_vence_en: vence.toISOString(),
      verificado: true,
    }).eq('id', tecnico.id)

    await svc.from('suscripciones').insert({
      tecnico_id: tecnico.id,
      flow_order_id: String(status.commerceOrder || ''),
      plan,
      tipo_pago: tipo,
      monto: status.amount || PLANES[plan][`precio_${tipo}`],
      estado: 'activo',
      inicio_en: ahora.toISOString(),
      vence_en: vence.toISOString(),
      proximo_cobro: vence.toISOString(),
    })

    if (tecnico.email_publico) {
      try {
        await enviarEmail({
          to: tecnico.email_publico,
          subject: `Plan ${PLANES[plan].nombre} activado`,
          react: PlanActivado({
            tecnicoNombre: tecnico.nombre_empresa,
            plan,
            venceEn: vence.toISOString(),
          }),
        })
      } catch {}
    }

    return NextResponse.json({ ok: true, plan, venceEn: vence.toISOString() })
  } catch (e: any) {
    console.error('[flow/verificar] error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
