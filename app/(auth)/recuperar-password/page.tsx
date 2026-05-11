'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarPasswordPage() {
  const push = useToast(s => s.push)
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setLoading(false)
    if (error) {
      push(error.message, 'error')
    } else {
      setEnviado(true)
      push('Revisa tu email para el link de recuperación')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-soft border border-borde p-8 space-y-5">
      <div>
        <h1 className="font-display text-3xl text-azul">Recuperar contraseña</h1>
        <p className="text-sm text-gris-3 mt-1">Te enviaremos un link a tu email</p>
      </div>

      {enviado ? (
        <div className="text-center space-y-3">
          <div className="text-4xl">📬</div>
          <p className="text-gris-4">Revisa tu bandeja de entrada. El link expira en 1 hora.</p>
          <Link href="/login" className="text-azul font-medium hover:underline text-sm">← Volver al login</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          <Button type="submit" loading={loading} className="w-full">Enviar link</Button>
          <p className="text-sm text-center"><Link href="/login" className="text-azul hover:underline">← Volver</Link></p>
        </form>
      )}
    </div>
  )
}
