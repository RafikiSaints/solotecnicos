'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { InputChips } from '@/components/dashboard/InputChips'
import { createClient } from '@/lib/supabase/client'
import type { Region, Categoria } from '@/types/database.types'

export function CrearTecnicoForm({ regiones, categorias }: { regiones: Region[]; categorias: Categoria[] }) {
  const router = useRouter()
  const push = useToast(s => s.push)
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre_empresa: '',
    nombre_contacto: '',
    descripcion_corta: '',
    telefono: '',
    email_publico: '',
    sitio_web: '',
    region_id: '',
    comuna: '',
    direccion: '',
    categoria_ids: [] as number[],
    etiquetas: [] as string[],
    comunas_cobertura: [] as string[],
  })

  function toggleCategoria(id: number) {
    if (form.categoria_ids.includes(id)) {
      setForm({ ...form, categoria_ids: form.categoria_ids.filter(c => c !== id) })
    } else if (form.categoria_ids.length < 5) {
      setForm({ ...form, categoria_ids: [...form.categoria_ids, id] })
    } else {
      push('Máximo 5 categorías', 'error')
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre_empresa || !form.region_id || form.categoria_ids.length === 0) {
      push('Nombre, región y al menos 1 categoría son obligatorios', 'error')
      return
    }
    setLoading(true)
    const { data: tecnico, error } = await supabase.from('tecnicos').insert({
      // user_id = null (perfil sin dueño, listo para ser reclamado)
      nombre_empresa: form.nombre_empresa,
      nombre_contacto: form.nombre_contacto || null,
      descripcion_corta: form.descripcion_corta || null,
      telefono: form.telefono || null,
      email_publico: form.email_publico || null,
      sitio_web: form.sitio_web || null,
      region_id: Number(form.region_id),
      comuna: form.comuna || null,
      direccion: form.direccion || null,
      etiquetas: form.etiquetas.length ? form.etiquetas : null,
      comunas_cobertura: form.comunas_cobertura.length ? form.comunas_cobertura : null,
    }).select().single()
    if (error || !tecnico) {
      push(`Error: ${error?.message}`, 'error')
      setLoading(false)
      return
    }
    // Categorías
    for (const catId of form.categoria_ids) {
      await supabase.from('tecnico_categorias').insert({ tecnico_id: tecnico.id, categoria_id: catId })
    }
    setLoading(false)
    push('Técnico creado — ya aparece en el directorio')
    router.push('/admin/tecnicos')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-4">
        <h3 className="font-display text-lg text-azul font-bold">Información básica</h3>
        <Input label="Nombre de la empresa *" required value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} placeholder="ClimaTech Express" />
        <Input label="Nombre del contacto" value={form.nombre_contacto} onChange={e => setForm({ ...form, nombre_contacto: e.target.value })} placeholder="Juan Pérez" />
        <Textarea label="Descripción corta (máx 160)" maxLength={160} value={form.descripcion_corta} onChange={e => setForm({ ...form, descripcion_corta: e.target.value })} placeholder="Especialistas en climatización con 15 años de experiencia..." />
      </div>

      <div className="card space-y-4">
        <h3 className="font-display text-lg text-azul font-bold">Contacto</h3>
        <Input label="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 1234 5678" />
        <Input label="Email público" type="email" value={form.email_publico} onChange={e => setForm({ ...form, email_publico: e.target.value })} placeholder="contacto@empresa.cl" helper="Importante: si el técnico reclama el perfil después, este email se usará para verificar." />
        <Input label="Sitio web" value={form.sitio_web} onChange={e => setForm({ ...form, sitio_web: e.target.value })} placeholder="https://..." />
      </div>

      <div className="card space-y-4">
        <h3 className="font-display text-lg text-azul font-bold">Ubicación</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Región *" required value={form.region_id} onChange={e => setForm({ ...form, region_id: e.target.value })}>
            <option value="">Selecciona...</option>
            {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </Select>
          <Input label="Comuna" value={form.comuna} onChange={e => setForm({ ...form, comuna: e.target.value })} placeholder="Las Condes" />
        </div>
        <Input label="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Apoquindo 1234" />
      </div>

      <div className="card space-y-3">
        <h3 className="font-display text-lg text-azul font-bold">Categorías * ({form.categoria_ids.length}/5)</h3>
        <div className="flex flex-wrap gap-2">
          {categorias.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategoria(c.id)}
              className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${form.categoria_ids.includes(c.id) ? 'border-azul-mid bg-azul-mid text-white' : 'border-borde bg-white text-gris-4 hover:border-azul-mid'}`}
            >
              {c.icono} {c.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="font-display text-lg text-azul font-bold">Etiquetas y cobertura</h3>
        <InputChips
          label="Etiquetas de servicio (palabras clave)"
          values={form.etiquetas}
          onChange={v => setForm({ ...form, etiquetas: v })}
          placeholder="Ej: Samsung, lavadoras, fugas gas, iPhone..."
          helper="Mejoran las búsquedas. Separa con Enter o coma. Sin límite estricto en carga manual."
        />
        <InputChips
          label="Comunas de cobertura (servicio a domicilio)"
          values={form.comunas_cobertura}
          onChange={v => setForm({ ...form, comunas_cobertura: v })}
          placeholder="Las Condes, Vitacura, Providencia..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={loading}>Crear técnico</Button>
      </div>
    </form>
  )
}
