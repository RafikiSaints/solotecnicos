'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Categoria, Region } from '@/types/database.types'

interface Props {
  userId: string
  email: string
  regiones: Region[]
  categorias: Categoria[]
}

export function CompletarPerfilForm({ userId, email, regiones, categorias }: Props) {
  const router = useRouter()
  const push = useToast(s => s.push)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre_empresa: '', telefono: '', region_id: '', categoria_id: '',
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const r = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        nombre_empresa: form.nombre_empresa,
        telefono: form.telefono,
        email_publico: email,
        region_id: form.region_id ? Number(form.region_id) : null,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      }),
    })
    setLoading(false)
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Error' }))
      push(err.error || 'Error creando perfil', 'error')
      return
    }
    push('¡Perfil creado!')
    router.push('/dashboard/perfil')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Nombre de tu empresa" required value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} />
      <Input label="Teléfono" required value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Región" required value={form.region_id} onChange={e => setForm({ ...form, region_id: e.target.value })}>
          <option value="">Selecciona...</option>
          {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </Select>
        <Select label="Categoría principal" required value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
          <option value="">Selecciona...</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </Select>
      </div>
      <Button type="submit" loading={loading} className="w-full">Crear perfil</Button>
    </form>
  )
}
