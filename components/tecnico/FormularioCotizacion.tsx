'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  cliente_nombre: z.string().min(2, 'Nombre requerido'),
  cliente_email: z.string().email('Email inválido'),
  cliente_telefono: z.string().optional(),
  descripcion: z.string().min(20, 'Describe el trabajo con al menos 20 caracteres'),
  urgencia: z.enum(['normal', 'urgente', '24h']).default('normal'),
  comuna_servicio: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function FormularioCotizacion({ tecnicoId }: { tecnicoId: string }) {
  const push = useToast(s => s.push)
  const supabase = createClient()
  const [enviado, setEnviado] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [datosCliente, setDatosCliente] = useState<{ nombre?: string; telefono?: string } | null>(null)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Auto-llenar si el usuario está logueado como cliente
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      // Auto-llenar email
      if (user.email) setValue('cliente_email', user.email)
      // Buscar perfil cliente
      const { data: cliente } = await supabase.from('clientes').select('nombre, telefono').eq('user_id', user.id).maybeSingle()
      if (cliente) {
        setDatosCliente(cliente)
        if (cliente.nombre) setValue('cliente_nombre', cliente.nombre)
        if (cliente.telefono) setValue('cliente_telefono', cliente.telefono)
      } else if (user.user_metadata?.nombre) {
        setValue('cliente_nombre', user.user_metadata.nombre)
      }
    }
    load()
  }, [setValue, supabase])

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/cotizaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        tecnico_id: tecnicoId,
        cliente_user_id: user?.id || null,
      }),
    })
    if (res.ok) {
      setEnviado(true)
      push('Cotización enviada — el técnico te contactará pronto')
    } else {
      push('Error al enviar — intenta nuevamente', 'error')
    }
  }

  if (enviado) {
    return (
      <div className="card text-center space-y-2">
        <div className="text-3xl">✅</div>
        <h4 className="font-display text-lg text-azul font-bold">¡Cotización enviada!</h4>
        <p className="text-sm text-gris-4">El técnico recibió tu solicitud y te contactará pronto.</p>
        {user && (
          <p className="text-xs text-gris-3 mt-2">
            Puedes ver el estado en <Link href="/mi-cuenta/cotizaciones" className="text-azul-mid hover:underline">mi cuenta → cotizaciones</Link>
          </p>
        )}
      </div>
    )
  }

  return (
    <form id="cotizar" onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
      <h4 className="font-display text-lg text-azul font-bold">Solicitar cotización</h4>
      <p className="text-xs text-gris-3 -mt-2">Es gratis y sin compromiso. El técnico te contactará pronto.</p>

      {user ? (
        <div className="rounded-md bg-verde/5 border border-verde/30 p-2 text-xs text-verde">
          ✓ Sesión iniciada como {user.email}. Tu cotización quedará guardada en tu cuenta.
        </div>
      ) : (
        <div className="rounded-md bg-azul-mid/5 border border-azul-mid/30 p-2 text-xs">
          💡 <Link href="/login" className="text-azul-mid font-semibold hover:underline">Inicia sesión</Link> o
          <Link href="/registro-cliente" className="text-azul-mid font-semibold hover:underline"> crea una cuenta</Link> para guardar tu historial de cotizaciones. <strong>Es gratis y opcional.</strong>
        </div>
      )}

      <Input label="Tu nombre" {...register('cliente_nombre')} error={errors.cliente_nombre?.message} />
      <Input label="Email" type="email" {...register('cliente_email')} error={errors.cliente_email?.message} />
      <Input label="Teléfono (opcional)" {...register('cliente_telefono')} />
      <Input label="Comuna del servicio" {...register('comuna_servicio')} />
      <Textarea label="Describe el problema o trabajo" {...register('descripcion')} error={errors.descripcion?.message} placeholder="Ejemplo: Mi split no enfría hace 2 días. Es marca LG, 12.000 BTU…" />
      <Select label="Urgencia" {...register('urgencia')}>
        <option value="normal">Normal — en los próximos días</option>
        <option value="urgente">Urgente — hoy o mañana</option>
        <option value="24h">Emergencia — 24/7</option>
      </Select>

      <input type="text" name="_h" className="hidden" tabIndex={-1} autoComplete="off" />

      <Button type="submit" loading={isSubmitting} className="w-full">
        Enviar solicitud
      </Button>
    </form>
  )
}
