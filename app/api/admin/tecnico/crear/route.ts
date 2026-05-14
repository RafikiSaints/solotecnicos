import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sql } from '@/lib/pg'

/**
 * Endpoint admin para crear un técnico (sin propietario, listo para reclamar).
 * Usa pg directo para evitar problemas con el schema cache de PostgREST
 * cuando se agregan columnas nuevas (ej: google_rating, google_total_resenas).
 */
export async function POST(req: Request) {
  try {
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin' }, { status: 403 })
    }

    const body = await req.json()
    const data: Record<string, any> = {
      nombre_empresa: body.nombre_empresa,
      nombre_contacto: body.nombre_contacto || null,
      descripcion_corta: body.descripcion_corta || null,
      telefono: body.telefono || null,
      whatsapp: body.whatsapp || null,
      email_publico: body.email_publico || null,
      sitio_web: body.sitio_web || null,
      region_id: body.region_id ? Number(body.region_id) : null,
      comuna: body.comuna || null,
      direccion: body.direccion || null,
      etiquetas: body.etiquetas && body.etiquetas.length ? body.etiquetas : null,
      comunas_cobertura: body.comunas_cobertura && body.comunas_cobertura.length ? body.comunas_cobertura : null,
      link_google_maps: body.link_google_maps || null,
      link_google_business: body.link_google_business || null,
      google_rating: body.google_rating != null && body.google_rating !== '' ? Number(body.google_rating) : null,
      google_total_resenas: body.google_total_resenas != null && body.google_total_resenas !== '' ? parseInt(body.google_total_resenas) : null,
    }

    if (!data.nombre_empresa || !data.region_id) {
      return NextResponse.json({ error: 'nombre_empresa y region_id son obligatorios' }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO tecnicos ${sql(data)}
      RETURNING id
    `
    const id = rows[0]?.id
    if (!id) return NextResponse.json({ error: 'No se pudo crear' }, { status: 500 })

    // Insertar categorías
    if (Array.isArray(body.categoria_ids) && body.categoria_ids.length > 0) {
      const cats = body.categoria_ids.map((catId: number) => ({
        tecnico_id: id,
        categoria_id: Number(catId),
      }))
      await sql`INSERT INTO tecnico_categorias ${sql(cats)}`
    }

    return NextResponse.json({ ok: true, id })
  } catch (e: any) {
    console.error('[admin/tecnico/crear]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
