'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MapPin, ChevronDown, Check } from 'lucide-react'
import type { Region } from '@/types/database.types'

const COOKIE_NAME = 'st_region'

function setCookie(value: string) {
  const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=${value};expires=${expires};path=/;SameSite=Lax`
}

export function RegionSelector({ regiones, regionActual }: { regiones: Region[]; regionActual: string | null }) {
  const [open, setOpen] = useState(false)
  const [actual, setActual] = useState<string | null>(regionActual)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => { setActual(regionActual) }, [regionActual])

  function seleccionar(slug: string | null) {
    setActual(slug)
    setCookie(slug || '')
    setOpen(false)
    router.refresh()
    // Si estamos en /buscar, además actualizar la URL para que el filtro se vea
    if (pathname === '/buscar') {
      const url = new URL(window.location.href)
      if (slug) url.searchParams.set('region', slug)
      else url.searchParams.delete('region')
      router.push(url.pathname + url.search)
    }
  }

  const seleccionada = regiones.find(r => r.slug === actual)
  const label = seleccionada?.nombre || 'Todas las regiones'

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
      >
        <MapPin size={12} className="text-oro" />
        <span>{label}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-card border border-borde py-1 z-50 max-h-96 overflow-y-auto animate-fade-in">
            <button
              onClick={() => seleccionar(null)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-papel ${!actual ? 'text-azul-mid font-semibold' : 'text-gris-4'}`}
            >
              <span>🇨🇱 Todas las regiones</span>
              {!actual && <Check size={14} className="text-azul-mid" />}
            </button>
            <div className="border-t border-borde my-1" />
            {regiones.map(r => (
              <button
                key={r.id}
                onClick={() => seleccionar(r.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-papel ${actual === r.slug ? 'text-azul-mid font-semibold bg-azul-mid/5' : 'text-gris-4'}`}
              >
                <span>{r.nombre}</span>
                {actual === r.slug && <Check size={14} className="text-azul-mid" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
