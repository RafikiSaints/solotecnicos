'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, X, ExternalLink, Phone, Mail, AlertTriangle } from 'lucide-react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatearFecha, tiempoTranscurrido } from '@/lib/utils'

interface ClaimRow {
  id: string
  tecnico_id: string
  email: string
  telefono: string | null
  nombre_solicitante: string | null
  mensaje: string | null
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  motivo_rechazo: string | null
  created_at: string
  aprobada_en: string | null
  tecnicos?: {
    id: string
    nombre_empresa: string
    slug: string | null
    telefono: string | null
    email_publico: string | null
    user_id: string | null
  } | null
}

export function ClaimsManager({ claims: ini }: { claims: ClaimRow[] }) {
  const [claims, setClaims] = useState(ini)
  const [filtro, setFiltro] = useState<'pendiente' | 'aprobada' | 'rechazada' | 'todas'>('pendiente')
  const [activa, setActiva] = useState<ClaimRow | null>(null)
  const [cargando, setCargando] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const push = useToast(s => s.push)

  const data = claims.filter(c => filtro === 'todas' || c.estado === filtro)
  const contadores = {
    pendiente: claims.filter(c => c.estado === 'pendiente').length,
    aprobada: claims.filter(c => c.estado === 'aprobada').length,
    rechazada: claims.filter(c => c.estado === 'rechazada').length,
  }

  async function aprobar(claim: ClaimRow) {
    if (!confirm(`¿Aprobar reclamo de ${claim.nombre_solicitante} (${claim.email}) para "${claim.tecnicos?.nombre_empresa}"?\n\nEsto creará una cuenta para ${claim.email} y le dará control total del perfil.`)) return
    setCargando(true)
    const res = await fetch('/api/claim/aprobar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim_id: claim.id }),
    })
    setCargando(false)
    if (res.ok) {
      setClaims(claims.map(c => c.id === claim.id ? { ...c, estado: 'aprobada' as const } : c))
      setActiva(null)
      push('Aprobado — cuenta creada y email enviado al técnico')
    } else {
      const err = await res.json().catch(() => ({}))
      push(err.error || 'Error al aprobar', 'error')
    }
  }

  async function rechazar(claim: ClaimRow) {
    setCargando(true)
    const res = await fetch('/api/claim/rechazar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim_id: claim.id, motivo: motivoRechazo }),
    })
    setCargando(false)
    if (res.ok) {
      setClaims(claims.map(c => c.id === claim.id ? { ...c, estado: 'rechazada' as const, motivo_rechazo: motivoRechazo } : c))
      setActiva(null)
      setMotivoRechazo('')
      push('Rechazado')
    } else {
      const err = await res.json().catch(() => ({}))
      push(err.error || 'Error', 'error')
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 text-sm">
        <Tab active={filtro === 'pendiente'} onClick={() => setFiltro('pendiente')} label="Pendientes" count={contadores.pendiente} tone="oro" />
        <Tab active={filtro === 'aprobada'} onClick={() => setFiltro('aprobada')} label="Aprobadas" count={contadores.aprobada} tone="verde" />
        <Tab active={filtro === 'rechazada'} onClick={() => setFiltro('rechazada')} label="Rechazadas" count={contadores.rechazada} tone="rojo" />
        <Tab active={filtro === 'todas'} onClick={() => setFiltro('todas')} label="Todas" count={claims.length} />
      </div>

      <TablaPaginada<ClaimRow>
        data={data}
        perPage={25}
        searchFn={(c, q) =>
          (c.nombre_solicitante || '').toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.telefono || '').toLowerCase().includes(q) ||
          (c.tecnicos?.nombre_empresa || '').toLowerCase().includes(q)
        }
        emptyMessage={filtro === 'pendiente' ? 'No hay solicitudes pendientes 🎉' : 'Sin resultados'}
        columnas={[
          {
            key: 'tecnico',
            label: 'Perfil reclamado',
            render: c => (
              c.tecnicos ? (
                <Link href={`/tecnico/${c.tecnicos.slug}`} target="_blank" className="text-azul-mid hover:underline text-sm font-medium inline-flex items-center gap-1">
                  {c.tecnicos.nombre_empresa}
                  <ExternalLink size={10} />
                </Link>
              ) : <span className="text-xs text-gris-3">—</span>
            ),
          },
          {
            key: 'solicitante',
            label: 'Solicitante',
            render: c => (
              <div>
                <div className="font-medium text-sm text-azul">{c.nombre_solicitante}</div>
                <div className="text-xs text-gris-3">{c.email}</div>
                {c.telefono && <div className="text-xs text-gris-3">{c.telefono}</div>}
              </div>
            ),
          },
          {
            key: 'verificacion',
            label: 'Coincidencias',
            render: c => {
              const matchTel = c.telefono && c.tecnicos?.telefono &&
                c.telefono.replace(/\D/g, '') === c.tecnicos.telefono.replace(/\D/g, '')
              const matchEmail = c.email && c.tecnicos?.email_publico &&
                c.email.toLowerCase() === c.tecnicos.email_publico.toLowerCase()
              return (
                <div className="text-xs space-y-1">
                  <div className={matchTel ? 'text-verde' : 'text-gris-3'}>
                    {matchTel ? '✓' : '✗'} Teléfono
                  </div>
                  <div className={matchEmail ? 'text-verde' : 'text-gris-3'}>
                    {matchEmail ? '✓' : '✗'} Email
                  </div>
                </div>
              )
            },
          },
          {
            key: 'fecha',
            label: 'Solicitada',
            render: c => <span className="text-xs text-gris-3">{tiempoTranscurrido(c.created_at)}</span>,
          },
          {
            key: 'estado',
            label: 'Estado',
            render: c => (
              <Badge tone={c.estado === 'aprobada' ? 'verde' : c.estado === 'rechazada' ? 'rojo' : 'oro'}>
                {c.estado}
              </Badge>
            ),
          },
          {
            key: 'acciones',
            label: '',
            render: c => (
              <Button size="sm" variant="outline" onClick={() => { setActiva(c); setMotivoRechazo('') }}>
                Ver detalle
              </Button>
            ),
          },
        ]}
      />

      {/* Modal detalle */}
      <Modal open={!!activa} onClose={() => setActiva(null)} title="Revisar solicitud" size="lg">
        {activa && (
          <div className="space-y-4">
            {/* Comparación lado a lado */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-md border-2 border-azul-mid/30 p-3">
                <h4 className="text-xs font-semibold uppercase text-gris-3 mb-2">👤 Solicitante</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Nombre:</strong> {activa.nombre_solicitante}</div>
                  <div className="flex items-center gap-1"><Mail size={12} /> {activa.email}</div>
                  <div className="flex items-center gap-1"><Phone size={12} /> {activa.telefono}</div>
                </div>
              </div>
              <div className="rounded-md border-2 border-borde p-3">
                <h4 className="text-xs font-semibold uppercase text-gris-3 mb-2">🏢 Perfil actual</h4>
                <div className="text-sm space-y-1">
                  <div><strong>{activa.tecnicos?.nombre_empresa}</strong></div>
                  {activa.tecnicos?.email_publico && <div className="flex items-center gap-1"><Mail size={12} /> {activa.tecnicos.email_publico}</div>}
                  {activa.tecnicos?.telefono && <div className="flex items-center gap-1"><Phone size={12} /> {activa.tecnicos.telefono}</div>}
                  {activa.tecnicos?.user_id && (
                    <Badge tone="rojo" className="mt-2"><AlertTriangle size={11} /> Ya reclamado</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Mensaje del solicitante */}
            {activa.mensaje && (
              <div className="rounded-md bg-papel p-3">
                <h4 className="text-xs font-semibold uppercase text-gris-3 mb-1">💬 Mensaje del solicitante</h4>
                <p className="text-sm text-gris-4 whitespace-pre-wrap">{activa.mensaje}</p>
              </div>
            )}

            {/* Tips para verificar */}
            {activa.estado === 'pendiente' && (
              <div className="rounded-md bg-azul-mid/5 border border-azul-mid/30 p-3 text-xs text-gris-4">
                <strong className="text-azul">📋 Antes de aprobar, verifica:</strong>
                <ul className="mt-1 space-y-0.5 list-disc pl-4">
                  <li>Llama al teléfono del perfil para confirmar que el solicitante es el dueño</li>
                  <li>Compara el email/teléfono con los datos públicos del negocio</li>
                  <li>Revisa redes sociales o sitio web del técnico</li>
                  <li>Si todo coincide, aprueba. Si no, rechaza o pide más info.</li>
                </ul>
              </div>
            )}

            {activa.estado === 'rechazada' && activa.motivo_rechazo && (
              <div className="rounded-md bg-rojo/5 border border-rojo/30 p-3 text-sm text-gris-4">
                <strong className="text-rojo">Motivo de rechazo:</strong> {activa.motivo_rechazo}
              </div>
            )}

            {/* Acciones */}
            {activa.estado === 'pendiente' && (
              <div className="space-y-3 pt-3 border-t border-borde">
                <Textarea
                  label="Motivo de rechazo (opcional, solo si rechazas)"
                  value={motivoRechazo}
                  onChange={e => setMotivoRechazo(e.target.value)}
                  placeholder="Ej: Los datos no coinciden con los del perfil. Por favor envía documentación adicional."
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setActiva(null)}>Cancelar</Button>
                  <Button variant="ghost" onClick={() => rechazar(activa)} loading={cargando} className="!text-rojo hover:!bg-rojo/5">
                    <X size={14} /> Rechazar
                  </Button>
                  <Button onClick={() => aprobar(activa)} loading={cargando}>
                    <Check size={14} /> Aprobar y crear cuenta
                  </Button>
                </div>
              </div>
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
