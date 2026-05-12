import { createServiceClient } from '@/lib/supabase/server'
import { TecnicosTable } from './TecnicosTable'

export default async function AdminTecnicos() {
  const sb = createServiceClient()
  const { data: tecnicos } = await sb.from('tecnicos')
    .select('id, slug, nombre_empresa, nombre_contacto, comuna, plan, plan_vence_en, verificado, activo, destacado, rating_promedio, total_resenas, telefono, email_publico, created_at, region_id, regiones(nombre)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-display text-3xl text-azul font-bold">Técnicos</h1>
          <p className="text-sm text-gris-3">{tecnicos?.length || 0} técnicos registrados</p>
        </div>
      </div>
      <TecnicosTable tecnicos={(tecnicos || []) as any} />
    </div>
  )
}
