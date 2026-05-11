import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default async function AdminTecnicos() {
  const sb = createClient()
  const { data: tecnicos } = await sb.from('tecnicos')
    .select('*, regiones(nombre)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-display text-3xl text-azul">Técnicos</h1>
        <Link href="/admin/tecnicos/nuevo"><Button>+ Crear técnico</Button></Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gris-3 uppercase border-b border-borde">
            <tr><th className="pb-2">Empresa</th><th>Región</th><th>Plan</th><th>Rating</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {tecnicos?.map((t: any) => (
              <tr key={t.id} className="border-b border-borde">
                <td className="py-2">
                  <Link href={`/tecnico/${t.slug}`} className="text-azul hover:underline font-medium">{t.nombre_empresa}</Link>
                  <div className="text-xs text-gris-3">{t.comuna}</div>
                </td>
                <td>{t.regiones?.nombre}</td>
                <td><Badge tone={t.plan === 'elite' ? 'oro' : t.plan === 'pro' ? 'azul' : 'gris'}>{t.plan}</Badge></td>
                <td>{(t.rating_promedio || 0).toFixed(1)} ({t.total_resenas})</td>
                <td>
                  {t.activo ? <Badge tone="verde">Activo</Badge> : <Badge tone="rojo">Inactivo</Badge>}
                  {t.verificado && <Badge tone="azul" className="ml-1">Verificado</Badge>}
                </td>
                <td><Link href={`/admin/tecnicos/${t.id}`} className="text-xs text-azul hover:underline">Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
