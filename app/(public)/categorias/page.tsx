import Link from 'next/link'
import { sql } from '@/lib/pg'
import { ArrowLeft, Sparkles } from 'lucide-react'
import type { Categoria } from '@/types/database.types'

export const metadata = {
  title: 'Todas las especialidades',
  description: 'Explora todas las especialidades técnicas y oficios disponibles en SoloTécnicos.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CategoriasPage() {
  // Conexión directa Postgres (bypass schema cache)
  const categorias = await sql<Categoria[]>`
    SELECT id, nombre, slug, icono, descripcion, orden, destacada
    FROM categorias
    ORDER BY orden ASC
  `

  const destacadas = categorias.filter((c: any) => c.destacada)
  const otras = categorias.filter((c: any) => !c.destacada)

  return (
    <div className="container-st py-12 max-w-5xl">
      <Link href="/" className="text-sm text-gris-4 hover:text-azul inline-flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> Volver al inicio
      </Link>

      <h1 className="font-display text-3xl md:text-4xl text-azul font-extrabold mb-2">Todas las especialidades</h1>
      <p className="text-gris-4 mb-8">
        Explora {categorias.length} categorías de oficios y técnicos disponibles. Click en cualquiera para ver los profesionales.
      </p>

      {destacadas.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl text-azul font-bold mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-oro" /> Más buscadas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {destacadas.map((c: any) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                className="card hover:border-azul-mid hover:shadow-card transition-all text-center p-4"
              >
                <div className="text-3xl mb-2">{c.icono}</div>
                <div className="text-sm font-semibold text-azul">{c.nombre}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {otras.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-azul font-bold mb-4">Otras especialidades</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {otras.map((c: any) => (
              <Link
                key={c.id}
                href={`/categoria/${c.slug}`}
                className="card hover:border-azul-mid hover:shadow-card transition-all text-center p-4 opacity-90"
              >
                <div className="text-3xl mb-2">{c.icono}</div>
                <div className="text-sm font-semibold text-azul">{c.nombre}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
