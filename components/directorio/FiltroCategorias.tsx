'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Categoria } from '@/types/database.types'

/**
 * Muestra categorías en grilla. Por defecto solo las primeras N (≈2 filas),
 * con un botón "Ver todas (xx)" para expandir el resto.
 */
export function FiltroCategorias({
  categorias,
  activa,
  defaultVisible = 10,
}: {
  categorias: Categoria[]
  activa?: string
  /** Cuántas mostrar antes de "Ver todas". 10 = 2 filas de 5 en md+. */
  defaultVisible?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const hayOcultas = categorias.length > defaultVisible

  // Si la categoría activa está más allá del límite, expandir por defecto
  // para que el usuario la vea seleccionada al entrar.
  const activaIdx = activa ? categorias.findIndex(c => c.slug === activa) : -1
  const debeExpandirse = expanded || activaIdx >= defaultVisible

  const visibles = debeExpandirse ? categorias : categorias.slice(0, defaultVisible)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {visibles.map(c => (
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

      {hayOcultas && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(!debeExpandirse)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-borde text-azul hover:border-azul hover:bg-papel text-sm font-medium transition-colors"
          >
            {debeExpandirse ? (
              <>Ver menos <ChevronUp size={14} /></>
            ) : (
              <>Ver todas ({categorias.length}) <ChevronDown size={14} /></>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
