import { createServiceClient } from '@/lib/supabase/server'
import { ResenasModeracion } from './ResenasModeracion'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminResenas() {
  const sb = createServiceClient()
  const { data: resenas } = await sb.from('resenas')
    .select('*, tecnicos(nombre_empresa, slug)')
    .order('aprobada')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-display text-3xl text-azul font-bold">Moderación de reseñas</h1>
          <p className="text-sm text-gris-3">{resenas?.length || 0} reseñas en total · pendientes aparecen primero</p>
        </div>
      </div>
      <ResenasModeracion resenas={resenas || []} />
    </div>
  )
}
