import Link from 'next/link'
import { RatingDisplay } from '@/components/ui/StarRating'
import type { TecnicoConRelaciones } from '@/types/database.types'

export function SidebarTecnicosRelacionados({ tecnicos }: { tecnicos: TecnicoConRelaciones[] }) {
  if (!tecnicos.length) return null
  return (
    <aside className="card">
      <h3 className="font-display text-lg text-azul mb-3">Técnicos destacados</h3>
      <div className="space-y-3">
        {tecnicos.map(t => (
          <Link key={t.id} href={`/tecnico/${t.slug}`} className="block hover:bg-papel rounded-md -mx-2 px-2 py-2">
            <div className="font-medium text-azul text-sm">{t.nombre_empresa}</div>
            <div className="text-xs text-gris-3">{t.comuna}</div>
            <RatingDisplay value={t.rating_promedio || 0} totalResenas={t.total_resenas} />
          </Link>
        ))}
      </div>
    </aside>
  )
}
