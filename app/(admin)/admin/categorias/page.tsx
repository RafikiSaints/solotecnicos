import { sql } from '@/lib/pg'
import { CategoriasManager } from './CategoriasManager'
import type { Categoria } from '@/types/database.types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminCategorias() {
  // Conexión directa a Postgres (bypass PostgREST schema cache)
  const rows = await sql<Categoria[]>`
    SELECT id, nombre, slug, icono, descripcion, orden, destacada
    FROM categorias
    ORDER BY orden ASC, id ASC
  `

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-azul mb-1 font-bold">Categorías</h1>
      <p className="text-sm text-gris-3 mb-4">
        Especialidades técnicas que ofrece la plataforma · <strong>{rows.length} en total</strong>
      </p>
      <CategoriasManager iniciales={rows as Categoria[]} />
    </div>
  )
}
