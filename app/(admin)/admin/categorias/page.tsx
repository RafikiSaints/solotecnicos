import { createServiceClient } from '@/lib/supabase/server'
import { CategoriasManager } from './CategoriasManager'
import type { Categoria } from '@/types/database.types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminCategorias() {
  // Intentamos pg directo; si DATABASE_URL falla, usamos service client.
  let rows: Categoria[] = []
  try {
    const { sql } = await import('@/lib/pg')
    rows = await sql<Categoria[]>`
      SELECT id, nombre, slug, icono, descripcion, orden, destacada
      FROM categorias
      ORDER BY orden ASC, id ASC
    `
  } catch (e) {
    console.warn('[admin/categorias] pg directo falló, usando Supabase JS:', (e as any)?.message)
    const sb = createServiceClient()
    const { data } = await sb.from('categorias').select('*').order('orden', { ascending: true }).order('id')
    rows = (data || []) as Categoria[]
  }

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
