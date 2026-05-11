import { createClient } from '@/lib/supabase/server'
import { ArticuloCard } from '@/components/blog/ArticuloCard'

export const revalidate = 300

export const metadata = {
  title: 'Blog — Guías y consejos técnicos',
  description: 'Aprende cómo mantener tus equipos, qué buscar al contratar un técnico y mucho más.',
}

export default async function BlogPage() {
  const sb = createClient()
  const { data: articulos } = await sb
    .from('blog_articulos')
    .select('*, categorias(nombre)')
    .eq('publicado', true)
    .order('created_at', { ascending: false })

  return (
    <div className="container-st py-12">
      <h1 className="font-display text-4xl md:text-5xl text-azul mb-2">Blog</h1>
      <p className="text-gris-4 mb-8 max-w-2xl">Guías prácticas para mantener tus equipos y consejos para contratar al técnico ideal.</p>

      {!articulos?.length ? (
        <div className="card text-center py-10">
          <p className="text-gris-4">Próximamente artículos.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articulos.map((a: any) => (
            <ArticuloCard key={a.id} articulo={{ ...a, categoria_nombre: a.categorias?.nombre }} />
          ))}
        </div>
      )}
    </div>
  )
}
