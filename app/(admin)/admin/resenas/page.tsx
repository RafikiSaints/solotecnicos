import { createClient } from '@/lib/supabase/server'
import { ResenasModeracion } from './ResenasModeracion'

export default async function AdminResenas() {
  const sb = createClient()
  const { data: resenas } = await sb.from('resenas')
    .select('*, tecnicos(nombre_empresa, slug)')
    .order('aprobada')
    .order('created_at', { ascending: false })
    .limit(100)
  return (
    <div>
      <h1 className="font-display text-3xl text-azul mb-4">Moderación de reseñas</h1>
      <ResenasModeracion resenas={resenas || []} />
    </div>
  )
}
