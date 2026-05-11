import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GaleriaEditor } from '@/components/dashboard/GaleriaEditor'
import { PortafolioEditor } from '@/components/dashboard/PortafolioEditor'

export default async function FotosPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/registro-tecnico')

  const [{ data: fotos }, { data: trabajos }] = await Promise.all([
    sb.from('tecnico_fotos').select('*').eq('tecnico_id', tecnico.id).order('orden'),
    sb.from('tecnico_trabajos').select('*').eq('tecnico_id', tecnico.id).order('orden'),
  ])

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="font-display text-3xl text-azul">Fotos y portafolio</h1>
      <GaleriaEditor tecnico={tecnico} fotosIniciales={fotos || []} />
      <PortafolioEditor tecnico={tecnico} trabajosIniciales={trabajos || []} />
    </div>
  )
}
