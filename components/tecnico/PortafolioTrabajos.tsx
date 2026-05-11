'use client'
import Image from 'next/image'
import { useState } from 'react'
import type { Trabajo } from '@/types/database.types'

export function PortafolioTrabajos({ trabajos }: { trabajos: Trabajo[] }) {
  if (!trabajos.length) return null
  return (
    <div className="space-y-6">
      {trabajos.map(t => (
        <TrabajoItem key={t.id} trabajo={t} />
      ))}
    </div>
  )
}

function TrabajoItem({ trabajo }: { trabajo: Trabajo }) {
  const [pos, setPos] = useState(50)
  if (!trabajo.foto_antes || !trabajo.foto_despues) return null

  return (
    <article className="card">
      <h4 className="font-display text-lg text-azul mb-1">{trabajo.titulo}</h4>
      {trabajo.descripcion && <p className="text-sm text-gris-4 mb-3">{trabajo.descripcion}</p>}
      <div
        className="relative aspect-video rounded-md overflow-hidden bg-papel select-none"
        style={{ touchAction: 'none' }}
      >
        <Image src={trabajo.foto_despues} alt="después" fill className="object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <Image src={trabajo.foto_antes} alt="antes" fill className="object-cover" />
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-md cursor-ew-resize"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow flex items-center justify-center text-azul font-bold text-xs">⇔</div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={e => setPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
        <span className="absolute top-2 left-2 px-2 py-1 bg-azul/80 text-white text-xs rounded">ANTES</span>
        <span className="absolute top-2 right-2 px-2 py-1 bg-verde/90 text-white text-xs rounded">DESPUÉS</span>
      </div>
    </article>
  )
}
