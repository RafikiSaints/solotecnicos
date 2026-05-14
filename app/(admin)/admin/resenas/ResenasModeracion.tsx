'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Check, X, ExternalLink, Eye, EyeOff, AlertOctagon } from 'lucide-react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RatingDisplay } from '@/components/ui/StarRating'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { tiempoTranscurrido } from '@/lib/utils'

type FiltroEstado = 'todas' | 'pendientes' | 'aprobadas' | 'ocultas' | 'reportadas'

export function ResenasModeracion({ resenas: ini }: { resenas: any[] }) {
  const [resenas, setResenas] = useState(ini)
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('reportadas')
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const push = useToast(s => s.push)

  const data = resenas.filter(r => {
    if (filtroEstado === 'reportadas') return r.reportada && !r.oculta
    if (filtroEstado === 'pendientes') return !r.aprobada && !r.oculta
    if (filtroEstado === 'aprobadas') return r.aprobada && !r.oculta
    if (filtroEstado === 'ocultas') return r.oculta
    return true
  })

  const contadores = {
    reportadas: resenas.filter(r => r.reportada && !r.oculta).length,
    pendientes: resenas.filter(r => !r.aprobada && !r.oculta).length,
    aprobadas: resenas.filter(r => r.aprobada && !r.oculta).length,
    ocultas: resenas.filter(r => r.oculta).length,
  }

  function toggleSel(id: string) {
    setSeleccionadas(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleSelTodas() {
    if (seleccionadas.size === data.length) setSeleccionadas(new Set())
    else setSeleccionadas(new Set(data.map(r => r.id)))
  }
  function limpiarSel() {
    setSeleccionadas(new Set())
  }

  async function aprobar(id: string) {
    await supabase.from('resenas').update({ aprobada: true }).eq('id', id)
    setResenas(resenas.map(r => r.id === id ? { ...r, aprobada: true } : r))
    push('Reseña aprobada (Verificada)')
  }
  async function desaprobar(id: string) {
    await supabase.from('resenas').update({ aprobada: false }).eq('id', id)
    setResenas(resenas.map(r => r.id === id ? { ...r, aprobada: false } : r))
    push('Reseña vuelta a "Por revisar"')
  }
  async function ocultar(id: string, actual: boolean) {
    await supabase.from('resenas').update({ oculta: !actual }).eq('id', id)
    setResenas(resenas.map(r => r.id === id ? { ...r, oculta: !actual } : r))
    push(actual ? 'Reseña visible nuevamente (cuenta en el rating)' : 'Reseña oculta del perfil público (no cuenta)')
  }
  async function descartarReporte(id: string) {
    // El técnico la reportó pero admin decide que está OK → desmarcar
    await supabase.from('resenas').update({ reportada: false, reportada_motivo: null }).eq('id', id)
    setResenas(resenas.map(r => r.id === id ? { ...r, reportada: false, reportada_motivo: null } : r))
    push('Reporte descartado — la reseña queda como estaba')
  }
  async function eliminar(id: string) {
    if (!confirm('¿Eliminar permanentemente esta reseña? Esta acción no se puede deshacer.')) return
    await supabase.from('resenas').delete().eq('id', id)
    setResenas(resenas.filter(r => r.id !== id))
    push('Reseña eliminada')
  }

  // ─── Acciones masivas ───────────────────────────────────────────────────
  async function aprobarSeleccionadas() {
    const ids = Array.from(seleccionadas)
    if (ids.length === 0) return
    const { error } = await supabase.from('resenas')
      .update({ aprobada: true })
      .in('id', ids)
    if (error) { push(`Error: ${error.message}`, 'error'); return }
    setResenas(resenas.map(r => ids.includes(r.id) ? { ...r, aprobada: true } : r))
    push(`✓ ${ids.length} reseña${ids.length !== 1 ? 's' : ''} aprobada${ids.length !== 1 ? 's' : ''}`)
    limpiarSel()
  }
  async function ocultarSeleccionadas() {
    const ids = Array.from(seleccionadas)
    if (ids.length === 0) return
    if (!confirm(`¿Ocultar ${ids.length} reseña${ids.length !== 1 ? 's' : ''} del perfil público? (Deja de contar en el rating)`)) return
    const { error } = await supabase.from('resenas')
      .update({ oculta: true })
      .in('id', ids)
    if (error) { push(`Error: ${error.message}`, 'error'); return }
    setResenas(resenas.map(r => ids.includes(r.id) ? { ...r, oculta: true } : r))
    push(`${ids.length} reseña${ids.length !== 1 ? 's' : ''} ocultada${ids.length !== 1 ? 's' : ''}`)
    limpiarSel()
  }
  async function eliminarSeleccionadas() {
    const ids = Array.from(seleccionadas)
    if (ids.length === 0) return
    if (!confirm(`⚠️ ELIMINAR PERMANENTEMENTE ${ids.length} reseña${ids.length !== 1 ? 's' : ''}? Esta acción NO se puede deshacer.`)) return
    const { error } = await supabase.from('resenas').delete().in('id', ids)
    if (error) { push(`Error: ${error.message}`, 'error'); return }
    setResenas(resenas.filter(r => !ids.includes(r.id)))
    push(`${ids.length} reseña${ids.length !== 1 ? 's' : ''} eliminada${ids.length !== 1 ? 's' : ''}`)
    limpiarSel()
  }

  const hayPagina = data.length > 0
  const todasSeleccionadas = hayPagina && seleccionadas.size === data.length

  return (
    <div className="space-y-4">
      {/* Tabs de estado */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Tab active={filtroEstado === 'reportadas'} onClick={() => { setFiltroEstado('reportadas'); limpiarSel() }} label="🚩 Reportadas por técnico" count={contadores.reportadas} tone="rojo" />
        <Tab active={filtroEstado === 'pendientes'} onClick={() => { setFiltroEstado('pendientes'); limpiarSel() }} label="Por revisar" count={contadores.pendientes} tone="oro" />
        <Tab active={filtroEstado === 'aprobadas'} onClick={() => { setFiltroEstado('aprobadas'); limpiarSel() }} label="Verificadas" count={contadores.aprobadas} tone="verde" />
        <Tab active={filtroEstado === 'ocultas'} onClick={() => { setFiltroEstado('ocultas'); limpiarSel() }} label="Ocultas" count={contadores.ocultas} />
        <Tab active={filtroEstado === 'todas'} onClick={() => { setFiltroEstado('todas'); limpiarSel() }} label="Todas" count={resenas.length} />
      </div>

      {/* Barra de acciones masivas */}
      {seleccionadas.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-md bg-azul/5 border border-azul/20 sticky top-0 z-10">
          <span className="text-sm font-medium text-azul">
            {seleccionadas.size} seleccionada{seleccionadas.size !== 1 ? 's' : ''}
          </span>
          <div className="flex-1" />
          <Button size="sm" onClick={aprobarSeleccionadas}>
            <Check size={14} /> Aprobar
          </Button>
          <Button size="sm" variant="outline" onClick={ocultarSeleccionadas}>
            <EyeOff size={14} /> Ocultar
          </Button>
          <Button size="sm" variant="ghost" onClick={eliminarSeleccionadas} className="!text-rojo">
            <Trash2 size={14} /> Eliminar
          </Button>
          <Button size="sm" variant="ghost" onClick={limpiarSel}>
            Cancelar
          </Button>
        </div>
      )}

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
        emptyMessage={filtroEstado === 'pendientes' ? 'No hay reseñas por revisar 🎉' : 'Sin resultados'}
        columnas={[
          {
            key: 'sel',
            label: (
              <input
                type="checkbox"
                checked={todasSeleccionadas}
                onChange={toggleSelTodas}
                aria-label="Seleccionar todas"
                disabled={!hayPagina}
              />
            ) as any,
            render: (r: any) => (
              <input
                type="checkbox"
                checked={seleccionadas.has(r.id)}
                onChange={() => toggleSel(r.id)}
                onClick={e => e.stopPropagation()}
                aria-label={`Seleccionar reseña de ${r.autor_nombre}`}
              />
            ),
          },
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
                {r.reportada && r.reportada_motivo && (
                  <details className="mt-1.5 text-[11px]">
                    <summary className="cursor-pointer text-rojo font-semibold inline-flex items-center gap-1">
                      <AlertOctagon size={11} /> Motivo del técnico
                    </summary>
                    <div className="mt-1 p-2 rounded bg-rojo/5 border border-rojo/20 text-gris-4 italic">
                      {r.reportada_motivo}
                    </div>
                  </details>
                )}
              </div>
            ),
          },
          {
            key: 'estado',
            label: 'Estado',
            render: (r: any) => (
              <div className="flex flex-col gap-1">
                {r.oculta && <Badge tone="rojo">🚫 Oculta</Badge>}
                {!r.oculta && r.aprobada && <Badge tone="verde">✓ Verificada</Badge>}
                {!r.oculta && !r.aprobada && <Badge tone="oro">⏳ Por revisar</Badge>}
                {r.reportada && !r.oculta && <Badge tone="rojo">🚩 Reportada</Badge>}
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
                  <button onClick={() => aprobar(r.id)} className="p-1.5 text-verde hover:bg-verde/10 rounded" title="Aprobar (marcar verificada)">
                    <Check size={14} />
                  </button>
                ) : (
                  <button onClick={() => desaprobar(r.id)} className="p-1.5 text-oro hover:bg-oro/10 rounded" title="Volver a 'Por revisar'">
                    <X size={14} />
                  </button>
                )}
                {r.reportada && (
                  <button onClick={() => descartarReporte(r.id)} className="p-1.5 hover:bg-papel rounded" title="Descartar reporte del técnico — la reseña queda como estaba">
                    <AlertOctagon size={14} className="text-rojo" />
                  </button>
                )}
                <button onClick={() => ocultar(r.id, r.oculta)} className="p-1.5 hover:bg-papel rounded" title={r.oculta ? 'Volver a mostrar en el perfil' : 'Ocultar del perfil público'}>
                  {r.oculta
                    ? <Eye size={14} className="text-azul-mid" />
                    : <EyeOff size={14} className="text-gris-3" />}
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
