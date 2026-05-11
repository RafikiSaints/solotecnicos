'use client'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Punto { fecha: string; valor: number }

export function GraficoLinea({ data, color = '#0D2444', label }: { data: Punto[]; color?: string; label: string }) {
  return (
    <div className="card">
      <h4 className="text-sm font-medium text-gris-3 mb-3">{label}</h4>
      <div className="h-56">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D8D5CE" vertical={false} />
            <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#8A877F' }} />
            <YAxis tick={{ fontSize: 10, fill: '#8A877F' }} />
            <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid #D8D5CE' }} />
            <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function GraficoBarras({ data, color = '#C8102E', label }: { data: Punto[]; color?: string; label: string }) {
  return (
    <div className="card">
      <h4 className="text-sm font-medium text-gris-3 mb-3">{label}</h4>
      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D8D5CE" vertical={false} />
            <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#8A877F' }} />
            <YAxis tick={{ fontSize: 10, fill: '#8A877F' }} />
            <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid #D8D5CE' }} />
            <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function MetricaCard({ label, valor, delta }: { label: string; valor: string | number; delta?: number }) {
  return (
    <div className="card">
      <div className="text-xs text-gris-3">{label}</div>
      <div className="font-display text-3xl font-bold text-azul mt-1">{valor}</div>
      {delta !== undefined && (
        <div className={`text-xs mt-1 ${delta >= 0 ? 'text-verde' : 'text-rojo'}`}>
          {delta >= 0 ? '+' : ''}{delta}% vs período anterior
        </div>
      )}
    </div>
  )
}
