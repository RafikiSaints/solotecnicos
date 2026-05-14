import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TarjetaTecnico } from '@/components/tecnico/TarjetaTecnico'
import type { Metadata } from 'next'
import type { TecnicoConRelaciones } from '@/types/database.types'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string; regionSlug: string } }): Promise<Metadata> {
  const sb = createClient()
  const [{ data: c }, { data: r }] = await Promise.all([
    sb.from('categorias').select('*').eq('slug', params.slug).single(),
    sb.from('regiones').select('*').eq('slug', params.regionSlug).single(),
  ])
  if (!c || !r) return { title: 'Combinación no encontrada' }
  return {
    title: `Técnicos de ${c.nombre} en ${r.nombre}`,
    description: `Técnicos especializados en ${c.nombre} en ${r.nombre}. Compara, lee reseñas y solicita cotizaciones gratis.`,
  }
}

export default async function CategoriaRegionPage({ params }: { params: { slug: string; regionSlug: string } }) {
  const sb = createClient()
  const [{ data: categoria }, { data: region }] = await Promise.all([
    sb.from('categorias').select('*').eq('slug', params.slug).single(),
    sb.from('regiones').select('*').eq('slug', params.regionSlug).single(),
  ])
  if (!categoria || !region) notFound()

  const { data: tecnicosRaw } = await sb
    .from('tecnicos')
    .select('*, regiones(nombre), tecnico_fotos(url, es_portada), tecnico_categorias!inner(categoria_id)')
    .eq('activo', true)
    .eq('region_id', region.id)
    .eq('tecnico_categorias.categoria_id', categoria.id)
    .order('plan', { ascending: false })
    .order('rating_promedio', { ascending: false })

  const tecnicos: TecnicoConRelaciones[] = (tecnicosRaw || []).map((t: any) => ({
    ...t,
    region_nombre: t.regiones?.nombre,
    foto_portada: t.tecnico_fotos?.find((f: any) => f.es_portada)?.url || t.tecnico_fotos?.[0]?.url,
  }))

  return (
    <div className="container-st py-10">
      <h1 className="font-display text-4xl text-azul">
        {categoria.icono} {categoria.nombre} en {region.nombre}
      </h1>
      <p className="text-gris-4 mt-1 mb-8">{tecnicos.length} técnicos verificados</p>
      <div className="grid md:grid-cols-2 gap-4">
        {tecnicos.map(t => (
          <TarjetaTecnico key={t.id} tecnico={t} mostrarBotonMapa={false} />
        ))}
      </div>
    </div>
  )
}
