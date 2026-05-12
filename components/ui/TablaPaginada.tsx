'use client'
import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Columna<T> {
  key: string
  label: string
  render: (row: T) => React.ReactNode
  className?: string
}

interface Props<T> {
  data: T[]
  columnas: Columna<T>[]
  searchFn?: (row: T, query: string) => boolean
  perPage?: number
  filtros?: React.ReactNode
  emptyMessage?: string
}

export function TablaPaginada<T extends { id: any }>({ data, columnas, searchFn, perPage = 25, filtros, emptyMessage = 'Sin resultados' }: Props<T>) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!q.trim() || !searchFn) return data
    return data.filter(row => searchFn(row, q.trim().toLowerCase()))
  }, [data, q, searchFn])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageData = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {searchFn && (
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-3" />
            <input
              type="search"
              value={q}
              onChange={e => { setQ(e.target.value); setPage(1) }}
              placeholder="Buscar..."
              className="w-full pl-10 pr-3 py-2 text-sm rounded-md border border-borde focus:outline-none focus:border-azul-mid"
            />
          </div>
        )}
        {filtros}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gris-3 uppercase border-b border-borde bg-papel/50">
              {columnas.map(c => (
                <th key={c.key} className={`px-3 py-3 font-semibold ${c.className || ''}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} className="px-3 py-10 text-center text-gris-3">{emptyMessage}</td>
              </tr>
            ) : (
              pageData.map(row => (
                <tr key={row.id} className="border-b border-borde hover:bg-papel/30">
                  {columnas.map(c => (
                    <td key={c.key} className={`px-3 py-2.5 ${c.className || ''}`}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gris-3">
            Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-borde disabled:opacity-50 hover:bg-papel"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 text-gris-4">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded border border-borde disabled:opacity-50 hover:bg-papel"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
