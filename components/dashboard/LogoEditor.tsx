'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Upload, X, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { Tecnico } from '@/types/database.types'

export function LogoEditor({ tecnico }: { tecnico: Tecnico }) {
  const [logoUrl, setLogoUrl] = useState(tecnico.logo_url)
  const [subiendo, setSubiendo] = useState(false)
  const push = useToast(s => s.push)

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      push('El logo debe pesar máximo 2MB', 'error')
      return
    }
    setSubiendo(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload/logo', { method: 'POST', body: form })
    setSubiendo(false)
    if (res.ok) {
      const { url } = await res.json()
      setLogoUrl(url)
      push('Logo actualizado ✓')
    } else {
      const err = await res.json().catch(() => ({}))
      push(err.error || 'Error subiendo logo', 'error')
    }
    e.target.value = ''
  }

  async function eliminar() {
    if (!confirm('¿Quitar el logo? Se mostrará la inicial del nombre.')) return
    const res = await fetch('/api/upload/logo', { method: 'DELETE' })
    if (res.ok) {
      setLogoUrl(null)
      push('Logo eliminado')
    }
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-start gap-6">
        {/* Preview circular */}
        <div className="shrink-0">
          <div className="relative h-28 w-28 rounded-full bg-papel border-4 border-white shadow-card overflow-hidden flex items-center justify-center text-3xl text-azul font-display font-bold">
            {logoUrl ? (
              <Image src={logoUrl} alt="" fill sizes="112px" className="object-cover" />
            ) : (
              <Building2 size={36} className="text-gris-3" />
            )}
          </div>
          <p className="text-xs text-center text-gris-3 mt-2">Vista previa</p>
        </div>

        {/* Info + acciones */}
        <div className="flex-1 min-w-[260px]">
          <h3 className="font-display text-xl text-azul font-bold mb-1">Logo de empresa</h3>
          <p className="text-sm text-gris-4 mb-3">
            Aparece como avatar circular en tu perfil público y en las tarjetas del directorio.
          </p>

          <div className="rounded-md bg-azul-mid/5 border border-azul-mid/20 p-3 text-xs text-gris-4 mb-3">
            <strong className="text-azul block mb-1">📐 Requisitos del logo:</strong>
            <ul className="space-y-0.5 list-disc pl-4">
              <li><strong>Tamaño ideal:</strong> 400 × 400 px (cuadrado)</li>
              <li><strong>Formato:</strong> PNG con fondo transparente (preferido) · JPG · WebP</li>
              <li><strong>Peso máx:</strong> 2 MB</li>
              <li><strong>Sin texto pequeño</strong> (se ve circular y chico)</li>
              <li><strong>Si no tienes logo:</strong> usa una foto cuadrada del local o un avatar profesional tuyo</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onUpload} disabled={subiendo} />
              <span className="btn-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold">
                <Upload size={14} /> {subiendo ? 'Subiendo...' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
              </span>
            </label>
            {logoUrl && (
              <Button variant="ghost" size="sm" onClick={eliminar} className="!text-rojo hover:!bg-rojo/5">
                <X size={14} /> Quitar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
