import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { TecnicosTable } from './TecnicosTable'
import { Button } from '@/components/ui/Button'

export default async function AdminTecnicos() {
  const sb = createServiceClient()
  const { data: tecnicos } = await sb.from('tecnicos')
    .select('id, slug, user_id, nombre_empresa, nombre_contacto, comuna, plan, plan_vence_en, verificado, activo, destacado, rating_promedio, total_resenas, telefono, email_publico, created_at, region_id, regiones(nombre)')
    .order('created_at', { ascending: false })

  const huerfanos = (tecnicos || []).filter((t: any) => !t.user_id).length

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-display text-3xl text-azul font-bold">Técnicos</h1>
          <p className="text-sm text-gris-3">
            {tecnicos?.length || 0} registrados
            {huerfanos > 0 && <> · <span className="text-oro font-medium">{huerfanos} sin reclamar</span></>}
          </p>
        </div>
        <Link href="/admin/tecnicos/nuevo">
          <Button><Plus size={14} /> Crear técnico</Button>
        </Link>
      </div>
      <TecnicosTable tecnicos={(tecnicos || []) as any} />
    </div>
  )
}
