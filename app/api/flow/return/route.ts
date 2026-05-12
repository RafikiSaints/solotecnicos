import { NextResponse } from 'next/server'
import { obtenerEstadoPago } from '@/lib/flow'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmail } from '@/lib/resend'
import PlanActivado from '@/emails/PlanActivado'
import { PLANES } from '@/lib/planes'

/**
 * Endpoint de retorno de Flow.
 * Flow hace POST/GET aquí cuando el usuario vuelve del pago.
 * Verifica el estado, activa el plan si corresponde, y redirige al dashboard.
 */
async function handle(req: Request) {
  const url = new URL(req.url)
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://solotecnicos.cl'

  let token = url.searchParams.get('token')
  // Si vino por POST con form data, también revisar el body
  if (!token && req.method === 'POST') {
    try {
      const form = await req.formData()
      token = String(form.get('token') || '')
    } catch {}
  }

  if (!token) {
    console.warn('[flow/return] sin token, redirigiendo al dashboard')
    return NextResponse.redirect(`${base}/dashboard/plan?error=sin-token`, 303)
  }

  try {
    const status = await obtenerEstadoPago(token)
    console.log('[flow/return] status:', { code: status.status, orden: status.commerceOrder })

    if (status.status !== 2) {
      // No pagado / rechazado
      return NextResponse.redirect(`${base}/dashboard/plan?error=pago-no-confirmado`, 303)
    }

    // Pagado → activar plan
    const orden = String(status.commerceOrder || '')
    const tecShort = orden.split('-')[1]
    if (!tecShort) {
      return NextResponse.redirect(`${base}/dashboard/plan?error=orden-invalida`, 303)
    }

    const sb = createServiceClient()
    const { data: tecnicos } = await sb.from('tecnicos').select('id, nombre_empresa, email_publico, plan')
    const tecnico = tecnicos?.find(t => t.id.replace(/-/g, '').startsWith(tecShort))
    if (!tecnico) {
      console.error('[flow/return] técnico no encontrado para', tecShort)
      return NextResponse.redirect(`${base}/dashboard/plan?error=tecnico-no-encontrado`, 303)
    }

    const sub = String(status.subject || '')
    const plan: 'pro' | 'elite' = sub.toLowerCase().includes('elite') ? 'elite' : 'pro'
    const tipo: 'mensual' | 'anual' = sub.toLowerCase().includes('anual') ? 'anual' : 'mensual'

    const ahora = new Date()
    const vence = new Date(ahora)
    if (tipo === 'anual') vence.setFullYear(vence.getFullYear() + 1)
    else vence.setMonth(vence.getMonth() + 1)

    // Idempotente: si ya está activo, no duplicar
    const yaActivo = tecnico.plan === plan
    if (!yaActivo) {
      await sb.from('tecnicos').update({
        plan,
        plan_vence_en: vence.toISOString(),
        verificado: true,
      }).eq('id', tecnico.id)

      await sb.from('suscripciones').insert({
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
        } catch (e) {
          console.warn('[flow/return] email falló', e)
        }
      }

      console.log('[flow/return] ✅ plan', plan, 'activado para', tecnico.nombre_empresa)
    } else {
      console.log('[flow/return] plan ya estaba activo, skip')
    }

    // Redirect a página de éxito (303 fuerza GET, evita el 405)
    return NextResponse.redirect(`${base}/dashboard/plan?ok=1`, 303)
  } catch (e: any) {
    console.error('[flow/return] error:', e)
    return NextResponse.redirect(`${base}/dashboard/plan?error=${encodeURIComponent(e.message || 'error')}`, 303)
  }
}

export async function GET(req: Request)  { return handle(req) }
export async function POST(req: Request) { return handle(req) }
