import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlanGestion } from './PlanGestion'

export default async function PlanPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/registro-tecnico')

  const { data: suscripciones } = await sb.from('suscripciones')
    .select('*').eq('tecnico_id', tecnico.id).order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-azul mb-1">Mi plan</h1>
      <p className="text-gris-4 mb-6">Gestiona tu suscripción y pagos</p>
      <PlanGestion tecnico={tecnico} email={user.email || ''} suscripciones={suscripciones || []} />
    </div>
  )
}
