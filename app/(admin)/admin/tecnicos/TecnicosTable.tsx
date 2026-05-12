'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Edit3, ExternalLink, ShieldCheck, ShieldOff } from 'lucide-react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { formatearFecha } from '@/lib/utils'
import { planVigente } from '@/lib/planes'

interface TecnicoAdmin {
  id: string
  slug: string | null
  user_id: string | null
  nombre_empresa: string
  nombre_contacto: string | null
  comuna: string | null
  plan: 'gratis' | 'pro' | 'elite'
  plan_vence_en: string | null
  verificado: boolean
  activo: boolean
  destacado: boolean
  rating_promedio: number
  total_resenas: number
  telefono: string | null
  email_publico: string | null
  created_at: string
  regiones?: { nombre: string } | null
}

export function TecnicosTable({ tecnicos: ini }: { tecnicos: TecnicoAdmin[] }) {
  const [tecnicos, setTecnicos] = useState(ini)
  const [editando, setEditando] = useState<TecnicoAdmin | null>(null)
  const [filtroPlan, setFiltroPlan] = useState<string>('todos')
  const [filtroActivo, setFiltroActivo] = useState<string>('todos')
  const push = useToast(s => s.push)
  const supabase = createClient()

  const data = tecnicos.filter(t => {
    if (filtroPlan !== 'todos' && t.plan !== filtroPlan) return false
    if (filtroActivo === 'activos' && !t.activo) return false
    if (filtroActivo === 'inactivos' && t.activo) return false
    return true
  })

  async function guardarCambios(updates: Partial<TecnicoAdmin>) {
    if (!editando) return
    const { error } = await supabase.from('tecnicos').update(updates).eq('id', editando.id)
    if (error) { push(`Error: ${error.message}`, 'error'); return }
    setTecnicos(tecnicos.map(t => t.id === editando.id ? { ...t, ...updates } : t))
    push('Técnico actualizado')
    setEditando(null)
  }

  async function toggleActivo(id: string, actual: boolean) {
    const { error } = await supabase.from('tecnicos').update({ activo: !actual }).eq('id', id)
    if (!error) {
      setTecnicos(tecnicos.map(t => t.id === id ? { ...t, activo: !actual } : t))
      push(actual ? 'Técnico desactivado' : 'Técnico activado')
    } else push(`Error: ${error.message}`, 'error')
  }

  async function toggleVerificado(id: string, actual: boolean) {
    const { error } = await supabase.from('tecnicos').update({ verificado: !actual }).eq('id', id)
    if (!error) {
      setTecnicos(tecnicos.map(t => t.id === id ? { ...t, verificado: !actual } : t))
      push(actual ? 'Verificación quitada' : 'Técnico verificado')
    } else push(`Error: ${error.message}`, 'error')
  }

  return (
    <>
      <TablaPaginada<TecnicoAdmin>
        data={data}
        perPage={25}
        searchFn={(t, q) =>
          t.nombre_empresa.toLowerCase().includes(q) ||
          (t.nombre_contacto || '').toLowerCase().includes(q) ||
          (t.comuna || '').toLowerCase().includes(q) ||
          (t.email_publico || '').toLowerCase().includes(q) ||
          (t.regiones?.nombre || '').toLowerCase().includes(q)
        }
        filtros={
          <>
            <select value={filtroPlan} onChange={e => setFiltroPlan(e.target.value)} className="text-sm rounded-md border border-borde px-2 py-2">
              <option value="todos">Todos los planes</option>
              <option value="gratis">Gratis</option>
              <option value="pro">PRO</option>
              <option value="elite">Elite</option>
            </select>
            <select value={filtroActivo} onChange={e => setFiltroActivo(e.target.value)} className="text-sm rounded-md border border-borde px-2 py-2">
              <option value="todos">Activos e inactivos</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
            </select>
          </>
        }
        columnas={[
          {
            key: 'empresa',
            label: 'Empresa',
            render: t => (
              <div>
                <Link href={`/tecnico/${t.slug}`} target="_blank" className="font-semibold text-azul hover:underline inline-flex items-center gap-1">
                  {t.nombre_empresa}
                  <ExternalLink size={11} />
                </Link>
                <div className="text-xs text-gris-3">{t.comuna}{t.regiones?.nombre ? `, ${t.regiones.nombre}` : ''}</div>
              </div>
            ),
          },
          {
            key: 'contacto',
            label: 'Contacto',
            render: t => (
              <div className="text-xs">
                {t.email_publico && <div className="text-gris-4">{t.email_publico}</div>}
                {t.telefono && <div className="text-gris-3">{t.telefono}</div>}
              </div>
            ),
          },
          {
            key: 'plan',
            label: 'Plan',
            render: t => {
              const p = planVigente(t)
              return <Badge tone={p === 'elite' ? 'oro' : p === 'pro' ? 'azul' : 'gris'}>{p}</Badge>
            },
          },
          {
            key: 'rating',
            label: 'Rating',
            render: t => (
              <span className="text-xs">
                {(t.rating_promedio || 0).toFixed(1)} <span className="text-gris-3">({t.total_resenas})</span>
              </span>
            ),
          },
          {
            key: 'estado',
            label: 'Estado',
            render: t => (
              <div className="flex flex-wrap gap-1">
                {t.activo ? <Badge tone="verde">Activo</Badge> : <Badge tone="rojo">Inactivo</Badge>}
                {t.verificado && <Badge tone="azul"><ShieldCheck size={10} />Verificado</Badge>}
                {!t.user_id && <Badge tone="oro">🪪 Sin reclamar</Badge>}
              </div>
            ),
          },
          {
            key: 'fecha',
            label: 'Registrado',
            render: t => <span className="text-xs text-gris-3">{formatearFecha(t.created_at)}</span>,
          },
          {
            key: 'acciones',
            label: 'Acciones',
            render: t => (
              <div className="flex gap-1">
                <button onClick={() => setEditando(t)} className="p-1.5 text-azul-mid hover:bg-azul-mid/10 rounded" title="Editar">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => toggleVerificado(t.id, t.verificado)} className="p-1.5 hover:bg-papel rounded" title={t.verificado ? 'Quitar verificación' : 'Verificar'}>
                  {t.verificado ? <ShieldOff size={14} className="text-rojo" /> : <ShieldCheck size={14} className="text-verde" />}
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={!!editando} onClose={() => setEditando(null)} title={`Editar: ${editando?.nombre_empresa}`} size="lg">
        {editando && (
          <EditarTecnicoForm
            tecnico={editando}
            onSave={guardarCambios}
            onCancel={() => setEditando(null)}
            onToggleActivo={() => toggleActivo(editando.id, editando.activo)}
            onUserUpdated={(newUserId) => {
              setTecnicos(tecnicos.map(t => t.id === editando.id ? { ...t, user_id: newUserId } : t))
              setEditando({ ...editando, user_id: newUserId })
            }}
          />
        )}
      </Modal>
    </>
  )
}

function EditarTecnicoForm({ tecnico, onSave, onCancel, onToggleActivo, onUserUpdated }: {
  tecnico: TecnicoAdmin
  onSave: (u: any) => void
  onCancel: () => void
  onToggleActivo: () => void
  onUserUpdated: (newUserId: string | null) => void
}) {
  const [form, setForm] = useState({
    plan: tecnico.plan,
    plan_vence_en: tecnico.plan_vence_en?.slice(0, 10) || '',
    verificado: tecnico.verificado,
    destacado: tecnico.destacado,
    activo: tecnico.activo,
  })
  const [emailVincular, setEmailVincular] = useState('')
  const [vinculando, setVinculando] = useState(false)
  const push = useToast(s => s.push)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      plan: form.plan,
      plan_vence_en: form.plan_vence_en ? new Date(form.plan_vence_en).toISOString() : null,
      verificado: form.verificado,
      destacado: form.destacado,
      activo: form.activo,
    })
  }

  async function vincular() {
    if (!emailVincular.trim()) return
    if (!confirm(`¿Vincular usuario ${emailVincular} al técnico "${tecnico.nombre_empresa}"?\n\nEsto convierte al usuario en técnico. Si la cuenta no existe se creará automáticamente y se enviará email de bienvenida.`)) return
    setVinculando(true)
    const res = await fetch('/api/admin/vincular-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: tecnico.id, email: emailVincular }),
    })
    setVinculando(false)
    if (res.ok) {
      const { user_id } = await res.json()
      onUserUpdated(user_id)
      setEmailVincular('')
      push('Usuario vinculado correctamente')
    } else {
      const err = await res.json().catch(() => ({}))
      push(err.error || 'Error al vincular', 'error')
    }
  }

  async function desvincular() {
    if (!confirm(`¿Desvincular usuario de "${tecnico.nombre_empresa}"? El técnico quedará como "huérfano" y otro usuario podrá reclamarlo.`)) return
    setVinculando(true)
    const res = await fetch('/api/admin/vincular-usuario', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: tecnico.id }),
    })
    setVinculando(false)
    if (res.ok) {
      onUserUpdated(null)
      push('Usuario desvinculado')
    } else {
      const err = await res.json().catch(() => ({}))
      push(err.error || 'Error', 'error')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Select label="Plan" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value as any })}>
          <option value="gratis">Gratis</option>
          <option value="pro">PRO</option>
          <option value="elite">Elite</option>
        </Select>
        <Input
          label="Plan vence el"
          type="date"
          value={form.plan_vence_en}
          onChange={e => setForm({ ...form, plan_vence_en: e.target.value })}
          helper={form.plan === 'gratis' ? 'Sin uso para plan gratis' : 'Después de esta fecha vuelve a gratis'}
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.verificado} onChange={e => setForm({ ...form, verificado: e.target.checked })} />
          <span className="text-sm">✓ Técnico verificado (badge azul en perfil)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.destacado} onChange={e => setForm({ ...form, destacado: e.target.checked })} />
          <span className="text-sm">⭐ Destacado en home (aparece en sección "destacados")</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
          <span className="text-sm">🟢 Cuenta activa (visible al público)</span>
        </label>
      </div>

      {/* SECCIÓN PROPIETARIO */}
      <div className="rounded-md border-2 border-azul-mid/20 bg-azul-mid/5 p-3 space-y-3">
        <h4 className="font-display text-sm text-azul font-bold flex items-center gap-2">
          👤 Propietario del perfil
        </h4>

        {tecnico.user_id ? (
          <>
            <div className="text-sm text-gris-4">
              <Badge tone="verde">✓ Vinculado</Badge>
              <div className="text-xs mt-1">User ID: <span className="font-mono text-[10px]">{tecnico.user_id}</span></div>
              <div className="text-xs">El propietario puede iniciar sesión y editar este perfil.</div>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={desvincular} loading={vinculando} className="!text-rojo hover:!bg-rojo/5">
              Desvincular propietario
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-gris-4">
              <Badge tone="oro">🪪 Sin propietario</Badge>
              <div className="text-xs mt-1">Vincula a un usuario existente (ej: cliente registrado que quiere ser técnico) o crea cuenta nueva con email.</div>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailVincular}
                onChange={e => setEmailVincular(e.target.value)}
                placeholder="email@ejemplo.cl"
                className="input-st flex-1 text-sm"
              />
              <Button type="button" size="sm" onClick={vincular} loading={vinculando}>
                Vincular
              </Button>
            </div>
            <p className="text-[11px] text-gris-3">
              Si el email no existe en el sistema, se creará una cuenta nueva y se enviará email de bienvenida automáticamente.
            </p>
          </>
        )}
      </div>

      <div className="rounded-md bg-papel p-3 text-xs text-gris-4">
        <strong>📋 Info del técnico:</strong>
        <div>Email: {tecnico.email_publico || 'sin email'}</div>
        <div>Teléfono: {tecnico.telefono || 'sin teléfono'}</div>
        <div>Rating: {tecnico.rating_promedio.toFixed(1)}/5 ({tecnico.total_resenas} reseñas)</div>
        <div>Slug: {tecnico.slug}</div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-borde">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar cambios</Button>
      </div>
    </form>
  )
}
