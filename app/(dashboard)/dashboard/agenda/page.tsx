import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AgendaCalendario } from '@/components/dashboard/AgendaCalendario'
import { UpgradePrompt } from '@/components/ui/UpgradePrompt'
import { puedeHacer } from '@/lib/planes'

export default async function AgendaPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/registro-tecnico')

  if (!puedeHacer(tecnico, 'agenda')) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="font-display text-3xl text-azul mb-4">Agenda</h1>
        <UpgradePrompt feature="Organiza tus visitas y citas con un calendario integrado. Disponible en PRO." />
      </div>
    )
  }

  const { data: citas } = await sb.from('agenda').select('*').eq('tecnico_id', tecnico.id).order('fecha')

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl text-azul mb-1 font-bold">Agenda</h1>
      <p className="text-sm text-gris-3 mb-4">Tu calendario personal de citas y visitas a clientes</p>
      <AgendaCalendario citas={citas || []} tecnico={tecnico} />
    </div>
  )
}
