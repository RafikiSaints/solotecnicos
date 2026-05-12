'use client'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { MapPin } from 'lucide-react'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const DEFAULT: [number, number] = [-33.45, -70.66] // Santiago

function Clicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface Props {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

export function MapaSelector({ lat, lng, onChange }: Props) {
  const [pos, setPos] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  )

  function handlePick(la: number, ln: number) {
    setPos([la, ln])
    onChange(la, ln)
  }

  async function buscarMiUbicacion() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(p => {
      handlePick(p.coords.latitude, p.coords.longitude)
    })
  }

  const center = pos || DEFAULT

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gris-3 flex items-center gap-1.5">
          <MapPin size={12} /> Click en el mapa para marcar tu ubicación exacta
        </p>
        <button
          type="button"
          onClick={buscarMiUbicacion}
          className="text-xs text-azul-mid hover:underline font-medium"
        >
          📍 Usar mi ubicación actual
        </button>
      </div>
      <div className="h-72 rounded-md overflow-hidden border-2 border-borde">
        <MapContainer center={center} zoom={pos ? 14 : 6} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Clicker onPick={handlePick} />
          {pos && <Marker position={pos} icon={icon} />}
        </MapContainer>
      </div>
      {pos && (
        <p className="text-xs text-verde mt-2">
          ✓ Coordenadas: {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
        </p>
      )}
    </div>
  )
}
