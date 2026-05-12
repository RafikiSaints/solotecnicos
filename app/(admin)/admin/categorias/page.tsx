import { createClient } from '@/lib/supabase/server'
import { CategoriasManager } from './CategoriasManager'

export default async function AdminCategorias() {
  const sb = createClient()
  const { data: categorias } = await sb.from('categorias').select('*').order('orden')
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-azul mb-1 font-bold">Categorías</h1>
      <p className="text-sm text-gris-3 mb-4">Especialidades técnicas que ofrece la plataforma. Agrega nuevas según vayan apareciendo nichos.</p>
      <CategoriasManager iniciales={categorias || []} />
    </div>
  )
}
