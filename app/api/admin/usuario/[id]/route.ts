import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * Editar y eliminar usuarios de Supabase Auth desde el panel admin.
 * - PATCH: actualiza email, nombre (metadata) y/o role.
 * - DELETE: elimina el usuario de auth.users (cascade: tecnico/cliente).
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin' }, { status: 403 })
    }

    const body = await req.json()
    const updates: any = {}
    if (typeof body.email === 'string' && body.email.trim()) updates.email = body.email.trim()
    if (typeof body.password === 'string' && body.password.length >= 6) updates.password = body.password
    if (typeof body.email_confirm === 'boolean') updates.email_confirm = body.email_confirm
    if (body.nombre !== undefined || body.role !== undefined) {
      // Mergear con metadata existente
      const svc = createServiceClient()
      const { data: existing } = await svc.auth.admin.getUserById(params.id)
      const meta = { ...(existing.user?.user_metadata || {}) }
      if (body.nombre !== undefined) meta.nombre = body.nombre || null
      if (body.role !== undefined) meta.role = body.role || null
      updates.user_metadata = meta
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    const svc = createServiceClient()
    const { data, error } = await svc.auth.admin.updateUserById(params.id, updates)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Sincronizar nombre en la tabla relacionada si aplica
    if (body.nombre !== undefined) {
      // Si es cliente → actualizar clientes.nombre
      const { data: cliente } = await svc.from('clientes').select('id').eq('user_id', params.id).maybeSingle()
      if (cliente) {
        await svc.from('clientes').update({ nombre: body.nombre || null }).eq('id', cliente.id)
      }
    }

    return NextResponse.json({ ok: true, user: data.user })
  } catch (e: any) {
    console.error('[admin/usuario PATCH]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin' }, { status: 403 })
    }
    if (user.id === params.id) {
      return NextResponse.json({ error: 'No podés borrarte a ti mismo' }, { status: 400 })
    }

    const svc = createServiceClient()
    const { error } = await svc.auth.admin.deleteUser(params.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[admin/usuario DELETE]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
