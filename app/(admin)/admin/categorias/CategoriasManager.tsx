'use client'
import { useState } from 'react'
import { Plus, Trash2, GripVertical, Edit3, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Categoria } from '@/types/database.types'

export function CategoriasManager({ iniciales }: { iniciales: Categoria[] }) {
  const [items, setItems] = useState(iniciales)
  const [agregar, setAgregar] = useState(false)
  const [editando, setEditando] = useState<number | null>(null)
  const [form, setForm] = useState({ nombre: '', icono: '🔧', descripcion: '' })
  const [guardando, setGuardando] = useState(false)
  const push = useToast(s => s.push)
  const supabase = createClient()

  async function crear(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true)
    const slug = slugify(form.nombre)
    const orden = (Math.max(...items.map(c => c.orden), 0)) + 1
    const { data, error } = await supabase.from('categorias').insert({
      nombre: form.nombre,
      slug,
      icono: form.icono || '🔧',
      descripcion: form.descripcion || null,
      orden,
    }).select().single()
    setGuardando(false)
    if (error) { push(`Error: ${error.message}`, 'error'); return }
    if (data) {
      setItems([...items, data])
      setForm({ nombre: '', icono: '🔧', descripcion: '' })
      setAgregar(false)
      push('Categoría creada')
    }
  }

  async function actualizar(c: Categoria) {
    const { error } = await supabase.from('categorias').update({
      nombre: c.nombre,
      icono: c.icono,
      descripcion: c.descripcion,
    }).eq('id', c.id)
    if (error) push(`Error: ${error.message}`, 'error')
    else push('Actualizada')
  }

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar "${nombre}"? Si hay técnicos en esta categoría, perderán esta etiqueta.`)) return
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) { push(`Error: ${error.message}`, 'error'); return }
    setItems(items.filter(c => c.id !== id))
    push('Categoría eliminada')
  }

  // Sugerencias de iconos por especialidad
  const ICONOS_SUGERIDOS = ['🎮', '🔧', '⚡', '💻', '📱', '❄️', '🚿', '📺', '🧊', '🧺', '🔒', '🖨️', '⚙️', '🔥', '📷', '📡', '🚗', '🛠️', '🏠', '🔌']

  return (
    <div className="space-y-4">
      {/* Explicación */}
      <div className="card text-white" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)' }}>
        <h3 className="font-display text-lg font-bold mb-2">💡 ¿Cómo agregar una categoría?</h3>
        <p className="text-sm text-white/90">
          Las categorías son las <strong>especialidades</strong> que aparecen en el filtro principal del directorio.
          Si necesitas una nueva (ej: <em>"Reparación de consolas"</em> con icono 🎮), créala aquí.
          Después los técnicos la podrán seleccionar en su perfil.
        </p>
      </div>

      {agregar ? (
        <form onSubmit={crear} className="card space-y-3">
          <h4 className="font-display text-lg text-azul font-bold">Nueva categoría</h4>
          <Input label="Nombre" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Reparación de consolas" />

          <div>
            <label className="label-st">Icono (emoji)</label>
            <Input value={form.icono} onChange={e => setForm({ ...form, icono: e.target.value })} placeholder="🎮" maxLength={2} className="!w-16 text-center text-xl" />
            <p className="text-xs text-gris-3 mt-1">Click en uno de estos o pega cualquier emoji:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {ICONOS_SUGERIDOS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm({ ...form, icono: emoji })}
                  className={`text-xl p-1 rounded hover:bg-papel ${form.icono === emoji ? 'bg-azul-mid/10' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Input label="Descripción (opcional)" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Breve descripción de la categoría" />

          {form.nombre && (
            <div className="rounded-md bg-papel p-3 text-sm">
              <strong className="text-gris-3 text-xs uppercase block mb-1">Vista previa:</strong>
              <span className="text-azul">{form.icono} {form.nombre}</span>
              <span className="text-xs text-gris-3 block mt-1">URL: /categoria/{slugify(form.nombre)}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" loading={guardando}>Crear categoría</Button>
            <Button type="button" variant="ghost" onClick={() => setAgregar(false)}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setAgregar(true)}>
          <Plus size={14} /> Agregar categoría
        </Button>
      )}

      {/* Lista */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gris-3 uppercase border-b border-borde">
              <th className="pb-2 w-12">Icono</th>
              <th className="pb-2">Nombre</th>
              <th className="pb-2">Slug</th>
              <th className="pb-2">Orden</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id} className="border-b border-borde">
                {editando === c.id ? (
                  <>
                    <td className="py-2">
                      <input
                        type="text"
                        value={c.icono || ''}
                        onChange={e => setItems(items.map(x => x.id === c.id ? { ...x, icono: e.target.value } : x))}
                        className="w-12 text-center text-lg input-st"
                        maxLength={2}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={c.nombre}
                        onChange={e => setItems(items.map(x => x.id === c.id ? { ...x, nombre: e.target.value } : x))}
                        className="input-st"
                      />
                    </td>
                    <td className="text-xs text-gris-3">{c.slug}</td>
                    <td>{c.orden}</td>
                    <td className="flex gap-1 py-2">
                      <button onClick={() => { actualizar(c); setEditando(null) }} className="text-verde p-1 hover:bg-verde/10 rounded"><Check size={14} /></button>
                      <button onClick={() => setEditando(null)} className="text-gris-3 p-1 hover:bg-papel rounded"><X size={14} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 text-xl">{c.icono}</td>
                    <td className="font-medium text-azul">{c.nombre}</td>
                    <td className="text-xs text-gris-3">{c.slug}</td>
                    <td className="text-xs text-gris-3">{c.orden}</td>
                    <td className="flex gap-1 py-2">
                      <button onClick={() => setEditando(c.id)} className="text-azul-mid p-1 hover:bg-azul-mid/10 rounded"><Edit3 size={14} /></button>
                      <button onClick={() => eliminar(c.id, c.nombre)} className="text-rojo p-1 hover:bg-rojo/10 rounded"><Trash2 size={14} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
