'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  email: string
  cliente: { nombre: string | null; telefono: string | null } | null
}

export function EditarPerfilCliente({ userId, email, cliente }: Props) {
  const supabase = createClient()
  const push = useToast(s => s.push)
  const [form, setForm] = useState({
    nombre: cliente?.nombre || '',
    telefono: cliente?.telefono || '',
  })
  const [pwd, setPwd] = useState({ nueva: '', confirmar: '' })
  const [loadingDatos, setLoadingDatos] = useState(false)
  const [loadingPwd, setLoadingPwd] = useState(false)

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault()
    setLoadingDatos(true)

    // Upsert: si no existe, crear; si existe, actualizar
    const { error } = await supabase.from('clientes').upsert({
      user_id: userId,
      nombre: form.nombre,
      email,
      telefono: form.telefono || null,
    }, { onConflict: 'user_id' })

    if (!error) {
      await supabase.auth.updateUser({ data: { nombre: form.nombre } })
    }

    setLoadingDatos(false)
    if (error) push(`Error: ${error.message}`, 'error')
    else push('Perfil actualizado')
  }

  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwd.nueva !== pwd.confirmar) {
      push('Las contraseñas no coinciden', 'error')
      return
    }
    if (pwd.nueva.length < 6) {
      push('La contraseña debe tener al menos 6 caracteres', 'error')
      return
    }
    setLoadingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: pwd.nueva })
    setLoadingPwd(false)
    if (error) push(`Error: ${error.message}`, 'error')
    else {
      push('Contraseña actualizada')
      setPwd({ nueva: '', confirmar: '' })
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={guardarDatos} className="card space-y-4">
        <h3 className="font-display text-lg text-azul font-bold">Datos personales</h3>
        <Input label="Email" value={email} disabled helper="No se puede cambiar (escribe a hola@solotecnicos.cl si necesitas cambiarlo)" />
        <Input label="Nombre" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        <Input label="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+56 9 1234 5678" />
        <Button type="submit" loading={loadingDatos}>Guardar cambios</Button>
      </form>

      <form onSubmit={cambiarPassword} className="card space-y-4">
        <h3 className="font-display text-lg text-azul font-bold">Cambiar contraseña</h3>
        <Input label="Nueva contraseña" type="password" required minLength={6} value={pwd.nueva} onChange={e => setPwd({ ...pwd, nueva: e.target.value })} />
        <Input label="Confirmar contraseña" type="password" required value={pwd.confirmar} onChange={e => setPwd({ ...pwd, confirmar: e.target.value })} />
        <Button type="submit" loading={loadingPwd}>Cambiar contraseña</Button>
      </form>
    </div>
  )
}
