import { createServiceClient } from '@/lib/supabase/server'
import { CertificacionesModeracion } from './CertificacionesModeracion'

export default async function AdminCertificaciones() {
  const sb = createServiceClient()
  const { data: certs } = await sb.from('tecnico_certificaciones')
    .select('*, tecnicos(nombre_empresa, slug)')
    .order('estado')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-display text-3xl text-azul font-bold">Certificaciones</h1>
          <p className="text-sm text-gris-3">{certs?.length || 0} certificaciones · pendientes primero</p>
        </div>
      </div>
      <CertificacionesModeracion certs={certs || []} />
    </div>
  )
}
