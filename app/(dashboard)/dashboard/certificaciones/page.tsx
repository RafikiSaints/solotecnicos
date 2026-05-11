import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CertificacionesManager } from './CertificacionesManager'
import { UpgradePrompt } from '@/components/ui/UpgradePrompt'
import { puedeHacer } from '@/lib/planes'

export default async function CertificacionesPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/registro-tecnico')

  if (!puedeHacer(tecnico, 'certificaciones')) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="font-display text-3xl text-azul mb-4">Certificaciones</h1>
        <UpgradePrompt feature="Sube tus certificados y nuestro equipo los verifica para mostrarlos como badges. Disponible en PRO." />
      </div>
    )
  }

  const { data: certificaciones } = await sb.from('tecnico_certificaciones')
    .select('*').eq('tecnico_id', tecnico.id).order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-azul mb-4">Certificaciones</h1>
      <CertificacionesManager tecnico={tecnico} iniciales={certificaciones || []} />
    </div>
  )
}
