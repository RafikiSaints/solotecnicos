'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Award, Upload, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type { Certificacion, Tecnico } from '@/types/database.types'

export function CertificacionesManager({ tecnico, iniciales }: { tecnico: Tecnico; iniciales: Certificacion[] }) {
  const [items, setItems] = useState(iniciales)
  const [agregar, setAgregar] = useState(false)
  const [form, setForm] = useState({ nombre: '', entidad: '', file: null as File | null })
  const [subiendo, setSubiendo] = useState(false)
  const push = useToast(s => s.push)
  const supabase = createClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.file) return
    setSubiendo(true)
    const path = `${tecnico.id}/certs/${Date.now()}-${form.file.name}`
    const { error: upErr } = await supabase.storage.from('tecnico-documentos').upload(path, form.file)
    if (upErr) {
      push('Error subiendo documento', 'error')
      setSubiendo(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('tecnico-documentos').getPublicUrl(path)
    const { data } = await supabase.from('tecnico_certificaciones').insert({
      tecnico_id: tecnico.id,
      nombre: form.nombre,
      entidad_emisora: form.entidad,
      documento_url: publicUrl,
      estado: 'pendiente',
    }).select().single()
    if (data) {
      setItems([data, ...items])
      setAgregar(false)
      setForm({ nombre: '', entidad: '', file: null })
      push('Certificación enviada — revisión en 24-48h')
    }
    setSubiendo(false)
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar?')) return
    await supabase.from('tecnico_certificaciones').delete().eq('id', id)
    setItems(items.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-4">
      {agregar ? (
        <form onSubmit={onSubmit} className="card space-y-3">
          <Input label="Nombre de la certificación" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Certificación SEC, Certificado Samsung" />
          <Input label="Entidad emisora" value={form.entidad} onChange={e => setForm({ ...form, entidad: e.target.value })} placeholder="Ej: SEC Chile" />
          <div>
            <label className="label-st">Documento (PDF, JPG, PNG)</label>
            <input type="file" accept=".pdf,image/*" required onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} className="block w-full text-sm" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" loading={subiendo}>Enviar para revisión</Button>
            <Button type="button" variant="ghost" onClick={() => setAgregar(false)}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setAgregar(true)}><Upload size={14} /> Agregar certificación</Button>
      )}

      {items.length === 0 ? (
        <p className="text-center text-gris-3 py-6">Aún no tienes certificaciones</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-start gap-3">
                <Award size={20} className="text-oro shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="text-azul">{c.nombre}</strong>
                  {c.entidad_emisora && <div className="text-xs text-gris-3">{c.entidad_emisora}</div>}
                  <div className="mt-2">
                    <Badge tone={c.estado === 'aprobada' ? 'verde' : c.estado === 'rechazada' ? 'rojo' : 'oro'}>
                      {c.estado}
                    </Badge>
                  </div>
                </div>
                <button onClick={() => eliminar(c.id)} className="text-gris-3 hover:text-rojo">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
