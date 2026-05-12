'use client'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Badge } from '@/components/ui/Badge'
import { precioFormateado, PLANES } from '@/lib/planes'
import { formatearFecha } from '@/lib/utils'

export function PagosTable({ suscripciones }: { suscripciones: any[] }) {
  return (
    <TablaPaginada
      data={suscripciones}
      perPage={25}
      searchFn={(s: any, q) =>
        (s.tecnicos?.nombre_empresa || '').toLowerCase().includes(q) ||
        (s.flow_order_id || '').toLowerCase().includes(q) ||
        s.plan.toLowerCase().includes(q) ||
        s.estado.toLowerCase().includes(q)
      }
      emptyMessage="Aún no hay pagos registrados"
      columnas={[
        {
          key: 'tecnico',
          label: 'Técnico',
          render: (s: any) => (
            <Link href={`/tecnico/${s.tecnicos?.slug}`} target="_blank" className="text-azul-mid hover:underline text-sm font-medium inline-flex items-center gap-1">
              {s.tecnicos?.nombre_empresa || 'sin técnico'}
              <ExternalLink size={10} />
            </Link>
          ),
        },
        {
          key: 'plan',
          label: 'Plan',
          render: (s: any) => (
            <div>
              <div className="text-sm font-medium">{PLANES[s.plan as 'gratis' | 'pro' | 'elite'].nombre}</div>
              <div className="text-xs text-gris-3 capitalize">{s.tipo_pago}</div>
            </div>
          ),
        },
        {
          key: 'monto',
          label: 'Monto',
          render: (s: any) => <span className="font-semibold text-azul">{precioFormateado(s.monto)}</span>,
        },
        {
          key: 'estado',
          label: 'Estado',
          render: (s: any) => (
            <Badge tone={s.estado === 'activo' ? 'verde' : s.estado === 'cancelado' ? 'rojo' : s.estado === 'vencido' ? 'oro' : 'gris'}>
              {s.estado}
            </Badge>
          ),
        },
        {
          key: 'inicio',
          label: 'Inicio',
          render: (s: any) => <span className="text-xs text-gris-3">{s.inicio_en ? formatearFecha(s.inicio_en) : '—'}</span>,
        },
        {
          key: 'vence',
          label: 'Vence',
          render: (s: any) => <span className="text-xs text-gris-3">{s.vence_en ? formatearFecha(s.vence_en) : '—'}</span>,
        },
        {
          key: 'orden',
          label: 'Orden Flow',
          render: (s: any) => <span className="text-[10px] font-mono text-gris-3">{s.flow_order_id || '—'}</span>,
        },
      ]}
    />
  )
}
