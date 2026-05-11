'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Send, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { tiempoTranscurrido } from '@/lib/utils'
import type { Cotizacion } from '@/types/database.types'

export function HiloMensajes({ cotizacion, verFotos, tecnicoId }: { cotizacion: Cotizacion; verFotos: boolean; tecnicoId: string }) {
  const [respuesta, setRespuesta] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!respuesta.trim()) return
    setEnviando(true)
    await fetch('/api/cotizaciones/responder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cotizacion_id: cotizacion.id, contenido: respuesta, tecnico_id: tecnicoId }),
    })
    setEnviando(false)
    setRespuesta('')
  }

  return (
    <div className="h-full flex flex-col">
      {/* header */}
      <div className="border-b border-borde p-4">
        <div className="flex justify-between items-start">
          <div>
            <strong className="text-azul">{cotizacion.cliente_nombre}</strong>
            <div className="text-xs text-gris-3">{cotizacion.cliente_email}</div>
            {cotizacion.cliente_telefono && (
              <a href={`tel:${cotizacion.cliente_telefono}`} className="text-xs text-azul hover:underline">
                {cotizacion.cliente_telefono}
              </a>
            )}
          </div>
          <span className="text-xs text-gris-3">{tiempoTranscurrido(cotizacion.created_at)}</span>
        </div>
        {cotizacion.comuna_servicio && (
          <div className="text-xs text-gris-4 mt-1">📍 {cotizacion.comuna_servicio}</div>
        )}
      </div>

      {/* mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-papel/30">
        <div className="bg-white rounded-lg p-3 max-w-[80%] border border-borde">
          <p className="text-sm text-gris-4 whitespace-pre-wrap">{cotizacion.descripcion}</p>
          {cotizacion.fotos_urls && cotizacion.fotos_urls.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {cotizacion.fotos_urls.map((url, i) => (
                <div key={i} className="relative h-20 w-20 rounded overflow-hidden">
                  <Image src={url} alt="" fill className={`object-cover ${verFotos ? '' : 'blur-md'}`} />
                  {!verFotos && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Lock size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!verFotos && cotizacion.fotos_urls && cotizacion.fotos_urls.length > 0 && (
            <p className="text-[11px] text-rojo mt-2">Las fotos requieren plan PRO</p>
          )}
        </div>

        {cotizacion.respuesta && (
          <div className="bg-azul text-white rounded-lg p-3 max-w-[80%] ml-auto">
            <p className="text-sm whitespace-pre-wrap">{cotizacion.respuesta}</p>
          </div>
        )}
      </div>

      {/* respuesta */}
      <form onSubmit={enviar} className="border-t border-borde p-3 flex gap-2">
        <input
          value={respuesta}
          onChange={e => setRespuesta(e.target.value)}
          placeholder="Escribe tu respuesta…"
          className="input-st flex-1"
        />
        <Button type="submit" loading={enviando}>
          <Send size={14} /> Enviar
        </Button>
      </form>
    </div>
  )
}
