'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { useEffect } from 'react'
import type { TecnicoConRelaciones } from '@/types/database.types'

// Iconos por plan (color)
const makeIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

const ICONS = {
  elite:  makeIcon('#C8102E'),
  pro:    makeIcon('#C89A2E'),
  gratis: makeIcon('#1E4A82'),
}

// Centro de Chile por defecto (Santiago)
const DEFAULT_CENTER: [number, number] = [-33.45, -70.66]

function AutoFit({ tecnicos }: { tecnicos: TecnicoConRelaciones[] }) {
  const map = useMap()
  useEffect(() => {
    const validos = tecnicos.filter(t => t.lat && t.lng)
    if (!validos.length) return
    const bounds = L.latLngBounds(validos.map(t => [t.lat!, t.lng!] as [number, number]))
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 })
  }, [tecnicos, map])
  return null
}

export function MapaDirectorio({ tecnicos }: { tecnicos: TecnicoConRelaciones[] }) {
  const validos = tecnicos.filter(t => t.lat && t.lng)
  return (
    <div className="h-full w-full min-h-[400px] sticky top-24 rounded-lg overflow-hidden border border-borde">
      <MapContainer center={DEFAULT_CENTER} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoFit tecnicos={validos} />
        {validos.map(t => (
          <Marker
            key={t.id}
            position={[t.lat!, t.lng!]}
            icon={ICONS[t.plan]}
          >
            <Popup>
              <div className="space-y-1 min-w-[180px]">
                <strong className="text-azul text-sm">{t.nombre_empresa}</strong>
                <div className="text-xs text-gris-3">{t.comuna}</div>
                <div className="text-xs">⭐ {(t.rating_promedio || 0).toFixed(1)} ({t.total_resenas})</div>
                <Link href={`/tecnico/${t.slug}`} className="block mt-1 text-xs text-rojo font-semibold">
                  Ver perfil →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
