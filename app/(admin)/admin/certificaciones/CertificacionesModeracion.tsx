'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, X, Trash2, ExternalLink, Eye } from 'lucide-react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { formatearFecha } from '@/lib/utils'

export function CertificacionesModeracion({ certs: ini }: { certs: any[] }) {
  const [certs, setCerts] = useState(ini)
  const [filtroEstado, setFiltroEstado] = useState<'pendiente' | 'aprobada' | 'rechazada' | 'todas'>('pendiente')
  const [verCert, setVerCert] = useState<any | null>(null)
  const supabase = createClient()
  const push = useToast(s => s.push)

  const data = certs.filter(c => filtroEstado === 'todas' || c.estado === filtroEstado)

  const contadores = {
    pendiente: certs.filter(c => c.estado === 'pendiente').length,
    aprobada: certs.filter(c => c.estado === 'aprobada').length,
    rechazada: certs.filter(c => c.estado === 'rechazada').length,
  }

  async function aprobar(id: string) {
    await supabase.from('tecnico_certificaciones').update({
      estado: 'aprobada',
      aprobada_en: new Date().toISOString(),
    }).eq('id', id)
    setCerts(certs.map(c => c.id === id ? { ...c, estado: 'aprobada', aprobada_en: new Date().toISOString() } : c))
    push('Certificación aprobada — ya aparece en el perfil del técnico')
  }
  async function rechazar(id: string) {
    const motivo = prompt('Motivo del rechazo (opcional, se mostrará al técnico):')
    if (motivo === null) return // cancelado
    await supabase.from('tecnico_certificaciones').update({ estado: 'rechazada' }).eq('id', id)
    setCerts(certs.map(c => c.id === id ? { ...c, estado: 'rechazada' } : c))
    push('Certificación rechazada')
  }
  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta certificación? Esta acción no se puede deshacer.')) return
    await supabase.from('tecnico_certificaciones').delete().eq('id', id)
    setCerts(certs.filter(c => c.id !== id))
    push('Certificación eliminada')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <Tab active={filtroEstado === 'pendiente'} onClick={() => setFiltroEstado('pendiente')} label="Pendientes" count={contadores.pendiente} tone="oro" />
        <Tab active={filtroEstado === 'aprobada'} onClick={() => setFiltroEstado('aprobada')} label="Aprobadas" count={contadores.aprobada} tone="verde" />
        <Tab active={filtroEstado === 'rechazada'} onClick={() => setFiltroEstado('rechazada')} label="Rechazadas" count={contadores.rechazada} tone="rojo" />
        <Tab active={filtroEstado === 'todas'} onClick={() => setFiltroEstado('todas')} label="Todas" count={certs.length} />
      </div>

      <TablaPaginada
        data={data}
        perPage={25}
        searchFn={(c: any, q) =>
          c.nombre.toLowerCase().includes(q) ||
          (c.entidad_emisora || '').toLowerCase().includes(q) ||
          (c.tecnicos?.nombre_empresa || '').toLowerCase().includes(q)
        }
        emptyMessage={filtroEstado === 'pendiente' ? 'No hay certificaciones pendientes 🎉' : 'Sin certificaciones'}
        columnas={[
          {
            key: 'tecnico',
            label: 'Técnico',
            render: (c: any) => (
              <Link href={`/tecnico/${c.tecnicos?.slug}`} target="_blank" className="text-azul-mid hover:underline text-sm font-medium inline-flex items-center gap-1">
                {c.tecnicos?.nombre_empresa}
                <ExternalLink size={10} />
              </Link>
            ),
          },
          {
            key: 'nombre',
            label: 'Certificación',
            render: (c: any) => (
              <div>
                <div className="font-medium text-azul text-sm">{c.nombre}</div>
                {c.entidad_emisora && <div className="text-xs text-gris-3">{c.entidad_emisora}</div>}
              </div>
            ),
          },
          {
            key: 'estado',
            label: 'Estado',
            render: (c: any) => (
              <Badge tone={c.estado === 'aprobada' ? 'verde' : c.estado === 'rechazada' ? 'rojo' : 'oro'}>
                {c.estado}
              </Badge>
            ),
          },
          {
            key: 'fecha',
            label: 'Enviada',
            render: (c: any) => <span className="text-xs text-gris-3">{formatearFecha(c.created_at)}</span>,
          },
          {
            key: 'doc',
            label: 'Documento',
            render: (c: any) => (
              c.documento_url ? (
                <button onClick={() => setVerCert(c)} className="text-azul-mid hover:underline text-xs inline-flex items-center gap-1">
                  <Eye size={12} /> Ver
                </button>
              ) : <span className="text-xs text-gris-3">—</span>
            ),
          },
          {
            key: 'acciones',
            label: 'Acciones',
            render: (c: any) => (
              <div className="flex gap-1">
                {c.estado === 'pendiente' && (
                  <>
                    <button onClick={() => aprobar(c.id)} className="p-1.5 text-verde hover:bg-verde/10 rounded" title="Aprobar">
                      <Check size={14} />
                    </button>
                    <button onClick={() => rechazar(c.id)} className="p-1.5 text-rojo hover:bg-rojo/10 rounded" title="Rechazar">
                      <X size={14} />
                    </button>
                  </>
                )}
                <button onClick={() => eliminar(c.id)} className="p-1.5 text-gris-3 hover:bg-rojo/10 hover:text-rojo rounded" title="Eliminar permanente">
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={!!verCert} onClose={() => setVerCert(null)} title={verCert?.nombre} size="lg">
        {verCert && (
          <div className="space-y-3">
            <div className="text-sm text-gris-4">
              <div><strong>Técnico:</strong> {verCert.tecnicos?.nombre_empresa}</div>
              <div><strong>Entidad:</strong> {verCert.entidad_emisora || '—'}</div>
              <div><strong>Estado:</strong> {verCert.estado}</div>
            </div>
            {verCert.documento_url && (
              <a href={verCert.documento_url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative aspect-video bg-papel rounded-md overflow-hidden border border-borde">
                  <Image src={verCert.documento_url} alt="" fill className="object-contain" />
                </div>
                <p className="text-xs text-azul-mid mt-2 text-center">Click para abrir en pestaña nueva</p>
              </a>
            )}
          </div>
        )}
      </Modal>
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
