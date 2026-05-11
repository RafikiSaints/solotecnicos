'use client'
import { X } from 'lucide-react'
import Link from 'next/link'
import { useComparadorStore } from '@/store/useComparadorStore'
import { Button } from '@/components/ui/Button'

export function ComparadorBarra() {
  const { tecnicos, remove, clear } = useComparadorStore()
  if (!tecnicos.length) return null
  const slugs = tecnicos.map(t => t.slug).filter(Boolean).join(',')
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-azul text-white shadow-card border-t border-azul-mid">
      <div className="container-st flex items-center gap-4 py-3">
        <div className="text-sm font-medium hidden sm:block">
          Comparando <strong>{tecnicos.length}/3</strong> técnicos
        </div>
        <div className="flex flex-wrap gap-2 flex-1">
          {tecnicos.map(t => (
            <span key={t.id} className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-xs">
              {t.nombre_empresa}
              <button onClick={() => remove(t.id)} className="hover:text-rojo">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <button onClick={clear} className="text-xs text-white/70 hover:text-white">Limpiar</button>
        <Link href={`/comparar?t=${slugs}`}>
          <Button size="sm">Ver comparación →</Button>
        </Link>
      </div>
    </div>
  )
}
