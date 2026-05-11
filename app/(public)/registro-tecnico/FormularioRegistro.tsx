'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import type { Categoria, Region } from '@/types/database.types'

interface Props {
  categorias: Categoria[]
  regiones: Region[]
}

export function FormularioRegistro({ categorias, regiones }: Props) {
  const router = useRouter()
  const push = useToast(s => s.push)
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre_empresa: '', email: '', password: '', telefono: '',
    region_id: '', categoria_id: '',
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMensaje(null)

    // 1. Crear usuario
    const { data: auth, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { role: 'tecnico' } },
    })
    if (authErr || !auth.user) {
      push(authErr?.message || 'Error en registro', 'error')
      setLoading(false)
      return
    }

    // 2. Crear técnico vía API server-side (service_role salta RLS)
    const r = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: auth.user.id,
        nombre_empresa: form.nombre_empresa,
        telefono: form.telefono,
        email_publico: form.email,
        region_id: form.region_id ? Number(form.region_id) : null,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      }),
    })
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Error desconocido' }))
      push(`Error creando perfil: ${err.error}`, 'error')
      setLoading(false)
      return
    }

    setLoading(false)

    // 3. Si la sesión ya está activa (email confirmation = off), redirigir al dashboard.
    //    Si está pendiente de confirmación (email confirmation = on), mostrar mensaje.
    if (auth.session) {
      push('¡Bienvenido a SoloTécnicos!')
      router.push('/dashboard/perfil')
      router.refresh()
    } else {
      setMensaje('Cuenta creada. Revisa tu email para confirmar y luego inicia sesión.')
    }
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/completar-perfil` },
    })
  }

  if (mensaje) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-4xl">📬</div>
        <h3 className="font-display text-2xl text-azul">Revisa tu email</h3>
        <p className="text-sm text-gris-4">{mensaje}</p>
        <a href="/login" className="text-rojo font-medium text-sm hover:underline">Ir al login →</a>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h3 className="font-display text-2xl text-azul">Crea tu cuenta gratis</h3>

      <Button type="button" variant="outline" className="w-full" onClick={loginGoogle}>
        <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Continuar con Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-borde" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gris-3">o regístrate con email</span></div>
      </div>

      <Input label="Nombre de tu empresa" required value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} />
      <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <Input label="Contraseña" type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
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
      <Button type="submit" loading={loading} className="w-full">Crear cuenta gratis</Button>
      <p className="text-xs text-gris-3 text-center">Al registrarte aceptas los términos de servicio</p>
    </form>
  )
}
