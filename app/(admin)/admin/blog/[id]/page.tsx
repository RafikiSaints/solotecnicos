import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EditarArticuloForm } from './EditarArticuloForm'

export default async function EditarArticulo({ params }: { params: { id: string } }) {
  const sb = createServiceClient()
  const [{ data: articulo }, { data: categorias }] = await Promise.all([
    sb.from('blog_articulos').select('*').eq('id', params.id).single(),
    sb.from('categorias').select('*').order('orden'),
  ])
  if (!articulo) notFound()

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-azul font-bold mb-1">Editar artículo</h1>
      <p className="text-sm text-gris-3 mb-6">{articulo.titulo}</p>
      <EditarArticuloForm articulo={articulo} categorias={categorias || []} />
    </div>
  )
}
