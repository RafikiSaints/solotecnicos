import { createClient } from '@/lib/supabase/server'
import { CertificacionesModeracion } from './CertificacionesModeracion'

export default async function AdminCertificaciones() {
  const sb = createClient()
  const { data: certs } = await sb.from('tecnico_certificaciones')
    .select('*, tecnicos(nombre_empresa, slug)')
    .order('estado')
    .order('created_at', { ascending: false })
  return (
    <div>
      <h1 className="font-display text-3xl text-azul mb-4">Certificaciones</h1>
      <CertificacionesModeracion certs={certs || []} />
    </div>
  )
}
