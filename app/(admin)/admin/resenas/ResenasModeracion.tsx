'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Check, X, ExternalLink, AlertOctagon } from 'lucide-react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Badge } from '@/components/ui/Badge'
import { RatingDisplay } from '@/components/ui/StarRating'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { tiempoTranscurrido } from '@/lib/utils'

export function ResenasModeracion({ resenas: ini }: { resenas: any[] }) {
  const [resenas, setResenas] = useState(ini)
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pendientes' | 'aprobadas' | 'reportadas'>('pendientes')
  const supabase = createClient()
  const push = useToast(s => s.push)

  const data = resenas.filter(r => {
    if (filtroEstado === 'pendientes') return !r.aprobada
    if (filtroEstado === 'aprobadas') return r.aprobada
    if (filtroEstado === 'reportadas') return r.reportada
    return true
  })

  const contadores = {
    pendientes: resenas.filter(r => !r.aprobada).length,
    aprobadas: resenas.filter(r => r.aprobada).length,
    reportadas: resenas.filter(r => r.reportada).length,
  }

  async function aprobar(id: string) {
    await supabase.from('resenas').update({ aprobada: true, reportada: false }).eq('id', id)
    setResenas(resenas.map(r => r.id === id ? { ...r, aprobada: true, reportada: false } : r))
    push('Reseña aprobada y publicada')
  }
  async function desaprobar(id: string) {
    await supabase.from('resenas').update({ aprobada: false }).eq('id', id)
    setResenas(resenas.map(r => r.id === id ? { ...r, aprobada: false } : r))
    push('Reseña des-publicada (vuelve a pendiente)')
  }
  async function marcarReportada(id: string, actual: boolean) {
    await supabase.from('resenas').update({ reportada: !actual }).eq('id', id)
    setResenas(resenas.map(r => r.id === id ? { ...r, reportada: !actual } : r))
    push(actual ? 'Desmarcada' : 'Marcada como reportada')
  }
  async function eliminar(id: string) {
    if (!confirm('¿Eliminar permanentemente esta reseña? Esta acción no se puede deshacer.')) return
    await supabase.from('resenas').delete().eq('id', id)
    setResenas(resenas.filter(r => r.id !== id))
    push('Reseña eliminada')
  }

  return (
    <div className="space-y-4">
      {/* Tabs de estado */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Tab active={filtroEstado === 'pendientes'} onClick={() => setFiltroEstado('pendientes')} label="Pendientes" count={contadores.pendientes} tone="rojo" />
        <Tab active={filtroEstado === 'aprobadas'} onClick={() => setFiltroEstado('aprobadas')} label="Aprobadas" count={contadores.aprobadas} tone="verde" />
        <Tab active={filtroEstado === 'reportadas'} onClick={() => setFiltroEstado('reportadas')} label="Reportadas" count={contadores.reportadas} tone="oro" />
        <Tab active={filtroEstado === 'todas'} onClick={() => setFiltroEstado('todas')} label="Todas" count={resenas.length} />
      </div>

      <TablaPaginada
        data={data}
        perPage={25}
        searchFn={(r: any, q) =>
          (r.autor_nombre || '').toLowerCase().includes(q) ||
          (r.titulo || '').toLowerCase().includes(q) ||
          (r.comentario || '').toLowerCase().includes(q) ||
          (r.tecnicos?.nombre_empresa || '').toLowerCase().includes(q) ||
          (r.autor_email || '').toLowerCase().includes(q)
        }
        emptyMessage={filtroEstado === 'pendientes' ? 'No hay reseñas pendientes 🎉' : 'Sin resultados'}
        columnas={[
          {
            key: 'tecnico',
            label: 'Técnico',
            render: (r: any) => (
              <Link href={`/tecnico/${r.tecnicos?.slug}`} target="_blank" className="text-azul-mid hover:underline text-xs font-medium inline-flex items-center gap-1">
                {r.tecnicos?.nombre_empresa || 'sin técnico'}
                <ExternalLink size={10} />
              </Link>
            ),
          },
          {
            key: 'autor',
            label: 'Autor',
            render: (r: any) => (
              <div>
                <div className="font-medium text-azul text-sm">{r.autor_nombre}</div>
                {r.autor_email && <div className="text-xs text-gris-3">{r.autor_email}</div>}
              </div>
            ),
          },
          {
            key: 'rating',
            label: 'Rating',
            render: (r: any) => <RatingDisplay value={r.rating_promedio} />,
          },
          {
            key: 'comentario',
            label: 'Comentario',
            render: (r: any) => (
              <div className="max-w-md">
                {r.titulo && <div className="font-medium text-azul text-sm">{r.titulo}</div>}
                <div className="text-xs text-gris-4 line-clamp-2">{r.comentario}</div>
              </div>
            ),
          },
          {
            key: 'estado',
            label: 'Estado',
            render: (r: any) => (
              <div className="flex flex-col gap-1">
                <Badge tone={r.aprobada ? 'verde' : 'oro'}>{r.aprobada ? '✓ Aprobada' : '⏳ Pendiente'}</Badge>
                {r.reportada && <Badge tone="rojo">⚠️ Reportada</Badge>}
              </div>
            ),
          },
          {
            key: 'fecha',
            label: 'Fecha',
            render: (r: any) => <span className="text-xs text-gris-3">{tiempoTranscurrido(r.created_at)}</span>,
          },
          {
            key: 'acciones',
            label: 'Acciones',
            render: (r: any) => (
              <div className="flex flex-wrap gap-1">
                {!r.aprobada ? (
                  <button onClick={() => aprobar(r.id)} className="p-1.5 text-verde hover:bg-verde/10 rounded" title="Aprobar y publicar">
                    <Check size={14} />
                  </button>
                ) : (
                  <button onClick={() => desaprobar(r.id)} className="p-1.5 text-oro hover:bg-oro/10 rounded" title="Volver a pendiente">
                    <X size={14} />
                  </button>
                )}
                <button onClick={() => marcarReportada(r.id, r.reportada)} className="p-1.5 hover:bg-papel rounded" title={r.reportada ? 'Desmarcar reportada' : 'Marcar como reportada'}>
                  <AlertOctagon size={14} className={r.reportada ? 'text-rojo' : 'text-gris-3'} />
                </button>
                <button onClick={() => eliminar(r.id)} className="p-1.5 text-rojo hover:bg-rojo/10 rounded" title="Eliminar permanentemente">
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

function Tab({ active, onClick, label, count, tone }: { active: boolean; onClick: () => void; label: string; count: number; tone?: 'rojo' | 'verde' | 'oro' }) {
  const colorClass = tone === 'rojo' ? 'text-rojo' : tone === 'verde' ? 'text-verde' : tone === 'oro' ? 'text-oro' : 'text-gris-3'
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${active ? 'bg-azul text-white' : 'bg-white border border-borde text-gris-4 hover:border-azul'}`}
    >
      {label} {count > 0 && <span className={`ml-1 text-xs ${active ? 'opacity-80' : colorClass}`}>({count})</span>}
    </button>
  )
}
