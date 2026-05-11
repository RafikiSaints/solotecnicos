'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Star, ShieldCheck, Home, Zap } from 'lucide-react'

const FILTROS = [
  { key: 'verificado', label: 'Verificado', icon: ShieldCheck },
  { key: 'domicilio',  label: 'A domicilio', icon: Home },
  { key: '24h',         label: 'Atiende 24/7', icon: Zap },
] as const

const RATINGS = [4.5, 4.0, 3.5]

export function FiltrosAvanzados() {
  const router = useRouter()
  const params = useSearchParams()

  function toggle(key: string) {
    const sp = new URLSearchParams(params.toString())
    if (sp.get(key) === '1') sp.delete(key); else sp.set(key, '1')
    router.push(`/buscar?${sp.toString()}`)
  }
  function setRating(r: number | null) {
    const sp = new URLSearchParams(params.toString())
    if (r) sp.set('rating', String(r)); else sp.delete('rating')
    router.push(`/buscar?${sp.toString()}`)
  }

  const rating = parseFloat(params.get('rating') || '0')
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gris-3 mb-2">Filtros</h4>
        <div className="space-y-2">
          {FILTROS.map(f => {
            const active = params.get(f.key) === '1'
            const Icon = f.icon
            return (
              <button
                key={f.key}
                onClick={() => toggle(f.key)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm border transition-colors ${active ? 'border-azul bg-azul text-white' : 'border-borde bg-white text-gris-4 hover:border-azul'}`}
              >
                <Icon size={14} />
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gris-3 mb-2">Rating mínimo</h4>
        <div className="space-y-2">
          {RATINGS.map(r => (
            <button
              key={r}
              onClick={() => setRating(rating === r ? null : r)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm border transition-colors ${rating === r ? 'border-azul bg-azul text-white' : 'border-borde bg-white text-gris-4 hover:border-azul'}`}
            >
              <Star size={14} fill="#C89A2E" stroke="#C89A2E" />
              {r}+ estrellas
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
