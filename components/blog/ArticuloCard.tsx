import Link from 'next/link'
import Image from 'next/image'
import { Calendar } from 'lucide-react'
import { formatearFecha } from '@/lib/utils'
import type { BlogArticulo } from '@/types/database.types'

export function ArticuloCard({ articulo }: { articulo: BlogArticulo & { categoria_nombre?: string } }) {
  return (
    <Link href={`/blog/${articulo.slug}`} className="group block">
      <article className="card overflow-hidden p-0">
        <div className="relative aspect-[16/10] bg-papel">
          {articulo.imagen_url ? (
            <Image src={articulo.imagen_url} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-gris-3 font-display">📖</div>
          )}
        </div>
        <div className="p-5">
          {articulo.categoria_nombre && (
            <span className="text-xs font-semibold text-rojo uppercase tracking-wide">{articulo.categoria_nombre}</span>
          )}
          <h3 className="font-display text-lg text-azul mt-1 group-hover:text-azul-mid transition-colors line-clamp-2">
            {articulo.titulo}
          </h3>
          {articulo.resumen && (
            <p className="text-sm text-gris-4 mt-2 line-clamp-2">{articulo.resumen}</p>
          )}
          <div className="text-xs text-gris-3 mt-3 flex items-center gap-1.5">
            <Calendar size={12} />
            {formatearFecha(articulo.created_at)}
          </div>
        </div>
      </article>
    </Link>
  )
}
