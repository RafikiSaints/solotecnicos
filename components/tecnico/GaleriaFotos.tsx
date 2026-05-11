'use client'
import Image from 'next/image'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Foto } from '@/types/database.types'

export function GaleriaFotos({ fotos }: { fotos: Foto[] }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!fotos.length) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {fotos.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setOpen(i)}
            className="relative aspect-square rounded-md overflow-hidden bg-papel group"
          >
            <Image
              src={f.url}
              alt={f.caption || ''}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-50 bg-azul/95 flex items-center justify-center p-4">
          <button onClick={() => setOpen(null)} className="absolute top-4 right-4 text-white p-2">
            <X size={24} />
          </button>
          <button
            onClick={() => setOpen((open - 1 + fotos.length) % fotos.length)}
            className="absolute left-4 text-white p-2"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={() => setOpen((open + 1) % fotos.length)}
            className="absolute right-4 text-white p-2"
          >
            <ChevronRight size={32} />
          </button>
          <div className="relative w-full max-w-4xl aspect-video">
            <Image src={fotos[open].url} alt="" fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  )
}
