import { createServiceClient } from '@/lib/supabase/server'
import { ClaimsManager } from './ClaimsManager'

export default async function AdminClaims() {
  const sb = createServiceClient()
  const { data: claims } = await sb.from('claim_requests')
    .select('*, tecnicos(id, nombre_empresa, slug, telefono, email_publico, user_id)')
    .order('estado')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-3xl text-azul font-bold">Solicitudes de reclamo</h1>
        <p className="text-sm text-gris-3">
          Técnicos que quieren reclamar perfiles pre-cargados. Verifica que sean los dueños reales antes de aprobar.
        </p>
      </div>
      <ClaimsManager claims={claims || []} />
    </div>
  )
}
