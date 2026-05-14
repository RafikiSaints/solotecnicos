'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useTecnicoSeleccionadoStore } from '@/store/useTecnicoSeleccionadoStore'
import type { TecnicoConRelaciones } from '@/types/database.types'

// Iconos por plan (color)
const makeIcon = (color: string, big = false) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${color};width:${big ? 32 : 24}px;height:${big ? 32 : 24}px;border-radius:50%;border:${big ? 3 : 2}px solid white;box-shadow:0 ${big ? 2 : 1}px ${big ? 8 : 3}px rgba(0,0,0,${big ? 0.5 : 0.3})"></div>`,
    iconSize: [big ? 32 : 24, big ? 32 : 24],
    iconAnchor: [big ? 16 : 12, big ? 16 : 12],
  })

const ICONS = {
  elite:  makeIcon('#C8102E'),
  pro:    makeIcon('#C89A2E'),
  gratis: makeIcon('#1E4A82'),
}
const ICONS_BIG = {
  elite:  makeIcon('#C8102E', true),
  pro:    makeIcon('#C89A2E', true),
  gratis: makeIcon('#1E4A82', true),
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

/**
 * Cuando un técnico se "selecciona" desde una TarjetaTecnico, hacemos
 * fly-to a su ubicación y abrimos su popup. Reaccionamos a `tick` (no a
 * `selectedId`) para que re-enfocar el mismo técnico siga funcionando.
 */
function FocusSelected({
  tecnicos,
  markersRef,
}: {
  tecnicos: TecnicoConRelaciones[]
  markersRef: React.MutableRefObject<Record<string, L.Marker | null>>
}) {
  const map = useMap()
  const selectedId = useTecnicoSeleccionadoStore(s => s.selectedId)
  const tick = useTecnicoSeleccionadoStore(s => s.tick)

  useEffect(() => {
    if (!selectedId) return
    const t = tecnicos.find(x => x.id === selectedId)
    if (!t?.lat || !t?.lng) return
    map.flyTo([t.lat, t.lng], 15, { duration: 0.6 })
    // Pequeño delay para esperar el zoom antes de abrir el popup
    const id = setTimeout(() => {
      const marker = markersRef.current[selectedId]
      marker?.openPopup()
    }, 700)
    return () => clearTimeout(id)
  }, [selectedId, tick, tecnicos, map, markersRef])
  return null
}

export function MapaDirectorio({ tecnicos }: { tecnicos: TecnicoConRelaciones[] }) {
  const validos = tecnicos.filter(t => t.lat && t.lng)
  const selectedId = useTecnicoSeleccionadoStore(s => s.selectedId)
  const markersRef = useRef<Record<string, L.Marker | null>>({})

  return (
    <div className="h-full w-full min-h-[400px] sticky top-24 rounded-lg overflow-hidden border border-borde">
      <MapContainer center={DEFAULT_CENTER} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoFit tecnicos={validos} />
        <FocusSelected tecnicos={validos} markersRef={markersRef} />
        {validos.map(t => {
          const enfocado = selectedId === t.id
          return (
            <Marker
              key={t.id}
              position={[t.lat!, t.lng!]}
              icon={enfocado ? ICONS_BIG[t.plan] : ICONS[t.plan]}
              ref={(ref) => { markersRef.current[t.id] = ref }}
            >
              <Popup>
                <div className="space-y-1 min-w-[180px]">
                  <strong className="text-azul text-sm">{t.nombre_empresa}</strong>
                  <div className="text-xs text-gris-3">{t.comuna}{t.region_nombre ? `, ${t.region_nombre}` : ''}</div>
                  {(t.total_resenas || 0) > 0 ? (
                    <div className="text-xs">⭐ {(t.rating_promedio || 0).toFixed(1)} ({t.total_resenas})</div>
                  ) : (t.google_total_resenas || 0) > 0 ? (
                    <div className="text-xs text-gris-4">⭐ {(t.google_rating || 0).toFixed(1)} en Google ({t.google_total_resenas})</div>
                  ) : null}
                  <Link href={`/tecnico/${t.slug}`} className="block mt-1 text-xs text-rojo font-semibold">
                    Ver perfil →
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
