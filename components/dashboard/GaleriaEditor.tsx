'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Upload, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { limiteNumerico } from '@/lib/planes'
import type { Foto, Tecnico } from '@/types/database.types'

export function GaleriaEditor({ tecnico, fotosIniciales }: { tecnico: Tecnico; fotosIniciales: Foto[] }) {
  const [fotos, setFotos] = useState(fotosIniciales)
  const [uploading, setUploading] = useState(false)
  const push = useToast(s => s.push)
  const supabase = createClient()
  const limite = limiteNumerico(tecnico, 'fotos')

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    if (fotos.length + files.length > limite) {
      push(`Límite alcanzado: ${limite} fotos máximo en tu plan`, 'error')
      return
    }
    setUploading(true)
    const nuevas: Foto[] = []
    for (const file of Array.from(files)) {
      const path = `${tecnico.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('tecnico-fotos').upload(path, file)
      if (error) {
        push(`Error subiendo ${file.name}`, 'error')
        continue
      }
      const { data: { publicUrl } } = supabase.storage.from('tecnico-fotos').getPublicUrl(path)
      const { data } = await supabase.from('tecnico_fotos').insert({
        tecnico_id: tecnico.id,
        url: publicUrl,
        storage_path: path,
        orden: fotos.length + nuevas.length,
      }).select().single()
      if (data) nuevas.push(data)
    }
    setFotos([...fotos, ...nuevas])
    setUploading(false)
    push(`${nuevas.length} foto(s) subida(s)`)
  }

  async function eliminar(foto: Foto) {
    if (!confirm('¿Eliminar esta foto?')) return
    if (foto.storage_path) {
      await supabase.storage.from('tecnico-fotos').remove([foto.storage_path])
    }
    await supabase.from('tecnico_fotos').delete().eq('id', foto.id)
    setFotos(fotos.filter(f => f.id !== foto.id))
  }

  async function marcarPortada(foto: Foto) {
    await supabase.from('tecnico_fotos').update({ es_portada: false }).eq('tecnico_id', tecnico.id)
    await supabase.from('tecnico_fotos').update({ es_portada: true }).eq('id', foto.id)
    setFotos(fotos.map(f => ({ ...f, es_portada: f.id === foto.id })))
    push('Portada actualizada')
  }

  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-display text-xl text-azul">Galería de fotos</h3>
          <p className="text-sm text-gris-3">{fotos.length} / {limite === 9999 ? '∞' : limite} fotos</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" multiple accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
          <span className="btn-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium">
            <Upload size={14} /> Subir fotos
          </span>
        </label>
      </div>

      {fotos.length === 0 ? (
        <div className="border-2 border-dashed border-borde rounded-lg p-10 text-center text-gris-3">
          Aún no has subido fotos. Sube al menos 3 para destacar tu perfil.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {fotos.map(f => (
            <div key={f.id} className="relative group aspect-square rounded-md overflow-hidden bg-papel border border-borde">
              <Image src={f.url} alt="" fill sizes="200px" className="object-cover" />
              {f.es_portada && (
                <div className="absolute top-2 left-2 bg-oro text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  PORTADA
                </div>
              )}
              <div className="absolute inset-0 bg-azul/0 group-hover:bg-azul/40 transition-colors flex items-end justify-end p-2 gap-1 opacity-0 group-hover:opacity-100">
                {!f.es_portada && (
                  <button onClick={() => marcarPortada(f)} className="p-1.5 bg-white rounded-full hover:bg-oro hover:text-white" title="Marcar como portada">
                    <Star size={14} />
                  </button>
                )}
                <button onClick={() => eliminar(f)} className="p-1.5 bg-white rounded-full hover:bg-rojo hover:text-white">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
