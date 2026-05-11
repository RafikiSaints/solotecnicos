import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TarjetaTecnico } from '@/components/tecnico/TarjetaTecnico'
import type { Metadata } from 'next'
import type { TecnicoConRelaciones } from '@/types/database.types'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = createClient()
  const { data: c } = await sb.from('categorias').select('*').eq('slug', params.slug).single()
  if (!c) return { title: 'Categoría no encontrada' }
  return {
    title: `Técnicos de ${c.nombre} en Chile | Directorio verificado`,
    description: `Encuentra técnicos de ${c.nombre} verificados en toda Chile. Compara precios, lee reseñas reales y solicita cotizaciones gratis.`,
  }
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const sb = createClient()
  const { data: categoria } = await sb.from('categorias').select('*').eq('slug', params.slug).single()
  if (!categoria) notFound()

  const { data: tecnicosRaw } = await sb
    .from('tecnicos')
    .select('*, regiones(nombre), tecnico_fotos(url, es_portada), tecnico_categorias!inner(categoria_id)')
    .eq('activo', true)
    .eq('tecnico_categorias.categoria_id', categoria.id)
    .order('plan', { ascending: false })
    .order('rating_promedio', { ascending: false })
    .limit(40)

  const tecnicos: TecnicoConRelaciones[] = (tecnicosRaw || []).map((t: any) => ({
    ...t,
    region_nombre: t.regiones?.nombre,
    foto_portada: t.tecnico_fotos?.find((f: any) => f.es_portada)?.url || t.tecnico_fotos?.[0]?.url,
  }))

  const { data: regiones } = await sb.from('regiones').select('*').order('orden')

  return (
    <div className="container-st py-10">
      <h1 className="font-display text-4xl text-azul">
        <span className="mr-3">{categoria.icono}</span>
        Técnicos de {categoria.nombre}
      </h1>
      <p className="text-gris-4 mt-1 mb-6">{tecnicos.length} técnicos verificados en Chile</p>

      {/* Regiones para SEO interno */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gris-3 mb-2">Por región:</h3>
        <div className="flex flex-wrap gap-2">
          {regiones?.map(r => (
            <Link key={r.id} href={`/categoria/${categoria.slug}/${r.slug}`} className="text-xs px-3 py-1 rounded-full border border-borde hover:border-azul">
              {r.nombre}
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
