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
      {/* Explicación + ejemplo */}
      <div className="card bg-azul-mid/5 border-azul-mid/30">
        <h3 className="font-display text-lg text-azul font-bold mb-2">💡 ¿Qué son las certificaciones?</h3>
        <p className="text-sm text-gris-4 mb-3">
          Son <strong>documentos que acreditan tus conocimientos</strong>. Después que nosotros los aprobamos,
          aparecen como <strong>badges dorados en tu perfil público</strong>, lo que aumenta la confianza
          de los clientes (y según nuestras estadísticas, 3x más cotizaciones).
        </p>
        <div className="bg-white rounded-md border border-borde p-3 space-y-2 text-sm">
          <strong className="text-azul">Ejemplos comunes:</strong>
          <ul className="text-xs text-gris-4 space-y-1 list-disc pl-4">
            <li><strong>Certificación SEC</strong> (Superintendencia de Electricidad y Combustibles) — para eléctricos y gasfiteres</li>
            <li><strong>Certificado Samsung / LG / Daikin</strong> — para técnicos de climatización autorizados</li>
            <li><strong>Apple Certified Macintosh Technician</strong> — para técnicos de computación Apple</li>
            <li><strong>Certificado de capacitación INACAP/DUOC</strong> — formación técnica oficial</li>
            <li><strong>Certificación CISCO / Microsoft</strong> — para redes y sistemas</li>
            <li><strong>Curso anti-incendios</strong> — para industrial y maquinaria</li>
          </ul>
          <p className="text-xs text-gris-3 mt-2">
            <strong>📋 Cómo agregarla:</strong> 1) Click en "Agregar certificación" — 2) Escribe el nombre tal como aparece en el documento —
            3) Indica quién la emite — 4) Sube foto o PDF del documento original — 5) Esperas 24-48h a que nosotros la revisemos
          </p>
        </div>
      </div>

      {agregar ? (
        <form onSubmit={onSubmit} className="card space-y-3">
          <h4 className="font-display text-lg text-azul font-bold">Nueva certificación</h4>
          <Input label="Nombre de la certificación" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Certificación SEC clase A" helper="Tal como aparece en el documento" />
          <Input label="Entidad emisora" value={form.entidad} onChange={e => setForm({ ...form, entidad: e.target.value })} placeholder="Ej: SEC Chile, Samsung Electronics, INACAP" helper="Quién emitió el certificado" />
          <div>
            <label className="label-st">Documento (PDF, JPG, PNG) <span className="text-rojo">*</span></label>
            <input type="file" accept=".pdf,image/*" required onChange={e => setForm({ ...form, file: e.target.files?.[0] || null })} className="block w-full text-sm" />
            <p className="text-xs text-gris-3 mt-1">Sube una foto nítida o el PDF original. Máximo 10MB.</p>
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
        <div className="text-center text-gris-3 py-6 border-2 border-dashed border-borde rounded-lg">
          <Award size={32} className="mx-auto mb-2 opacity-50" />
          <p>Aún no tienes certificaciones</p>
          <p className="text-xs">Agrega al menos una para destacar en el directorio</p>
        </div>
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
