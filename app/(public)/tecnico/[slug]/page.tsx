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

  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('slug', params.slug).eq('activo', true).single()
  if (!tecnico) notFound()

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
    sb.from('resenas').select('*').eq('tecnico_id', tecnico.id).eq('aprobada', true).order('created_at', { ascending: false }),
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
