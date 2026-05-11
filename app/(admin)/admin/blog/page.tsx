import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatearFecha } from '@/lib/utils'

export default async function AdminBlog() {
  const sb = createClient()
  const { data: articulos } = await sb.from('blog_articulos')
    .select('*, categorias(nombre)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-display text-3xl text-azul">Blog</h1>
        <Link href="/admin/blog/nuevo"><Button>+ Nuevo artículo</Button></Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gris-3 uppercase border-b border-borde">
            <tr><th className="pb-2">Título</th><th>Categoría</th><th>Estado</th><th>Visitas</th><th>Actualizado</th><th></th></tr>
          </thead>
          <tbody>
            {articulos?.map((a: any) => (
              <tr key={a.id} className="border-b border-borde">
                <td className="py-2 font-medium text-azul">{a.titulo}</td>
                <td>{a.categorias?.nombre || '—'}</td>
                <td><Badge tone={a.publicado ? 'verde' : 'gris'}>{a.publicado ? 'Publicado' : 'Borrador'}</Badge></td>
                <td>{a.visitas}</td>
                <td>{formatearFecha(a.updated_at)}</td>
                <td><Link href={`/admin/blog/${a.id}`} className="text-xs text-azul hover:underline">Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
