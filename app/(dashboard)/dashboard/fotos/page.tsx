import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoEditor } from '@/components/dashboard/LogoEditor'
import { GaleriaEditor } from '@/components/dashboard/GaleriaEditor'
import { PortafolioEditor } from '@/components/dashboard/PortafolioEditor'

export default async function FotosPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/completar-perfil')

  const [{ data: fotos }, { data: trabajos }] = await Promise.all([
    sb.from('tecnico_fotos').select('*').eq('tecnico_id', tecnico.id).order('orden'),
    sb.from('tecnico_trabajos').select('*').eq('tecnico_id', tecnico.id).order('orden'),
  ])

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-azul font-bold">Fotos y portafolio</h1>
        <p className="text-sm text-gris-3">Logo de empresa, galería de trabajos y portafolio antes/después</p>
      </div>

      <LogoEditor tecnico={tecnico} />
      <GaleriaEditor tecnico={tecnico} fotosIniciales={fotos || []} />
      <PortafolioEditor tecnico={tecnico} trabajosIniciales={trabajos || []} />
    </div>
  )
}
