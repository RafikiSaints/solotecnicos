'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, Phone, MessageCircle, Mail } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { formatearFecha } from '@/lib/utils'
import type { Cita, Tecnico } from '@/types/database.types'

export function AgendaCalendario({ citas: ini, tecnico }: { citas: Cita[]; tecnico: Tecnico }) {
  const [citas, setCitas] = useState(ini)
  const [mes, setMes] = useState(new Date())
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null)
  const [openNueva, setOpenNueva] = useState(false)
  const [form, setForm] = useState({
    cliente_nombre: '',
    cliente_telefono: '',
    descripcion: '',
    fecha: '',
    hora_inicio: '09:00',
    hora_fin: '10:00',
    notas: '',
  })
  const [guardando, setGuardando] = useState(false)
  const push = useToast(s => s.push)
  const supabase = createClient()

  const year = mes.getFullYear()
  const month = mes.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startOffset = (firstDay.getDay() + 6) % 7

  const citasPorDia = new Map<string, Cita[]>()
  citas.forEach(c => {
    const arr = citasPorDia.get(c.fecha) || []
    arr.push(c)
    citasPorDia.set(c.fecha, arr)
  })

  function fechaStr(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function abrirNueva(fecha?: string) {
    setForm({ ...form, fecha: fecha || new Date().toISOString().slice(0, 10) })
    setOpenNueva(true)
  }

  async function crearCita(e: React.FormEvent) {
    e.preventDefault()
    if (!form.cliente_nombre || !form.fecha || !form.hora_inicio) {
      push('Completa nombre, fecha y hora', 'error')
      return
    }
    setGuardando(true)
    const { data, error } = await supabase.from('agenda').insert({
      tecnico_id: tecnico.id,
      cliente_nombre: form.cliente_nombre,
      cliente_telefono: form.cliente_telefono || null,
      descripcion: form.descripcion || null,
      fecha: form.fecha,
      hora_inicio: form.hora_inicio,
      hora_fin: form.hora_fin || null,
      notas: form.notas || null,
      estado: 'confirmada',
    }).select().single()
    setGuardando(false)
    if (error) { push(`Error: ${error.message}`, 'error'); return }
    if (data) {
      setCitas([...citas, data])
      setOpenNueva(false)
      setForm({ ...form, cliente_nombre: '', cliente_telefono: '', descripcion: '', notas: '' })
      push('Cita agendada')
    }
  }

  async function cambiarEstadoCita(id: string, estado: 'completada' | 'cancelada') {
    const { error } = await supabase.from('agenda').update({ estado }).eq('id', id)
    if (!error) {
      setCitas(citas.map(c => c.id === id ? { ...c, estado } : c))
      push(`Marcada como "${estado}"`)
    }
  }

  async function eliminarCita(id: string) {
    if (!confirm('¿Eliminar esta cita?')) return
    await supabase.from('agenda').delete().eq('id', id)
    setCitas(citas.filter(c => c.id !== id))
  }

  const citasDiaSeleccionado = diaSeleccionado ? citasPorDia.get(diaSeleccionado) || [] : []

  return (
    <div className="space-y-6">
      {/* Tutorial expandible */}
      <details className="card bg-azul-mid/5 border-azul-mid/30" open>
        <summary className="cursor-pointer font-display text-lg text-azul font-bold flex items-center gap-2">
          💡 ¿Cómo funciona la agenda? <span className="text-xs text-gris-3 ml-auto font-normal">click para colapsar</span>
        </summary>
        <div className="mt-4 space-y-3 text-sm text-gris-4">
          <p>La agenda es tu <strong>calendario personal de visitas y citas</strong>. Solo tú la ves, no se muestra al cliente.</p>

          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div className="bg-white rounded-md p-3 border border-borde">
              <strong className="text-azul block mb-1">📅 Para qué sirve:</strong>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>Llevar registro de las visitas que tienes programadas</li>
                <li>No olvidar ningún compromiso con clientes</li>
                <li>Ver tu disponibilidad de un vistazo</li>
                <li>Marcar trabajos completados vs cancelados</li>
              </ul>
            </div>
            <div className="bg-white rounded-md p-3 border border-borde">
              <strong className="text-azul block mb-1">✍️ Cómo se llena:</strong>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>Click en <strong>"Nueva cita"</strong> abajo</li>
                <li>O <strong>doble click en cualquier día</strong> del calendario</li>
                <li>Pega los datos: nombre, teléfono, qué hay que hacer, fecha y hora</li>
                <li>Cuando termines el trabajo: marca "Completada"</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-gris-3 mt-3">
            <strong>Tip:</strong> Cuando un cliente te confirme una visita por WhatsApp, ven aquí inmediatamente y créala. Así nada se te olvida y mantienes tu trabajo organizado.
          </p>
        </div>
      </details>

      {/* Calendario */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMes(new Date(year, month - 1, 1))} className="p-2 hover:bg-papel rounded">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <h3 className="font-display text-xl text-azul font-bold capitalize">
              {mes.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
            </h3>
            <p className="text-xs text-gris-3">{citas.length} citas totales</p>
          </div>
          <button onClick={() => setMes(new Date(year, month + 1, 1))} className="p-2 hover:bg-papel rounded">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mb-3 flex justify-between items-center">
          <Button size="sm" onClick={() => abrirNueva()}>
            <Plus size={14} /> Nueva cita
          </Button>
          <p className="text-xs text-gris-3 hidden sm:block">Click en un día para verlo · doble click para agregar</p>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="text-center font-semibold text-gris-3 py-1">{d}</div>
          ))}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1
            const fecha = fechaStr(d)
            const dia = citasPorDia.get(fecha) || []
            const today = new Date().toDateString() === new Date(year, month, d).toDateString()
            const past = new Date(year, month, d) < new Date(new Date().setHours(0, 0, 0, 0))
            const seleccionado = fecha === diaSeleccionado
            return (
              <button
                key={d}
                onClick={() => setDiaSeleccionado(fecha)}
                onDoubleClick={() => abrirNueva(fecha)}
                className={`min-h-[70px] p-1.5 rounded border-2 text-left transition-colors hover:border-azul-mid ${
                  seleccionado ? 'border-azul-mid bg-azul-mid/10' :
                  today ? 'border-azul-mid bg-azul-mid/5' :
                  past ? 'border-borde bg-papel/30 opacity-60' :
                  'border-borde bg-white'
                }`}
              >
                <div className={`text-xs font-semibold ${today ? 'text-azul-mid' : 'text-gris-4'}`}>{d}</div>
                <div className="space-y-0.5 mt-1">
                  {dia.slice(0, 2).map(c => (
                    <div key={c.id} className={`text-[10px] truncate px-1 py-0.5 rounded ${c.estado === 'completada' ? 'bg-verde/15 text-verde' : c.estado === 'cancelada' ? 'bg-gris-3/15 text-gris-3 line-through' : 'bg-azul-mid/15 text-azul-mid'}`}>
                      {c.hora_inicio.slice(0, 5)} {c.cliente_nombre}
                    </div>
                  ))}
                  {dia.length > 2 && (
                    <div className="text-[10px] text-gris-3 font-medium">+{dia.length - 2}</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel del día seleccionado */}
      {diaSeleccionado && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-azul font-bold capitalize">
              {formatearFecha(diaSeleccionado, { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => abrirNueva(diaSeleccionado)}>
                <Plus size={14} /> Agregar cita
              </Button>
              <button onClick={() => setDiaSeleccionado(null)} className="p-1 hover:bg-papel rounded">
                <X size={16} />
              </button>
            </div>
          </div>
          {citasDiaSeleccionado.length === 0 ? (
            <p className="text-sm text-gris-3 text-center py-4">Sin citas este día</p>
          ) : (
            <div className="space-y-2">
              {citasDiaSeleccionado.map(c => {
                // Mensaje de recordatorio con detalles de la cita
                const fecha = new Date(c.fecha + 'T' + c.hora_inicio)
                const fechaTxt = fecha.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
                const horaTxt = c.hora_inicio.slice(0, 5) + (c.hora_fin ? ` – ${c.hora_fin.slice(0, 5)}` : '')
                const mensaje = `Hola ${c.cliente_nombre}, te confirmo nuestra cita:\n\n📅 ${fechaTxt}\n🕒 ${horaTxt}\n${c.descripcion ? `\n📋 ${c.descripcion}\n` : ''}\nSaludos,\n${tecnico.nombre_empresa}`
                const waLink = c.cliente_telefono
                  ? `https://wa.me/${c.cliente_telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`
                  : null
                const emailSubject = `Recordatorio de cita — ${tecnico.nombre_empresa}`
                const emailLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(mensaje)}`

                return (
                  <div key={c.id} className="border border-borde rounded-md p-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <strong className="text-azul">{c.cliente_nombre}</strong>
                        <span className="text-xs text-gris-3 ml-2">{horaTxt}</span>
                      </div>
                      <Badge tone={c.estado === 'completada' ? 'verde' : c.estado === 'cancelada' ? 'gris' : 'azul'}>{c.estado}</Badge>
                    </div>
                    {c.cliente_telefono && (
                      <a href={`tel:${c.cliente_telefono}`} className="text-xs text-azul-mid hover:underline inline-flex items-center gap-1">
                        <Phone size={11} /> {c.cliente_telefono}
                      </a>
                    )}
                    {c.descripcion && <p className="text-sm text-gris-4 mt-1">{c.descripcion}</p>}
                    {c.notas && <p className="text-xs text-gris-3 mt-1 italic">📝 {c.notas}</p>}

                    {/* Botones de envío al cliente */}
                    {(waLink || c.cliente_telefono) && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-borde">
                        <span className="text-xs text-gris-3 font-semibold">Enviar recordatorio:</span>
                        {waLink && (
                          <a href={waLink} target="_blank" rel="noopener noreferrer" className="text-xs text-verde font-semibold hover:underline inline-flex items-center gap-1">
                            <MessageCircle size={12} /> WhatsApp
                          </a>
                        )}
                        <a href={emailLink} className="text-xs text-azul-mid font-semibold hover:underline inline-flex items-center gap-1">
                          <Mail size={12} /> Email
                        </a>
                      </div>
                    )}

                    {/* Acciones de estado */}
                    <div className="flex gap-3 mt-2 text-xs">
                      {c.estado === 'confirmada' && (
                        <>
                          <button onClick={() => cambiarEstadoCita(c.id, 'completada')} className="text-verde font-medium hover:underline">✓ Completada</button>
                          <button onClick={() => cambiarEstadoCita(c.id, 'cancelada')} className="text-rojo font-medium hover:underline">✗ Cancelar</button>
                        </>
                      )}
                      <button onClick={() => eliminarCita(c.id)} className="text-gris-3 hover:text-rojo ml-auto">Eliminar</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal nueva cita */}
      <Modal open={openNueva} onClose={() => setOpenNueva(false)} title="Nueva cita" size="md">
        <form onSubmit={crearCita} className="space-y-3">
          <Input label="Nombre del cliente" required value={form.cliente_nombre} onChange={e => setForm({ ...form, cliente_nombre: e.target.value })} placeholder="Juan Pérez" />
          <Input label="Teléfono" value={form.cliente_telefono} onChange={e => setForm({ ...form, cliente_telefono: e.target.value })} placeholder="+56 9 1234 5678" />
          <Textarea label="¿Qué trabajo vas a hacer?" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Mantención de split LG en Las Condes" />
          <div className="grid grid-cols-3 gap-2">
            <Input label="Fecha" type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
            <Input label="Hora inicio" type="time" required value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} />
            <Input label="Hora fin" type="time" value={form.hora_fin} onChange={e => setForm({ ...form, hora_fin: e.target.value })} />
          </div>
          <Textarea label="Notas (opcional)" value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Cliente prefiere mañanas. Precio acordado $35.000. Estacionamiento piso -1." />
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpenNueva(false)}>Cancelar</Button>
            <Button type="submit" loading={guardando}>Agendar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
