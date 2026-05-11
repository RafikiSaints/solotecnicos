'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'

export default function NuevoArticulo() {
  const router = useRouter()
  const push = useToast(s => s.push)
  const supabase = createClient()
  const [form, setForm] = useState({
    titulo: '', resumen: '', contenido: '', imagen_url: '', publicado: false,
  })
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const slug = slugify(form.titulo)
    const { data, error } = await supabase.from('blog_articulos').insert({
      ...form,
      slug,
    }).select().single()
    setLoading(false)
    if (error) { push(error.message, 'error'); return }
    push('Artículo creado')
    router.push('/admin/blog')
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-azul mb-6">Nuevo artículo</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Título" required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
        <Textarea label="Resumen" value={form.resumen} onChange={e => setForm({ ...form, resumen: e.target.value })} />
        <Input label="URL de imagen" value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })} />
        <Textarea label="Contenido (HTML)" required value={form.contenido} onChange={e => setForm({ ...form, contenido: e.target.value })} className="min-h-[300px] font-mono text-xs" />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.publicado} onChange={e => setForm({ ...form, publicado: e.target.checked })} />
          <span className="text-sm">Publicar inmediatamente</span>
        </label>
        <Button type="submit" loading={loading}>Crear artículo</Button>
      </form>
    </div>
  )
}
