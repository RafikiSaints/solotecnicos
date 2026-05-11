import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { SidebarTecnicosRelacionados } from '@/components/blog/SidebarTecnicosRelacionados'
import { Button } from '@/components/ui/Button'
import { formatearFecha } from '@/lib/utils'
import type { Metadata } from 'next'
import type { TecnicoConRelaciones } from '@/types/database.types'

export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = createClient()
  const { data: art } = await sb.from('blog_articulos').select('titulo, resumen, imagen_url').eq('slug', params.slug).single()
  if (!art) return { title: 'Artículo no encontrado' }
  return {
    title: art.titulo,
    description: art.resumen || undefined,
    openGraph: { images: art.imagen_url ? [art.imagen_url] : [] },
  }
}

export default async function ArticuloPage({ params }: { params: { slug: string } }) {
  const sb = createClient()
  const { data: articulo } = await sb.from('blog_articulos')
    .select('*, categorias(*), regiones(*)')
    .eq('slug', params.slug)
    .eq('publicado', true)
    .single()
  if (!articulo) notFound()

  // Técnicos relacionados (de la misma categoría)
  let tecnicosRel: TecnicoConRelaciones[] = []
  if (articulo.categoria_id) {
    const { data: tecnicosRaw } = await sb.from('tecnicos')
      .select('*, tecnico_categorias!inner(categoria_id)')
      .eq('activo', true)
      .eq('tecnico_categorias.categoria_id', articulo.categoria_id)
      .order('rating_promedio', { ascending: false })
      .limit(4)
    tecnicosRel = (tecnicosRaw || []) as any
  }

  return (
    <article className="container-st py-12 grid lg:grid-cols-[1fr_320px] gap-10">
      <div className="prose-st">
        {articulo.categorias && (
          <Link href={`/categoria/${articulo.categorias.slug}`} className="text-xs font-semibold text-rojo uppercase tracking-wide">
            {articulo.categorias.nombre}
          </Link>
        )}
        <h1 className="font-display text-4xl md:text-5xl text-azul mt-2 mb-3">{articulo.titulo}</h1>
        <div className="text-xs text-gris-3 mb-6">
          {articulo.autor} · {formatearFecha(articulo.created_at)}
        </div>
        {articulo.imagen_url && (
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8 bg-papel">
            <Image src={articulo.imagen_url} alt="" fill className="object-cover" />
          </div>
        )}
        {articulo.resumen && <p className="text-lg text-gris-4 leading-relaxed mb-6">{articulo.resumen}</p>}
        <div
          className="text-gris-4 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: articulo.contenido || '' }}
        />

        <div className="mt-12 rounded-xl bg-azul text-white p-8 text-center">
          <h3 className="font-display text-2xl mb-2">¿Buscas un técnico?</h3>
          <p className="text-white/80 mb-4">Encuentra el mejor técnico verificado en tu región.</p>
          <Link href={articulo.categorias ? `/categoria/${articulo.categorias.slug}` : '/buscar'}>
            <Button>Ver técnicos →</Button>
          </Link>
        </div>
      </div>

      <aside>
        <SidebarTecnicosRelacionados tecnicos={tecnicosRel} />
      </aside>
    </article>
  )
}
