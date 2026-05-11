'use client'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function FiltroBusqueda({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(defaultValue || params.get('q') || '')

  function buscar(e: React.FormEvent) {
    e.preventDefault()
    const sp = new URLSearchParams(params.toString())
    if (q) sp.set('q', q); else sp.delete('q')
    router.push(`/buscar?${sp.toString()}`)
  }

  return (
    <form onSubmit={buscar} className="flex gap-2">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-3" />
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="¿Qué necesitas reparar? (ej: split, refrigerador, notebook…)"
          className="input-st pl-10 pr-4 h-12 text-base"
        />
      </div>
      <Button size="lg" type="submit">Buscar</Button>
    </form>
  )
}
