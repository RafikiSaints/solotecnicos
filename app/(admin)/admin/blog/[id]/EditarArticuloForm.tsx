'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type { BlogArticulo, Categoria } from '@/types/database.types'

export function EditarArticuloForm({ articulo, categorias }: { articulo: BlogArticulo; categorias: Categoria[] }) {
  const router = useRouter()
  const push = useToast(s => s.push)
  const supabase = createClient()
  const [form, setForm] = useState({
    titulo: articulo.titulo,
    resumen: articulo.resumen || '',
    contenido: articulo.contenido || '',
    imagen_url: articulo.imagen_url || '',
    categoria_id: articulo.categoria_id?.toString() || '',
    publicado: articulo.publicado,
  })
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    const { error } = await supabase.from('blog_articulos').update({
      titulo: form.titulo,
      resumen: form.resumen || null,
      contenido: form.contenido || null,
      imagen_url: form.imagen_url || null,
      categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      publicado: form.publicado,
      updated_at: new Date().toISOString(),
    }).eq('id', articulo.id)
    setGuardando(false)
    if (error) { push(`Error: ${error.message}`, 'error'); return }
    push('Artículo actualizado')
    router.push('/admin/blog')
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar "${articulo.titulo}" permanentemente?`)) return
    setEliminando(true)
    await supabase.from('blog_articulos').delete().eq('id', articulo.id)
    setEliminando(false)
    push('Artículo eliminado')
    router.push('/admin/blog')
  }

  return (
    <form onSubmit={guardar} className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/admin/blog" className="text-sm text-gris-4 hover:text-azul inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Volver al listado
        </Link>
        {articulo.publicado && articulo.slug && (
          <Link href={`/blog/${articulo.slug}`} target="_blank" className="text-sm text-azul-mid hover:underline inline-flex items-center gap-1">
            Ver artículo público <ExternalLink size={12} />
          </Link>
        )}
      </div>

      <Input label="Título" required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
      <Textarea label="Resumen" value={form.resumen} onChange={e => setForm({ ...form, resumen: e.target.value })} helper="Aparece en el listado y como meta description" />
      <Input label="URL de imagen" value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })} placeholder="https://..." />
      <Select label="Categoría relacionada" value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
        <option value="">(sin categoría)</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
      </Select>
      <Textarea
        label="Contenido (HTML)"
        required
        value={form.contenido}
        onChange={e => setForm({ ...form, contenido: e.target.value })}
        className="min-h-[400px] font-mono text-xs"
        helper="Puedes usar HTML básico: <p>, <strong>, <em>, <ul>, <li>, <h2>, <h3>, etc."
      />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.publicado} onChange={e => setForm({ ...form, publicado: e.target.checked })} />
        <span className="text-sm">📢 Publicado (visible al público)</span>
      </label>

      <div className="flex justify-between items-center pt-4 border-t border-borde">
        <Button type="button" variant="ghost" onClick={eliminar} loading={eliminando} className="!text-rojo hover:!bg-rojo/5">
          <Trash2 size={14} /> Eliminar artículo
        </Button>
        <div className="flex gap-2">
          <Link href="/admin/blog">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
          <Button type="submit" loading={guardando}>Guardar cambios</Button>
        </div>
      </div>
    </form>
  )
}
