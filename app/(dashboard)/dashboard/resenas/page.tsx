import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResenasManager } from './ResenasManager'

export default async function ResenasPage() {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/login')
  const { data: tecnico } = await sb.from('tecnicos').select('*').eq('user_id', user.id).single()
  if (!tecnico) redirect('/registro-tecnico')

  const { data: resenas } = await sb.from('resenas').select('*').eq('tecnico_id', tecnico.id).order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl text-azul mb-4">Reseñas</h1>
      <ResenasManager resenas={resenas || []} tecnico={tecnico} />
    </div>
  )
}
