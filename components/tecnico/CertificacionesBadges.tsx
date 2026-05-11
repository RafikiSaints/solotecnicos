import { Award } from 'lucide-react'
import type { Certificacion } from '@/types/database.types'

export function CertificacionesBadges({ certificaciones }: { certificaciones: Certificacion[] }) {
  const aprobadas = certificaciones.filter(c => c.estado === 'aprobada')
  if (!aprobadas.length) return null

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {aprobadas.map(c => (
        <div key={c.id} className="flex items-center gap-3 p-3 rounded-md border border-oro/30 bg-oro/5">
          <div className="h-10 w-10 rounded-full bg-oro/15 flex items-center justify-center shrink-0">
            <Award size={18} className="text-oro" />
          </div>
          <div>
            <div className="font-medium text-azul text-sm">{c.nombre}</div>
            {c.entidad_emisora && <div className="text-xs text-gris-3">{c.entidad_emisora}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
