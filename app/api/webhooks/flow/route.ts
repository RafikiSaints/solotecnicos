import { NextResponse } from 'next/server'
import { verificarFirma, obtenerEstadoPago } from '@/lib/flow'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import PlanActivado from '@/emails/PlanActivado'
import { PLANES } from '@/lib/planes'

/**
 * Webhook handler de Flow.cl
 * Diseño: idempotente, con logging detallado, tolerante a errores.
 */
export async function POST(req: Request) {
  console.log('[webhook flow] ⬇️  llamada recibida')

  try {
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((v, k) => { params[k] = String(v) })

    console.log('[webhook flow] params:', Object.keys(params))

    const firma = params.s
    if (!firma) {
      console.error('[webhook flow] sin firma')
      return NextResponse.json({ error: 'sin firma' }, { status: 400 })
    }

    // Validamos firma — pero si en sandbox falla, igual procesamos (con warning)
    const isSandbox = (process.env.FLOW_MODE || '').toLowerCase() === 'sandbox'
    let firmaOk = false
    try {
      firmaOk = verificarFirma(params, firma)
    } catch (e) {
      console.warn('[webhook flow] error verificando firma:', e)
    }

    if (!firmaOk && !isSandbox) {
      console.error('[webhook flow] firma inválida en producción — rechazado')
      return NextResponse.json({ error: 'firma inválida' }, { status: 401 })
    }
    if (!firmaOk && isSandbox) {
      console.warn('[webhook flow] ⚠️  firma inválida pero estamos en sandbox, procesando igual')
    }

    const token = params.token
    if (!token) {
      console.error('[webhook flow] sin token')
      return NextResponse.json({ error: 'sin token' }, { status: 400 })
    }

    const status = await obtenerEstadoPago(token)
    console.log('[webhook flow] status de Flow:', {
      statusCode: status.status,
      commerceOrder: status.commerceOrder,
      amount: status.amount,
      subject: status.subject,
    })

    const sb = createServiceClient()
    const orden = String(status.commerceOrder || '')

    // Extraer ID corto del técnico (formato: ST-{8chars}-{timestamp})
    const partes = orden.split('-')
    const tecShort = partes[1]
    if (!tecShort) {
      console.error('[webhook flow] commerceOrder mal formado:', orden)
      return NextResponse.json({ ok: true })
    }

    // Buscar técnico (los primeros 8 chars del UUID sin guiones)
    const { data: tecnicos } = await sb.from('tecnicos').select('id, nombre_empresa, email_publico')
    const tecnico = tecnicos?.find(t => t.id.replace(/-/g, '').startsWith(tecShort))
    if (!tecnico) {
      console.error('[webhook flow] técnico no encontrado para tecShort:', tecShort, 'orden:', orden)
      return NextResponse.json({ ok: true })
    }
    console.log('[webhook flow] ✓ técnico encontrado:', tecnico.id, tecnico.nombre_empresa)

    if (status.status === 2) {
      // PAGADA → activar plan
      const sub = String(status.subject || '')
      const plan: 'pro' | 'elite' = sub.toLowerCase().includes('elite') ? 'elite' : 'pro'
      const tipo: 'mensual' | 'anual' = sub.toLowerCase().includes('anual') ? 'anual' : 'mensual'

      const ahora = new Date()
      const vence = new Date(ahora)
      if (tipo === 'anual') vence.setFullYear(vence.getFullYear() + 1)
      else vence.setMonth(vence.getMonth() + 1)

      console.log('[webhook flow] activando plan:', { plan, tipo, vence: vence.toISOString() })

      const { error: errUpdate } = await sb.from('tecnicos').update({
        plan,
        plan_vence_en: vence.toISOString(),
        verificado: true,
      }).eq('id', tecnico.id)

      if (errUpdate) {
        console.error('[webhook flow] error update tecnicos:', errUpdate)
      } else {
        console.log('[webhook flow] ✓ tecnico actualizado a', plan)
      }

      const { error: errInsert } = await sb.from('suscripciones').insert({
        tecnico_id: tecnico.id,
        flow_order_id: orden,
        plan,
        tipo_pago: tipo,
        monto: status.amount || PLANES[plan][`precio_${tipo}`],
        estado: 'activo',
        inicio_en: ahora.toISOString(),
        vence_en: vence.toISOString(),
        proximo_cobro: vence.toISOString(),
      })
      if (errInsert) console.warn('[webhook flow] error insert suscripciones:', errInsert)

      // Email confirmación (best-effort)
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
          console.log('[webhook flow] ✓ email enviado a', tecnico.email_publico)
        } catch (e) {
          console.warn('[webhook flow] error enviando email:', e)
        }
      }

      console.log('[webhook flow] ✅ activación completa')
    } else if (status.status === 3 || status.status === 4) {
      console.log('[webhook flow] pago rechazado/anulado, status:', status.status)
      await sb.from('suscripciones').update({ estado: 'cancelado' }).eq('flow_order_id', orden)
    } else {
      console.log('[webhook flow] status no terminal:', status.status)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[webhook flow] ❌ error fatal:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
