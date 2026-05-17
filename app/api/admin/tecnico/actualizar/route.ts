import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sql } from '@/lib/pg'

/**
 * Endpoint ADMIN para actualizar CUALQUIER técnico, con TODOS los campos
 * incluidos los que el técnico no puede editar (google_rating, etc.).
 * Usa pg directo para bypass del schema cache de PostgREST.
 */
export async function PATCH(req: Request) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin' }, { status: 403 })
    }

    const body = await req.json()
    const { tecnico_id, ...rest } = body
    if (!tecnico_id) return NextResponse.json({ error: 'Falta tecnico_id' }, { status: 400 })

    // Whitelist amplia: admin puede tocar prácticamente todo
    const ALLOWED = [
      'nombre_empresa', 'nombre_contacto', 'descripcion', 'descripcion_corta',
      'region_id', 'comuna', 'direccion', 'lat', 'lng',
      'comunas_cobertura', 'etiquetas', 'sucursales_texto', 'video_url',
      'telefono', 'whatsapp', 'email_publico', 'sitio_web',
      'link_google_maps', 'link_google_business',
      'google_rating', 'google_total_resenas',
      'facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url',
      'horarios', 'atiende_24h', 'atiende_domicilio',
      'plan', 'plan_vence_en', 'verificado', 'destacado', 'activo',
    ]
    const allowed: Record<string, any> = {}
    for (const k of ALLOWED) {
      if (rest[k] !== undefined) allowed[k] = rest[k]
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    // Confirmar que el técnico existe
    const rows = await sql`SELECT id FROM tecnicos WHERE id = ${tecnico_id}::uuid LIMIT 1`
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Técnico no encontrado' }, { status: 404 })
    }

    await sql`
      UPDATE tecnicos
      SET ${sql(allowed)}, updated_at = now()
      WHERE id = ${tecnico_id}::uuid
    `

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[admin/tecnico/actualizar]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
