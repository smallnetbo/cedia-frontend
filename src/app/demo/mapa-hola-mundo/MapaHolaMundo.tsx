'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, Chip, Stack, Typography, Paper } from '@mui/material'
import { Feature, FeatureCollection } from 'geojson'

// ─────────────────────────────────────────────
//  ZONAS DE EJEMPLO (en tu proyecto real esto
//  vendrá de tu API via getDataGeneralFinal)
// ─────────────────────────────────────────────
//  IMPORTANTE: GeoJSON usa [lng, lat], NO [lat, lng]
const ZONAS_DEMO: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'zona-norte', nombre: 'Zona Norte', color: '#4CAF50' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-68.20, -16.46],
          [-68.10, -16.46],
          [-68.10, -16.52],
          [-68.20, -16.52],
          [-68.20, -16.46],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'zona-centro', nombre: 'Zona Centro', color: '#2196F3' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-68.10, -16.46],
          [-68.00, -16.46],
          [-68.00, -16.52],
          [-68.10, -16.52],
          [-68.10, -16.46],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'zona-sur', nombre: 'Zona Sur', color: '#FF5722' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-68.20, -16.52],
          [-68.00, -16.52],
          [-68.00, -16.58],
          [-68.20, -16.58],
          [-68.20, -16.52],
        ]],
      },
    },
  ],
}

// ─────────────────────────────────────────────
//  UTILIDAD: ray casting [lng, lat] GeoJSON
// ─────────────────────────────────────────────
function puntoEnPoligono(lat: number, lng: number, anillo: number[][]): boolean {
  let dentro = false
  const n = anillo.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [lngI, latI] = anillo[i]
    const [lngJ, latJ] = anillo[j]
    const intersecta =
      latI > lat !== latJ > lat &&
      lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI
    if (intersecta) dentro = !dentro
  }
  return dentro
}

function detectarZona(lat: number, lng: number, geojson: FeatureCollection): Feature | null {
  return geojson.features.find((f) => {
    const geom = f.geometry
    if (geom.type === 'Polygon') {
      return puntoEnPoligono(lat, lng, geom.coordinates[0])
    }
    if (geom.type === 'MultiPolygon') {
      return geom.coordinates.some((poly) => puntoEnPoligono(lat, lng, poly[0]))
    }
    return false
  }) ?? null
}

// ─────────────────────────────────────────────
//  SUB-COMPONENTE: maneja clicks dentro del mapa
//  Sigue el patrón que ya usa tu proyecto en
//  Mapa.tsx con useMapEvents
// ─────────────────────────────────────────────
interface ClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void
}
function ClickHandler({ onMapClick }: ClickHandlerProps) {
  // useMapEvents DEBE estar dentro de <MapContainer>
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ─────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
interface ZonaActual {
  nombre: string
  color: string
}

export default function MapaHolaMundo() {
  const centro: LatLngExpression = [-16.52, -68.10]
  const markerRef = useRef<L.Marker | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  const [ultimoClick, setUltimoClick] = useState<{ lat: number; lng: number } | null>(null)
  const [zonaActual, setZonaActual] = useState<ZonaActual | null>(null)
  const [log, setLog] = useState<string[]>(['Haz click en el mapa para comenzar'])

  const agregarLog = (mensaje: string) => {
    setLog((prev) => [mensaje, ...prev].slice(0, 5)) // muestra los últimos 5
  }

  // ── Icono del marcador (evita el bug del ícono roto en Next.js)
  const icono = L.divIcon({
    className: '',
    html: `<div style="
      width:20px; height:20px;
      background:#e74c3c;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

  // ── Se llama cada vez que el usuario hace click en el mapa
  const handleMapClick = (lat: number, lng: number) => {
    setUltimoClick({ lat, lng })

    // 1. Mover (o crear) el marcador del héroe
    if (mapRef.current) {
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], { icon: icono }).addTo(mapRef.current)
      } else {
        markerRef.current.setLatLng([lat, lng])
      }
    }

    // 2. Detectar en qué zona está el punto
    const feature = detectarZona(lat, lng, ZONAS_DEMO)

    if (feature) {
      const props = feature.properties as { nombre: string; color: string }
      setZonaActual(props)
      agregarLog(`✅ Entró a: ${props.nombre} (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
    } else {
      setZonaActual(null)
      agregarLog(`⬜ Fuera de zonas (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
    }
  }

  // ── Estilo de cada polígono según sus propiedades
  const estiloZona = (feature?: Feature) => ({
    color: (feature?.properties?.color as string) ?? '#888',
    weight: 2,
    fillOpacity: 0.25,
    fillColor: (feature?.properties?.color as string) ?? '#888',
  })

  // ── Tooltip al pasar el mouse por una zona
  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    const nombre = feature.properties?.nombre as string
    layer.bindTooltip(nombre, { sticky: true })

    layer.on({
      mouseover(e) {
        ;(e.target as L.Path).setStyle({ fillOpacity: 0.5, weight: 3 })
      },
      mouseout(e) {
        ;(e.target as L.Path).setStyle({ fillOpacity: 0.25, weight: 2 })
      },
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>

      {/* Título */}
      <Typography variant="h5" fontWeight={700}>
        Mapa Hola Mundo
      </Typography>

      {/* Zona activa */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Zona actual:
        </Typography>
        {zonaActual ? (
          <Chip
            label={zonaActual.nombre}
            sx={{ background: zonaActual.color, color: '#fff', fontWeight: 600 }}
          />
        ) : (
          <Chip label="Fuera de zonas" variant="outlined" />
        )}
      </Stack>

      {/* Mapa */}
      <Box sx={{ height: 500, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
        <MapContainer
          // ref del mapa — permite hacer mapRef.current.flyTo() etc.
          ref={mapRef}
          center={centro}
          zoom={13}
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          {/* Capa de tiles (OpenStreetMap) */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          />

          {/* Polígonos de zonas */}
          <GeoJSON
            data={ZONAS_DEMO}
            style={estiloZona}
            onEachFeature={onEachFeature}
          />

          {/*
            ClickHandler va DENTRO de MapContainer.
            Así funciona useMapEvents — mismo patrón
            que ChangeMapView en tu Mapa.tsx.
          */}
          <ClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </Box>

      {/* Coordenadas del último click */}
      {ultimoClick && (
        <Typography variant="caption" color="text.secondary">
          Último click → lat: {ultimoClick.lat.toFixed(6)}, lng: {ultimoClick.lng.toFixed(6)}
        </Typography>
      )}

      {/* Log de eventos */}
      <Paper variant="outlined" sx={{ p: 2, background: '#f9f9f9' }}>
        <Typography variant="caption" fontWeight={700} display="block" mb={1}>
          Log de eventos
        </Typography>
        {log.map((msg, i) => (
          <Typography
            key={i}
            variant="caption"
            display="block"
            color={i === 0 ? 'text.primary' : 'text.disabled'}
          >
            {msg}
          </Typography>
        ))}
      </Paper>
    </Box>
  )
}
