'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

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
  const [enviado, setEnviado] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/cotizaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, tecnico_id: tecnicoId }),
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
        <h4 className="font-display text-lg text-azul">¡Cotización enviada!</h4>
        <p className="text-sm text-gris-4">El técnico recibió tu solicitud y te contactará pronto.</p>
      </div>
    )
  }

  return (
    <form id="cotizar" onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
      <h4 className="font-display text-lg text-azul">Solicitar cotización</h4>
      <p className="text-xs text-gris-3 -mt-2">Es gratis y sin compromiso. El técnico te contactará pronto.</p>

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

      {/* honeypot */}
      <input type="text" name="_h" className="hidden" tabIndex={-1} autoComplete="off" />

      <Button type="submit" loading={isSubmitting} className="w-full">
        Enviar solicitud
      </Button>
    </form>
  )
}
