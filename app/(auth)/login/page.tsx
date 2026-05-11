'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const push = useToast(s => s.push)
  const supabase = createClient()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword(form)
    setLoading(false)
    if (error) {
      push(error.message, 'error')
    } else {
      push('Bienvenido de vuelta')
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-soft border border-borde p-8 space-y-5">
      <div>
        <h1 className="font-display text-3xl text-azul">Iniciar sesión</h1>
        <p className="text-sm text-gris-3 mt-1">Bienvenido de vuelta a SoloTécnicos</p>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={loginGoogle}>
        Continuar con Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-borde" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gris-3">o</span></div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input label="Contraseña" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <div className="flex justify-end">
          <Link href="/recuperar-password" className="text-xs text-azul hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">Iniciar sesión</Button>
      </form>

      <p className="text-sm text-center text-gris-4">
        ¿No tienes cuenta?{' '}
        <Link href="/registro-tecnico" className="text-rojo font-medium hover:underline">Únete gratis</Link>
      </p>
    </div>
  )
}
