import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TarjetaTecnico } from '@/components/tecnico/TarjetaTecnico'
import type { Metadata } from 'next'
import type { TecnicoConRelaciones } from '@/types/database.types'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = createClient()
  const { data: r } = await sb.from('regiones').select('*').eq('slug', params.slug).single()
  if (!r) return { title: 'Región no encontrada' }
  return {
    title: `Servicios Técnicos en ${r.nombre} | Directorio verificado`,
    description: `Encuentra técnicos verificados en ${r.nombre}: climatización, computación, electricidad, gasfitería y más.`,
  }
}

export default async function RegionPage({ params }: { params: { slug: string } }) {
  const sb = createClient()
  const { data: region } = await sb.from('regiones').select('*').eq('slug', params.slug).single()
  if (!region) notFound()

  const [{ data: tecnicosRaw }, { data: categorias }] = await Promise.all([
    sb.from('tecnicos')
      .select('*, regiones(nombre), tecnico_fotos(url, es_portada)')
      .eq('activo', true)
      .eq('region_id', region.id)
      .order('plan', { ascending: false })
      .order('rating_promedio', { ascending: false })
      .limit(40),
    sb.from('categorias').select('*').order('orden'),
  ])

  const tecnicos: TecnicoConRelaciones[] = (tecnicosRaw || []).map((t: any) => ({
    ...t,
    region_nombre: t.regiones?.nombre,
    foto_portada: t.tecnico_fotos?.find((f: any) => f.es_portada)?.url || t.tecnico_fotos?.[0]?.url,
  }))

  return (
    <div className="container-st py-10">
      <h1 className="font-display text-4xl text-azul">Técnicos en {region.nombre}</h1>
      <p className="text-gris-4 mt-1 mb-6">{tecnicos.length} profesionales verificados</p>

      <div className="mb-8">
        <h3 className="text-sm font-medium text-gris-3 mb-2">Por especialidad:</h3>
        <div className="flex flex-wrap gap-2">
          {categorias?.map(c => (
            <Link key={c.id} href={`/categoria/${c.slug}/${region.slug}`} className="text-xs px-3 py-1 rounded-full border border-borde hover:border-azul">
              {c.icono} {c.nombre}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tecnicos.map(t => (
          <TarjetaTecnico key={t.id} tecnico={t} />
        ))}
      </div>
    </div>
  )
}
