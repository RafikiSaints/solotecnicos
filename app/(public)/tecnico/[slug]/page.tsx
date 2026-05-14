import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PerfilPublico } from '@/components/tecnico/PerfilPublico'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = createClient()
  const { data: tecnico } = await sb.from('tecnicos').select('*, regiones(nombre)').eq('slug', params.slug).single()
  if (!tecnico) return { title: 'Técnico no encontrado' }
  const region = (tecnico as any).regiones?.nombre
  return {
    title: `${tecnico.nombre_empresa} — Servicio Técnico en ${tecnico.comuna || ''}, ${region || 'Chile'}`,
    description: tecnico.descripcion_corta || `Contacta a ${tecnico.nombre_empresa}. Rating ${(tecnico.rating_promedio || 0).toFixed(1)}/5 con ${tecnico.total_resenas} reseñas verificadas.`,
  }
}

export default async function PerfilPage({ params }: { params: { slug: string } }) {
  const sb = createClient()

  // Cargamos el técnico vía pg directo para evitar problemas de schema cache
  // de PostgREST con columnas nuevas (google_rating, google_total_resenas, etc.)
  let tecnico: any = null
  try {
    const { sql } = await import('@/lib/pg')
    const rows = await sql`
      SELECT * FROM tecnicos
      WHERE slug = ${params.slug} AND activo = true
      LIMIT 1
    `
    tecnico = rows[0] || null
  } catch (e) {
    console.warn('[tecnico/slug] pg directo falló, usando Supabase JS:', (e as any)?.message)
    const { data } = await sb.from('tecnicos').select('*').eq('slug', params.slug).eq('activo', true).single()
    tecnico = data
  }
  if (!tecnico) notFound()

  // Defensa: garantizar que los decimales sean numbers (pg-js los puede
  // devolver como string si la config de types no aplicó). La UI hace
  // .toFixed() y operaciones aritméticas, así que strings = crash.
  const toNum = (v: any) => (v === null || v === undefined || v === '' ? 0 : Number(v))
  tecnico.rating_promedio   = toNum(tecnico.rating_promedio)
  tecnico.rating_atencion   = toNum(tecnico.rating_atencion)
  tecnico.rating_calidad    = toNum(tecnico.rating_calidad)
  tecnico.rating_respuesta  = toNum(tecnico.rating_respuesta)
  tecnico.rating_resolucion = toNum(tecnico.rating_resolucion)
  tecnico.rating_rapidez    = toNum(tecnico.rating_rapidez)
  tecnico.rating_precio     = toNum(tecnico.rating_precio)
  tecnico.rating_garantia   = toNum(tecnico.rating_garantia)
  tecnico.google_rating     = toNum(tecnico.google_rating)
  tecnico.google_total_resenas = toNum(tecnico.google_total_resenas)
  tecnico.total_resenas     = toNum(tecnico.total_resenas)
  if (tecnico.lat !== null && tecnico.lat !== undefined) tecnico.lat = Number(tecnico.lat)
  if (tecnico.lng !== null && tecnico.lng !== undefined) tecnico.lng = Number(tecnico.lng)

  const [
    { data: region },
    { data: categoriasRel },
    { data: fotos },
    { data: servicios },
    { data: resenas },
    { data: trabajos },
    { data: certificaciones },
  ] = await Promise.all([
    tecnico.region_id ? sb.from('regiones').select('*').eq('id', tecnico.region_id).single() : Promise.resolve({ data: null }),
    sb.from('tecnico_categorias').select('categorias(*)').eq('tecnico_id', tecnico.id),
    sb.from('tecnico_fotos').select('*').eq('tecnico_id', tecnico.id).order('orden'),
    sb.from('tecnico_servicios').select('*').eq('tecnico_id', tecnico.id).order('orden'),
    // Mostramos todas las reseñas (aprobadas + pendientes) excepto las reportadas/ocultas.
    // El estado "aprobada" controla el badge ("Verificada" vs "Por revisar"), no la visibilidad.
    sb.from('resenas').select('*').eq('tecnico_id', tecnico.id).eq('reportada', false).order('created_at', { ascending: false }),
    sb.from('tecnico_trabajos').select('*').eq('tecnico_id', tecnico.id).order('orden'),
    sb.from('tecnico_certificaciones').select('*').eq('tecnico_id', tecnico.id).eq('estado', 'aprobada'),
  ])

  const categorias = (categoriasRel || []).map((c: any) => c.categorias).filter(Boolean)

  return (
    <PerfilPublico
      tecnico={tecnico}
      region={region as any}
      categorias={categorias}
      fotos={fotos || []}
      servicios={servicios || []}
      resenas={resenas || []}
      trabajos={trabajos || []}
      certificaciones={certificaciones || []}
    />
  )
}
