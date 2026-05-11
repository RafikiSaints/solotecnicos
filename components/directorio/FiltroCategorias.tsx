'use client'
import Link from 'next/link'
import type { Categoria } from '@/types/database.types'

export function FiltroCategorias({ categorias, activa }: { categorias: Categoria[]; activa?: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
      {categorias.map(c => (
        <Link
          key={c.id}
          href={`/categoria/${c.slug}`}
          className={`flex flex-col items-center gap-1.5 px-3 py-4 rounded-lg border transition-colors text-center ${activa === c.slug ? 'border-azul bg-azul text-white' : 'border-borde bg-white hover:border-azul hover:bg-papel'}`}
        >
          <span className="text-2xl">{c.icono}</span>
          <span className="text-xs font-medium leading-tight">{c.nombre}</span>
        </Link>
      ))}
    </div>
  )
}
