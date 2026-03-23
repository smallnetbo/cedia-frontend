'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, Chip, Stack, Typography, Paper, CircularProgress } from '@mui/material'
import { FeatureCollection, Feature } from 'geojson'

// ─────────────────────────────────────────────────────────
//  Importamos la función que ya existe en el proyecto.
//  Ella carga el GeoJSON de Bolivia (GAD = departamentos)
//  desde la API + CoordenadasTodas.json como fallback.
// ─────────────────────────────────────────────────────────
import { getDataGeneralFinal } from '@/components/map/api/apiMap'

// ── Colores por departamento (c_ut_dep = código de entidad)
// Ajusta los códigos según los que devuelve tu API
const COLOR_DEPARTAMENTOS: Record<string, string> = {
  '1': '#E63946', // La Paz
  '2': '#457B9D', // Oruro
  '3': '#2A9D8F', // Potosí
  '4': '#E9C46A', // Chuquisaca
  '5': '#F4A261', // Tarija
  '6': '#264653', // Santa Cruz
  '7': '#A8DADC', // Beni
  '8': '#6A4C93', // Pando
  '9': '#1D3557', // Cochabamba
}

// ─────────────────────────────────────────────────────────
//  Ray casting: detecta si [lat,lng] está dentro de un
//  anillo GeoJSON [lng,lat]
// ─────────────────────────────────────────────────────────
function puntoEnAnillo(lat: number, lng: number, anillo: number[][]): boolean {
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

function detectarDepartamento(
  lat: number,
  lng: number,
  geojson: FeatureCollection
): Feature | null {
  return (
    geojson.features.find((f) => {
      const geom = f.geometry
      if (geom.type === 'Polygon') {
        return puntoEnAnillo(lat, lng, geom.coordinates[0])
      }
      if (geom.type === 'MultiPolygon') {
        return geom.coordinates.some((poly) =>
          puntoEnAnillo(lat, lng, poly[0])
        )
      }
      return false
    }) ?? null
  )
}

// ─────────────────────────────────────────────────────────
//  ClickHandler — dentro del MapContainer (patrón del proyecto)
// ─────────────────────────────────────────────────────────
function ClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ─────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────
export default function MapaBolivia() {
  // Bolivia centrada — mismo centro que usa MapaGeneral.tsx
  const centro: LatLngExpression = [-16.403839, -64.170288]
  const zoom = 6

  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const geoJSONRef = useRef<L.GeoJSON | null>(null)

  const [geojsonData, setGeojsonData] = useState<FeatureCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [depaSeleccionado, setDepaSeleccionado] = useState<Feature | null>(null)
  const [depaHover, setDepaHover] = useState<string | null>(null)
  const [ultimoClick, setUltimoClick] = useState<{ lat: number; lng: number } | null>(null)
  const [log, setLog] = useState<string[]>(['Haz click sobre un departamento'])

  const agregarLog = (msg: string) =>
    setLog((prev) => [msg, ...prev].slice(0, 6))

  // ── Carga el GeoJSON de Bolivia usando la función del proyecto
  useEffect(() => {
    getDataGeneralFinal('GAD').then((data) => {
      setGeojsonData(data as FeatureCollection)
      setIsLoading(false)
    })
  }, [])

  // ── Icono del héroe (marcador rojo)
  const icono = L.divIcon({
    className: '',
    html: `<div style="
      width:18px;height:18px;
      background:#E63946;
      border:3px solid #fff;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.45);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

  // ── Estilo base de cada feature (departamento)
  const estiloFeature = useCallback(
    (feature?: Feature) => {
      const codigo = feature?.properties?.c_ut_dep as string
      const color = COLOR_DEPARTAMENTOS[codigo] ?? '#08B0A7'
      const seleccionado =
        depaSeleccionado?.properties?.c_ut_dep === codigo

      return {
        color: '#fff',
        weight: seleccionado ? 3 : 1.5,
        fillColor: color,
        fillOpacity: seleccionado ? 0.85 : 0.55,
      }
    },
    [depaSeleccionado]
  )

  // ── Eventos por capa (tooltip + hover)
  const onEachFeature = useCallback(
    (feature: Feature, layer: L.Layer) => {
      const nombre = feature.properties?.nom_dpto as string
      const codigo = feature.properties?.c_ut_dep as string
      const color = COLOR_DEPARTAMENTOS[codigo] ?? '#08B0A7'

      layer.bindTooltip(nombre, { sticky: true, opacity: 0.9 })

      layer.on({
        mouseover(e) {
          const l = e.target as L.Path
          setDepaHover(nombre)
          l.setStyle({ weight: 3, fillOpacity: 0.8 })
          l.bringToFront()
        },
        mouseout(e) {
          const l = e.target as L.Path
          setDepaHover(null)
          const seleccionado =
            depaSeleccionado?.properties?.c_ut_dep === codigo
          l.setStyle({
            weight: seleccionado ? 3 : 1.5,
            fillOpacity: seleccionado ? 0.85 : 0.55,
          })
        },
        // Click en la capa GeoJSON — alternativa al ClickHandler
        // Aquí usamos el ClickHandler para unificar la lógica
      })
    },
    [depaSeleccionado]
  )

  // ── Cuando el usuario hace click en el mapa
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (!geojsonData) return

      setUltimoClick({ lat, lng })

      // Mover marcador del héroe
      if (mapRef.current) {
        if (!markerRef.current) {
          markerRef.current = L.marker([lat, lng], { icon: icono }).addTo(
            mapRef.current
          )
        } else {
          markerRef.current.setLatLng([lat, lng])
        }
      }

      // Detectar departamento
      const feature = detectarDepartamento(lat, lng, geojsonData)

      if (feature) {
        const nombre = feature.properties?.nom_dpto as string
        setDepaSeleccionado(feature)

        // Volar al departamento seleccionado
        if (mapRef.current && geoJSONRef.current) {
          geoJSONRef.current.eachLayer((layer: any) => {
            if (
              layer.feature?.properties?.c_ut_dep ===
              feature.properties?.c_ut_dep
            ) {
              mapRef.current!.flyToBounds(layer.getBounds(), {
                duration: 1,
                padding: [40, 40],
              })
            }
          })
        }

        agregarLog(`✅ Departamento: ${nombre}`)
      } else {
        setDepaSeleccionado(null)
        // Volver al centro de Bolivia
        mapRef.current?.flyTo(centro, zoom, { duration: 1 })
        agregarLog(`⬜ Fuera de Bolivia (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geojsonData]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
      <Typography variant="h5" fontWeight={700}>
        Mapa Bolivia — Departamentos
      </Typography>

      {/* Info del departamento seleccionado */}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography variant="body2" color="text.secondary">
          Seleccionado:
        </Typography>
        {depaSeleccionado ? (
          <Chip
            label={depaSeleccionado.properties?.nom_dpto}
            sx={{
              background:
                COLOR_DEPARTAMENTOS[
                  depaSeleccionado.properties?.c_ut_dep
                ] ?? '#08B0A7',
              color: '#fff',
              fontWeight: 600,
            }}
            onDelete={() => {
              setDepaSeleccionado(null)
              mapRef.current?.flyTo(centro, zoom, { duration: 1 })
            }}
          />
        ) : (
          <Chip label="Ninguno" variant="outlined" size="small" />
        )}

        {depaHover && (
          <Chip
            label={`Hover: ${depaHover}`}
            size="small"
            variant="outlined"
            color="info"
          />
        )}
      </Stack>

      {/* Mapa */}
      <Box
        sx={{
          height: 560,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #ddd',
          position: 'relative',
        }}
      >
        {isLoading && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        )}

        {!isLoading && geojsonData && (
          <MapContainer
            ref={mapRef}
            center={centro}
            zoom={zoom}
            minZoom={5}
            scrollWheelZoom
            style={{ width: '100%', height: '100%' }}
          >
            {/* Capa de tiles */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            />

            {/*
              GeoJSON con todos los departamentos de Bolivia.
              - style: color dinámico por departamento
              - onEachFeature: tooltip + hover
              - ref: para poder llamar eachLayer() y hacer flyToBounds
            */}
            <GeoJSON
              ref={geoJSONRef}
              key={depaSeleccionado?.properties?.c_ut_dep ?? 'none'}
              data={geojsonData}
              style={estiloFeature}
              onEachFeature={onEachFeature}
            />

            {/*
              ClickHandler DENTRO del MapContainer.
              useMapEvents solo funciona dentro de <MapContainer>.
              Mismo patrón que ChangeMapView en tu Mapa.tsx.
            */}
            <ClickHandler onMapClick={handleMapClick} />
          </MapContainer>
        )}
      </Box>

      {/* Coordenadas */}
      {ultimoClick && (
        <Typography variant="caption" color="text.secondary">
          Último click → lat: {ultimoClick.lat.toFixed(6)}, lng:{' '}
          {ultimoClick.lng.toFixed(6)}
        </Typography>
      )}

      {/* Log */}
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

      {/* Leyenda */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="caption" fontWeight={700} display="block" mb={1}>
          Departamentos
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {geojsonData?.features.map((f) => {
            const cod = f.properties?.c_ut_dep as string
            const nombre = f.properties?.nom_dpto as string
            return (
              <Chip
                key={cod}
                label={nombre}
                size="small"
                sx={{
                  background: COLOR_DEPARTAMENTOS[cod] ?? '#08B0A7',
                  color: '#fff',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  // Click en leyenda → selecciona y vuela al departamento
                  setDepaSeleccionado(f)
                  if (mapRef.current && geoJSONRef.current) {
                    geoJSONRef.current.eachLayer((layer: any) => {
                      if (layer.feature?.properties?.c_ut_dep === cod) {
                        mapRef.current!.flyToBounds(layer.getBounds(), {
                          duration: 1.2,
                          padding: [40, 40],
                        })
                      }
                    })
                  }
                  agregarLog(`📌 Seleccionado desde leyenda: ${nombre}`)
                }}
              />
            )
          })}
        </Stack>
      </Paper>
    </Box>
  )
}