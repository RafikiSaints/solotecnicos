'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { TarjetaTecnico } from '@/components/tecnico/TarjetaTecnico'
import { Button } from '@/components/ui/Button'
import type { Region, TecnicoConRelaciones } from '@/types/database.types'

interface Props {
  data: { region: Region; tecnicos: TecnicoConRelaciones[] }[]
}

export function TabsRegionDestacados({ data }: Props) {
  const [activa, setActiva] = useState(0)
  if (!data.length) return null

  const actual = data[activa]

  return (
    <section className="container-st py-14">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-3xl md:text-4xl text-azul font-extrabold flex items-center gap-2">
            <MapPin size={28} className="text-azul-mid" />
            Top técnicos por región
          </h2>
          <p className="text-gris-4 text-sm mt-1">Los mejor calificados de cada región</p>
        </div>
        <Link href={`/region/${actual.region.slug}`}>
          <Button variant="outline" size="sm">Ver todos en {actual.region.nombre} →</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-borde pb-3">
        {data.map((d, i) => (
          <button
            key={d.region.id}
            onClick={() => setActiva(i)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              i === activa
                ? 'bg-azul text-white shadow-soft'
                : 'bg-white border border-borde text-gris-4 hover:border-azul-mid hover:text-azul'
            }`}
          >
            {d.region.nombre}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
              i === activa ? 'bg-white/20 text-white' : 'bg-papel text-gris-3'
            }`}>
              {d.tecnicos.length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid de la región activa */}
      <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
        {actual.tecnicos.map(t => (
          <TarjetaTecnico key={t.id} tecnico={t} />
        ))}
      </div>
    </section>
  )
}
