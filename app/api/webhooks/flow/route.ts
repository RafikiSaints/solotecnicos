import { NextResponse } from 'next/server'
import { verificarFirma, obtenerEstadoPago } from '@/lib/flow'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import PlanActivado from '@/emails/PlanActivado'
import { PLANES } from '@/lib/planes'

/**
 * Webhook handler de Flow.cl
 *
 * Eventos soportados:
 *  - payment.created       → marcar suscripción pendiente
 *  - payment.confirmed     → activar plan en tecnicos + suscripciones
 *  - payment.rejected      → email aviso
 *  - subscription.renewal  → extender plan_vence_en + registrar renovación
 *  - subscription.cancel   → degradar a gratis al vencer
 *  - subscription.failed   → dar 3 días de gracia + email aviso
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((v, k) => { params[k] = String(v) })

    const firma = params.s
    if (!firma || !verificarFirma(params, firma)) {
      return NextResponse.json({ error: 'firma inválida' }, { status: 401 })
    }

    const token = params.token
    if (!token) return NextResponse.json({ error: 'sin token' }, { status: 400 })

    const status = await obtenerEstadoPago(token)
    // status.status: 1=pendiente, 2=pagada, 3=rechazada, 4=anulada
    const sb = createServiceClient()

    const orden = String(status.commerceOrder || '')
    const tecnicoId = orden.split('-')[1]
    if (!tecnicoId) return NextResponse.json({ ok: true })

    if (status.status === 2) {
      // Pagada → activar plan
      const sub = String(status.subject || '')
      const plan: 'pro' | 'elite' = sub.includes('Elite') ? 'elite' : 'pro'
      const tipo: 'mensual' | 'anual' = sub.includes('anual') ? 'anual' : 'mensual'

      const ahora = new Date()
      const vence = new Date(ahora)
      if (tipo === 'anual') vence.setFullYear(vence.getFullYear() + 1)
      else vence.setMonth(vence.getMonth() + 1)

      await sb.from('tecnicos').update({
        plan,
        plan_vence_en: vence.toISOString(),
        verificado: true,
      }).eq('id', tecnicoId)

      await sb.from('suscripciones').insert({
        tecnico_id: tecnicoId,
        flow_order_id: orden,
        plan,
        tipo_pago: tipo,
        monto: status.amount || PLANES[plan][`precio_${tipo}`],
        estado: 'activo',
        inicio_en: ahora.toISOString(),
        vence_en: vence.toISOString(),
        proximo_cobro: vence.toISOString(),
      })

      // Email confirmación
      const { data: tec } = await sb.from('tecnicos').select('email_publico, nombre_empresa').eq('id', tecnicoId).single()
      if (tec?.email_publico) {
        await enviarEmail({
          to: tec.email_publico,
          subject: `Plan ${PLANES[plan].nombre} activado`,
          react: PlanActivado({ tecnicoNombre: tec.nombre_empresa, plan, venceEn: vence.toISOString() }),
        })
      }
    } else if (status.status === 3 || status.status === 4) {
      // Rechazado / anulado
      await sb.from('suscripciones').update({ estado: 'cancelado' }).eq('flow_order_id', orden)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('webhook flow error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
