import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sql } from '@/lib/pg'

/**
 * Endpoint para actualizar perfil de técnico desde el dashboard.
 * Usa pg directo (bypass schema cache).
 */
export async function PATCH(req: Request) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const body = await req.json()

    // Whitelist de campos editables por el técnico.
    // OJO: google_rating y google_total_resenas NO están permitidos (solo admin).
    const allowed: Record<string, any> = {}
    const FIELDS = [
      'nombre_empresa', 'nombre_contacto', 'descripcion', 'descripcion_corta',
      'region_id', 'comuna', 'direccion', 'lat', 'lng',
      'comunas_cobertura', 'etiquetas', 'sucursales_texto', 'video_url',
      'telefono', 'whatsapp', 'email_publico', 'sitio_web',
      'link_google_maps', 'link_google_business',
      'facebook_url', 'instagram_url', 'youtube_url', 'tiktok_url',
      'horarios', 'atiende_24h', 'atiende_domicilio',
    ]
    for (const k of FIELDS) {
      if (body[k] !== undefined) allowed[k] = body[k]
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    // Verificar que el técnico pertenece al usuario (cast explícito a uuid)
    const owner = await sql`
      SELECT id FROM tecnicos WHERE user_id = ${user.id}::uuid LIMIT 1
    `
    if (owner.length === 0) {
      return NextResponse.json({ error: 'Sin perfil de técnico' }, { status: 403 })
    }

    const result = await sql`
      UPDATE tecnicos
      SET ${sql(allowed)}, updated_at = now()
      WHERE user_id = ${user.id}::uuid
      RETURNING id
    `

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[tecnico/actualizar]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
