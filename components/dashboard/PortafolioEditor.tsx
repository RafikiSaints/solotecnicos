'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { limiteNumerico } from '@/lib/planes'
import type { Trabajo, Tecnico } from '@/types/database.types'

export function PortafolioEditor({ tecnico, trabajosIniciales }: { tecnico: Tecnico; trabajosIniciales: Trabajo[] }) {
  const supabase = createClient()
  const push = useToast(s => s.push)
  const [trabajos, setTrabajos] = useState(trabajosIniciales)
  const limite = limiteNumerico(tecnico, 'trabajos_portafolio')

  async function agregar() {
    if (trabajos.length >= limite) {
      push(`Límite: ${limite} trabajos`, 'error')
      return
    }
    const { data } = await supabase.from('tecnico_trabajos').insert({
      tecnico_id: tecnico.id,
      titulo: 'Nuevo trabajo',
      orden: trabajos.length,
    }).select().single()
    if (data) setTrabajos([...trabajos, data])
  }

  async function subirFoto(trabajoId: string, file: File, campo: 'foto_antes' | 'foto_despues') {
    const path = `${tecnico.id}/portafolio/${trabajoId}-${campo}-${Date.now()}`
    const { error } = await supabase.storage.from('tecnico-fotos').upload(path, file, { upsert: true })
    if (error) { push('Error subiendo foto', 'error'); return }
    const { data: { publicUrl } } = supabase.storage.from('tecnico-fotos').getPublicUrl(path)
    await supabase.from('tecnico_trabajos').update({ [campo]: publicUrl }).eq('id', trabajoId)
    setTrabajos(t => t.map(x => x.id === trabajoId ? { ...x, [campo]: publicUrl } : x))
  }

  async function actualizar(t: Trabajo) {
    await supabase.from('tecnico_trabajos').update({
      titulo: t.titulo, descripcion: t.descripcion,
    }).eq('id', t.id)
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar?')) return
    await supabase.from('tecnico_trabajos').delete().eq('id', id)
    setTrabajos(trabajos.filter(t => t.id !== id))
  }

  return (
    <div className="card space-y-4">
      <div className="flex justify-between">
        <div>
          <h3 className="font-display text-xl text-azul font-bold">Portafolio: antes y después</h3>
          <p className="text-sm text-gris-3">{trabajos.length} / {limite === 9999 ? '∞' : limite} trabajos</p>
        </div>
        <Button size="sm" onClick={agregar}><Plus size={14} /> Agregar trabajo</Button>
      </div>

      {trabajos.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-azul-mid/30 bg-azul-mid/5 p-4 space-y-3">
          <div className="font-semibold text-azul-mid flex items-center gap-1.5 text-sm">💡 Ejemplo de un buen "antes y después":</div>

          <div className="bg-white rounded-lg border border-borde p-4 space-y-2">
            <strong className="text-azul block">Limpieza de aire acondicionado split en departamento</strong>
            <p className="text-sm text-gris-4">
              Cliente nos llamó porque el split estaba botando agua y olía mal. Limpieza profunda con químico, cambio de filtros y revisión de la cañería de drenaje. Quedó como nuevo.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative aspect-video bg-gris-3/20 rounded flex items-center justify-center text-xs text-gris-3 font-semibold">
                📸 FOTO ANTES
              </div>
              <div className="relative aspect-video bg-verde/10 rounded flex items-center justify-center text-xs text-verde font-semibold">
                📸 FOTO DESPUÉS
              </div>
            </div>
          </div>

          <div className="text-xs text-gris-3 space-y-1">
            <p><strong>Tips para que conviertan más:</strong></p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Toma fotos con buena luz, desde el mismo ángulo</li>
              <li>El "antes" debe mostrar el problema claramente (suciedad, rotura, etc.)</li>
              <li>El "después" debe verse limpio, ordenado, terminado</li>
              <li>Describe brevemente qué hiciste y por qué</li>
            </ul>
          </div>
        </div>
      )}

      {trabajos.length > limite && limite < 9999 && (
        <div className="rounded-md border-2 border-oro/30 bg-oro/5 p-3 text-sm">
          <strong className="text-oro">⚠️ Tienes {trabajos.length} trabajos pero tu plan solo muestra {limite} al público.</strong>
          <p className="text-xs text-gris-4 mt-1">
            Los {trabajos.length - limite} trabajos extras siguen guardados y se mostrarán cuando renueves a un plan superior.
          </p>
        </div>
      )}

      {trabajos.map((t, i) => {
        const oculto = i >= limite && limite < 9999
        return (
          <div key={t.id} className={`border-2 rounded-lg p-4 space-y-3 ${oculto ? 'border-oro/40 bg-oro/5' : 'border-borde'}`}>
            {oculto && (
              <div className="text-xs font-semibold text-oro flex items-center gap-1.5">
                👁️‍🗨️ Oculto al público — disponible con plan PRO/Elite
              </div>
            )}
            <div className="flex justify-between items-start">
              <Input value={t.titulo} onChange={e => {
                const nuevo = { ...t, titulo: e.target.value }
                setTrabajos(trabajos.map((x, j) => j === i ? nuevo : x))
                actualizar(nuevo)
              }} />
              <Button variant="ghost" size="sm" onClick={() => eliminar(t.id)}><Trash2 size={14} /></Button>
            </div>
            <Textarea value={t.descripcion || ''} onChange={e => {
              const nuevo = { ...t, descripcion: e.target.value }
              setTrabajos(trabajos.map((x, j) => j === i ? nuevo : x))
              actualizar(nuevo)
            }} placeholder="Descripción breve" />
            <div className="grid grid-cols-2 gap-2">
              <FotoUpload label="Antes" url={t.foto_antes} onUpload={f => subirFoto(t.id, f, 'foto_antes')} />
              <FotoUpload label="Después" url={t.foto_despues} onUpload={f => subirFoto(t.id, f, 'foto_despues')} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FotoUpload({ label, url, onUpload }: { label: string; url: string | null; onUpload: (f: File) => void }) {
  return (
    <label className="block cursor-pointer">
      <span className="text-xs text-gris-3">{label}</span>
      <div className="mt-1 aspect-video rounded-md border-2 border-dashed border-borde bg-papel relative overflow-hidden flex items-center justify-center hover:border-azul">
        {url ? (
          <Image src={url} alt="" fill className="object-cover" />
        ) : (
          <span className="text-xs text-gris-3 flex items-center gap-1"><Upload size={12} /> Subir</span>
        )}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
    </label>
  )
}
