'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus, ExternalLink, Wrench } from 'lucide-react'
import { TablaPaginada } from '@/components/ui/TablaPaginada'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { formatearFecha, tiempoTranscurrido } from '@/lib/utils'

interface UsuarioRow {
  id: string
  email: string
  tipo: 'admin' | 'tecnico' | 'cliente' | 'sin_perfil'
  nombre: string
  slug: string | null
  created_at: string
  last_sign_in_at: string | null
  confirmed_at: string | null
}

export function UsuariosTable({ usuarios: ini }: { usuarios: UsuarioRow[] }) {
  const [usuarios] = useState(ini)
  const [filtro, setFiltro] = useState<'todos' | 'tecnico' | 'cliente' | 'admin'>('todos')
  const [convertir, setConvertir] = useState<UsuarioRow | null>(null)
  const [form, setForm] = useState({ nombre_empresa: '' })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const push = useToast(s => s.push)
  const router = useRouter()

  const data = usuarios.filter(u => filtro === 'todos' || u.tipo === filtro)
  const contadores = {
    tecnico: usuarios.filter(u => u.tipo === 'tecnico').length,
    cliente: usuarios.filter(u => u.tipo === 'cliente').length,
    admin: usuarios.filter(u => u.tipo === 'admin').length,
  }

  async function convertirACliente(u: UsuarioRow) {
    if (!form.nombre_empresa.trim()) {
      push('Necesitas un nombre de empresa', 'error')
      return
    }
    setLoading(true)
    // 1. Crear técnico
    const { data: tecnico, error } = await supabase.from('tecnicos').insert({
      nombre_empresa: form.nombre_empresa,
      user_id: u.id,
      email_publico: u.email,
    }).select().single()
    if (error || !tecnico) {
      setLoading(false)
      push(`Error: ${error?.message}`, 'error')
      return
    }
    // 2. Actualizar metadata del user
    const r = await fetch('/api/admin/vincular-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: tecnico.id, email: u.email }),
    })
    setLoading(false)
    if (!r.ok) {
      push('Técnico creado pero falló vinculación', 'error')
    } else {
      push(`${u.nombre} convertido a técnico ✓`)
    }
    setConvertir(null)
    setForm({ nombre_empresa: '' })
    router.refresh()
  }

  const tipoTone = {
    admin: 'rojo',
    tecnico: 'azul',
    cliente: 'verde',
    sin_perfil: 'gris',
  } as const

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <Tab active={filtro === 'todos'} onClick={() => setFiltro('todos')} label="Todos" count={usuarios.length} />
        <Tab active={filtro === 'tecnico'} onClick={() => setFiltro('tecnico')} label="Técnicos" count={contadores.tecnico} />
        <Tab active={filtro === 'cliente'} onClick={() => setFiltro('cliente')} label="Clientes" count={contadores.cliente} />
        <Tab active={filtro === 'admin'} onClick={() => setFiltro('admin')} label="Admins" count={contadores.admin} />
      </div>

      <TablaPaginada<UsuarioRow>
        data={data}
        perPage={25}
        searchFn={(u, q) =>
          u.email.toLowerCase().includes(q) ||
          u.nombre.toLowerCase().includes(q)
        }
        columnas={[
          {
            key: 'usuario',
            label: 'Usuario',
            render: u => (
              <div>
                <div className="font-medium text-azul text-sm">{u.nombre}</div>
                <div className="text-xs text-gris-3">{u.email}</div>
              </div>
            ),
          },
          {
            key: 'tipo',
            label: 'Tipo',
            render: u => (
              <Badge tone={tipoTone[u.tipo]}>
                {u.tipo === 'sin_perfil' ? 'sin perfil' : u.tipo}
              </Badge>
            ),
          },
          {
            key: 'registro',
            label: 'Registrado',
            render: u => <span className="text-xs text-gris-3">{formatearFecha(u.created_at)}</span>,
          },
          {
            key: 'ultimo',
            label: 'Último login',
            render: u => (
              <span className="text-xs text-gris-3">
                {u.last_sign_in_at ? tiempoTranscurrido(u.last_sign_in_at) : 'nunca'}
              </span>
            ),
          },
          {
            key: 'confirmado',
            label: 'Email',
            render: u => (
              u.confirmed_at
                ? <Badge tone="verde">✓ confirmado</Badge>
                : <Badge tone="oro">⏳ pendiente</Badge>
            ),
          },
          {
            key: 'acciones',
            label: 'Acciones',
            render: u => (
              <div className="flex gap-1">
                {u.tipo === 'tecnico' && u.slug && (
                  <Link href={`/tecnico/${u.slug}`} target="_blank" className="p-1.5 text-azul-mid hover:bg-azul-mid/10 rounded" title="Ver perfil público">
                    <ExternalLink size={14} />
                  </Link>
                )}
                {(u.tipo === 'cliente' || u.tipo === 'sin_perfil') && (
                  <button onClick={() => setConvertir(u)} className="text-xs text-azul-mid hover:underline inline-flex items-center gap-1 px-2">
                    <Wrench size={12} /> Convertir a técnico
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Modal convertir */}
      <Modal open={!!convertir} onClose={() => setConvertir(null)} title="Convertir a técnico">
        {convertir && (
          <div className="space-y-4">
            <p className="text-sm text-gris-4">
              Vas a crear un perfil técnico para <strong>{convertir.nombre}</strong> (<span className="text-azul-mid">{convertir.email}</span>).
            </p>
            <p className="text-xs text-gris-3">
              Después podrás editar todos los datos del perfil (categorías, descripción, fotos, etc.) desde "Técnicos".
            </p>
            <Input
              label="Nombre del negocio / empresa"
              required
              value={form.nombre_empresa}
              onChange={e => setForm({ ...form, nombre_empresa: e.target.value })}
              placeholder="Ej: ClimaTech Pro, Juan Pérez Electricista"
              helper="Cómo se va a llamar el perfil técnico. Puede cambiarse después."
            />
            <div className="flex gap-2 justify-end pt-2 border-t border-borde">
              <Button variant="ghost" onClick={() => setConvertir(null)}>Cancelar</Button>
              <Button onClick={() => convertirACliente(convertir)} loading={loading}>
                Crear perfil técnico
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Tab({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${active ? 'bg-azul text-white' : 'bg-white border border-borde text-gris-4 hover:border-azul'}`}
    >
      {label} {count > 0 && <span className={`ml-1 text-xs ${active ? 'opacity-80' : 'text-gris-3'}`}>({count})</span>}
    </button>
  )
}
