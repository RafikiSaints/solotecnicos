import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sql } from '@/lib/pg'

/**
 * PATCH /api/admin/categoria/[id]
 * Conexión directa a Postgres (NO usa PostgREST → no afectado por schema cache).
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

    // Sólo permitir ciertos campos
    const allowed: Record<string, any> = {}
    if (typeof body.nombre === 'string')      allowed.nombre = body.nombre
    if (typeof body.icono === 'string')       allowed.icono = body.icono
    if (typeof body.descripcion === 'string') allowed.descripcion = body.descripcion
    if (typeof body.destacada === 'boolean')  allowed.destacada = body.destacada
    if (typeof body.orden === 'number')       allowed.orden = body.orden

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    // SQL directo. La librería postgres-js arma el UPDATE seguro (sin SQL injection)
    const result = await sql`
      UPDATE categorias
      SET ${sql(allowed)}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, categoria: result[0] })
  } catch (e: any) {
    console.error('[admin/categoria patch]', e)
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const id = parseInt(params.id)
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    await sql`DELETE FROM categorias WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[admin/categoria delete]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
