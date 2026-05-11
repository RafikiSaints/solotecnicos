'use client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import type { Tecnico } from '@/types/database.types'

export function RadarRatings({ tecnico }: { tecnico: Tecnico }) {
  const data = [
    { dim: 'Atención',    value: tecnico.rating_atencion },
    { dim: 'Calidad',     value: tecnico.rating_calidad },
    { dim: 'Respuesta',   value: tecnico.rating_respuesta },
    { dim: 'Resolución',  value: tecnico.rating_resolucion },
    { dim: 'Rapidez',     value: tecnico.rating_rapidez },
    { dim: 'Precio',      value: tecnico.rating_precio },
    { dim: 'Garantía',    value: tecnico.rating_garantia },
  ]
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#D8D5CE" />
          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: '#4A4840' }} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke="#C89A2E" fill="#C89A2E" fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
