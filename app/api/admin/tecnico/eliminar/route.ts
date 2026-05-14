import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sql } from '@/lib/pg'

/**
 * Endpoint admin para ELIMINAR permanentemente un técnico.
 * Todas las tablas relacionadas tienen ON DELETE CASCADE en el schema,
 * así que se eliminan automáticamente: categorías, servicios, fotos,
 * reseñas, cotizaciones, pagos, visitas, sucursales, certificaciones.
 *
 * IMPORTANTE: no toca auth.users. Si el técnico tenía propietario
 * vinculado, el usuario queda con cuenta pero sin perfil de técnico.
 */
export async function DELETE(req: Request) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin' }, { status: 403 })
    }

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

    // Buscar nombre antes de borrar (para log)
    const rows = await sql`SELECT nombre_empresa FROM tecnicos WHERE id = ${id} LIMIT 1`
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Técnico no encontrado' }, { status: 404 })
    }

    await sql`DELETE FROM tecnicos WHERE id = ${id}`
    console.log(`[admin/tecnico/eliminar] borrado: ${rows[0].nombre_empresa} (${id})`)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[admin/tecnico/eliminar]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
