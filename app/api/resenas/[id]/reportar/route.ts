import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * El técnico marca una reseña de SU perfil como problemática.
 * No la oculta — solo la flag para que admin la revise.
 * Body: { motivo: string }
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const motivo: string = (body.motivo || '').toString().trim()
    if (!motivo || motivo.length < 10) {
      return NextResponse.json({ error: 'Indica el motivo (mínimo 10 caracteres)' }, { status: 400 })
    }
    if (motivo.length > 1000) {
      return NextResponse.json({ error: 'Motivo demasiado largo (máx 1000 caracteres)' }, { status: 400 })
    }

    // Validar que la reseña pertenezca a un técnico del usuario actual
    const svc = createServiceClient()
    const { data: resena, error: e1 } = await svc.from('resenas')
      .select('id, tecnico_id, tecnicos!inner(user_id)')
      .eq('id', params.id)
      .single()
    if (e1 || !resena) return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 })

    const ownerId = (resena as any).tecnicos?.user_id
    if (!ownerId) {
      return NextResponse.json({ error: 'La reseña no tiene perfil dueño vinculado' }, { status: 403 })
    }
    if (ownerId !== user.id) {
      return NextResponse.json({ error: 'Solo el técnico dueño del perfil puede reportar' }, { status: 403 })
    }

    const { error: e2 } = await svc.from('resenas')
      .update({
        reportada: true,
        reportada_motivo: motivo,
        reportada_en: new Date().toISOString(),
      })
      .eq('id', params.id)
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[resenas/reportar]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
