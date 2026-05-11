'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/Input'
import type { Region } from '@/types/database.types'

export function FiltroRegiones({ regiones }: { regiones: Region[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const current = params.get('region') || ''

  function onChange(v: string) {
    const sp = new URLSearchParams(params.toString())
    if (v) sp.set('region', v); else sp.delete('region')
    router.push(`/buscar?${sp.toString()}`)
  }

  return (
    <Select value={current} onChange={e => onChange(e.target.value)}>
      <option value="">Todas las regiones</option>
      {regiones.map(r => (
        <option key={r.id} value={r.slug}>{r.nombre}</option>
      ))}
    </Select>
  )
}
