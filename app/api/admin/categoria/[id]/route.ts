import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * PATCH /api/admin/categoria/[id]
 * Usa funciones SQL con nombres nuevos (cat_set_destacada, cat_update_full)
 * para evitar el schema cache de PostgREST que se queda pegado tras agregar columnas.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const id = parseInt(params.id)
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const svc = createServiceClient()

    // CASO 1: solo cambio de destacada → usar función específica más rápida
    const soloDestacada = Object.keys(body).length === 1 && typeof body.destacada === 'boolean'
    if (soloDestacada) {
      const { error } = await svc.rpc('cat_set_destacada', {
        p_id: id,
        p_value: body.destacada,
      })
      if (error) {
        console.error('[cat_set_destacada]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ ok: true, destacada: body.destacada })
    }

    // CASO 2: cambios múltiples → función completa
    const { error } = await svc.rpc('cat_update_full', {
      p_id: id,
      p_nombre: typeof body.nombre === 'string' ? body.nombre : null,
      p_icono: typeof body.icono === 'string' ? body.icono : null,
      p_descripcion: typeof body.descripcion === 'string' ? body.descripcion : null,
      p_destacada: typeof body.destacada === 'boolean' ? body.destacada : null,
    })

    if (error) {
      console.error('[cat_update_full]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/categoria/[id]
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const svc = createServiceClient()
    const { error } = await svc.from('categorias').delete().eq('id', params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
