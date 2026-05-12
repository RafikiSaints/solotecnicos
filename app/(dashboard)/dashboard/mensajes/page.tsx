import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BandejaMensajes } from '@/components/dashboard/BandejaMensajes'

export default async function MensajesPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/registro-tecnico')

  const { data: cotizaciones } = await sb.from('cotizaciones')
    .select('*')
    .eq('tecnico_id', tecnico.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display text-3xl text-azul mb-1 font-bold">Cotizaciones</h1>
      <p className="text-sm text-gris-3 mb-4">Solicitudes de clientes — contacta por teléfono, WhatsApp o email y registra el estado.</p>
      <BandejaMensajes tecnico={tecnico} cotizaciones={cotizaciones || []} />
    </div>
  )
}
