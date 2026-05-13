import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * PATCH /api/admin/categoria/[id]
 * Actualiza una categoría desde el servidor con service_role.
 * Esto BYPASS el schema cache del cliente JS de Supabase
 * (útil después de agregar columnas nuevas).
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar admin
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    // Sanitizar: solo permitir ciertos campos
    const updates: any = {}
    if (typeof body.nombre === 'string') updates.nombre = body.nombre
    if (typeof body.icono === 'string') updates.icono = body.icono
    if (typeof body.descripcion === 'string') updates.descripcion = body.descripcion
    if (typeof body.destacada === 'boolean') updates.destacada = body.destacada
    if (typeof body.orden === 'number') updates.orden = body.orden

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    const svc = createServiceClient()
    // Usamos función SQL que bypasea el schema cache de PostgREST
    const { data, error } = await svc.rpc('admin_update_categoria', {
      p_id: parseInt(params.id),
      p_nombre: updates.nombre ?? null,
      p_icono: updates.icono ?? null,
      p_descripcion: updates.descripcion ?? null,
      p_destacada: updates.destacada ?? null,
      p_orden: updates.orden ?? null,
    })

    if (error) {
      console.error('[admin/categoria] rpc error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, categoria: data })
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
