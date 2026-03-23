'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import L, { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Box, Chip, Stack, Typography, Paper,
  CircularProgress, ToggleButton, ToggleButtonGroup, Divider,
} from '@mui/material'
import { FeatureCollection, Feature } from 'geojson'
import { getDataGeneralFinal } from '@/components/map/api/apiMap'

// ─────────────────────────────────────────────────────────────────
//  DATOS EXTRAÍDOS DE LA BASE DE DATOS subnacionales.sql
//  Clave: id_eta (coincide con c_ut_dep en el GeoJSON de la API)
// ─────────────────────────────────────────────────────────────────

interface ResultadoDepto {
  sigla: string
  partido: string
  gobernador: string
  porcentaje: number
  color: string
}

// Colores directamente de la tabla `partidos`
const COLORES_PARTIDO: Record<string, string> = {
  'MAS-IPSP': '#0400ff',
  'SOL.BO': '#feed00',
  'DEMOCRATAS': '#43b43d',
  'UD-A': '#aba117',
  'CST': '#fda72e',
  'J.A. LLALLA.L.P.': '#f90403',
  'MTS': '#004026',
  'CREEMOS': '#781e40',
  'UNIDOS POR TARIJA': '#6f03be',
}

const NOMBRE_PARTIDO: Record<string, string> = {
  'MAS-IPSP': 'Mov. al Socialismo',
  'SOL.BO': 'Soberanía y Libertad',
  'DEMOCRATAS': 'Mov. Demócrata Social',
  'UD-A': 'Unidad Depart. Autonomista',
  'CST': 'Chuquisaca Somos Todos',
  'J.A. LLALLA.L.P.': 'Jallalla La Paz',
  'MTS': 'Mov. Tercer Sistema',
  'CREEMOS': 'Creemos',
  'UNIDOS POR TARIJA': 'Unidos por Tarija',
}

// id_eta 901-909 coinciden directamente con c_ut_dep en el GeoJSON
const RESULTADOS: Record<'2015' | '2021', Record<string, ResultadoDepto>> = {
  '2015': {
    '901': { sigla: 'MAS-IPSP', partido: NOMBRE_PARTIDO['MAS-IPSP'], gobernador: 'Esteban Urquizo Cuellar', porcentaje: 48.91, color: COLORES_PARTIDO['MAS-IPSP'] },
    '902': { sigla: 'SOL.BO', partido: NOMBRE_PARTIDO['SOL.BO'], gobernador: 'Felix Patzy Paco', porcentaje: 50.09, color: COLORES_PARTIDO['SOL.BO'] },
    '903': { sigla: 'MAS-IPSP', partido: NOMBRE_PARTIDO['MAS-IPSP'], gobernador: 'Iván Canelas Alurralde', porcentaje: 61.61, color: COLORES_PARTIDO['MAS-IPSP'] },
    '904': { sigla: 'MAS-IPSP', partido: NOMBRE_PARTIDO['MAS-IPSP'], gobernador: 'Victor Hugo Vásquez Mamani', porcentaje: 57.65, color: COLORES_PARTIDO['MAS-IPSP'] },
    '905': { sigla: 'MAS-IPSP', partido: NOMBRE_PARTIDO['MAS-IPSP'], gobernador: 'Juan Carlos Cejas Ugarte', porcentaje: 62.21, color: COLORES_PARTIDO['MAS-IPSP'] },
    '906': { sigla: 'UD-A', partido: NOMBRE_PARTIDO['UD-A'], gobernador: 'Adrián Oliva Alcázar', porcentaje: 60.69, color: COLORES_PARTIDO['UD-A'] },
    '907': { sigla: 'DEMOCRATAS', partido: NOMBRE_PARTIDO['DEMOCRATAS'], gobernador: 'Rubén Armando Costas Aguilera', porcentaje: 59.44, color: COLORES_PARTIDO['DEMOCRATAS'] },
    '908': { sigla: 'MAS-IPSP', partido: NOMBRE_PARTIDO['MAS-IPSP'], gobernador: 'Alex Ferrier Abidar', porcentaje: 50.23, color: COLORES_PARTIDO['MAS-IPSP'] },
    '909': { sigla: 'MAS-IPSP', partido: NOMBRE_PARTIDO['MAS-IPSP'], gobernador: 'Luis Adolfo Flores Robert', porcentaje: 66.73, color: COLORES_PARTIDO['MAS-IPSP'] },
  },
  '2021': {
    '901': { sigla: 'CST', partido: NOMBRE_PARTIDO['CST'], gobernador: 'Damián Condori Herrera', porcentaje: 57.32, color: COLORES_PARTIDO['CST'] },
    '902': { sigla: 'J.A. LLALLA.L.P.', partido: NOMBRE_PARTIDO['J.A. LLALLA.L.P.'], gobernador: 'Santos Quispe Quispe', porcentaje: 55.23, color: COLORES_PARTIDO['J.A. LLALLA.L.P.'] },
    '903': { sigla: 'MAS-IPSP', partido: NOMBRE_PARTIDO['MAS-IPSP'], gobernador: 'Humberto Sánchez Sánchez', porcentaje: 57.44, color: COLORES_PARTIDO['MAS-IPSP'] },
    '904': { sigla: 'MAS-IPSP', partido: NOMBRE_PARTIDO['MAS-IPSP'], gobernador: 'Johnny Franklin Vedia Rodríguez', porcentaje: 46.31, color: COLORES_PARTIDO['MAS-IPSP'] },
    '905': { sigla: 'MAS-IPSP', partido: NOMBRE_PARTIDO['MAS-IPSP'], gobernador: 'Jhonny Oscar Mamani Gutiérrez', porcentaje: 44.05, color: COLORES_PARTIDO['MAS-IPSP'] },
    '906': { sigla: 'UNIDOS POR TARIJA', partido: NOMBRE_PARTIDO['UNIDOS POR TARIJA'], gobernador: 'Oscar Gerardo Montes Barzón', porcentaje: 54.44, color: COLORES_PARTIDO['UNIDOS POR TARIJA'] },
    '907': { sigla: 'CREEMOS', partido: NOMBRE_PARTIDO['CREEMOS'], gobernador: 'Luis Fernando Camacho Vaca', porcentaje: 55.64, color: COLORES_PARTIDO['CREEMOS'] },
    '908': { sigla: 'MTS', partido: NOMBRE_PARTIDO['MTS'], gobernador: 'José Alejandro Unzueta Shiriqui', porcentaje: 41.79, color: COLORES_PARTIDO['MTS'] },
    '909': { sigla: 'MTS', partido: NOMBRE_PARTIDO['MTS'], gobernador: 'Regis Germán Richter Alencár', porcentaje: 54.69, color: COLORES_PARTIDO['MTS'] },
  },
}

// Nombres de departamentos por id_eta
const NOMBRE_DEPTO: Record<string, string> = {
  '901': 'Chuquisaca', '902': 'La Paz', '903': 'Cochabamba',
  '904': 'Oruro', '905': 'Potosí', '906': 'Tarija',
  '907': 'Santa Cruz', '908': 'Beni', '909': 'Pando',
}

// ─────────────────────────────────────────────────────────────────
//  Ray casting (GeoJSON usa [lng, lat])
// ─────────────────────────────────────────────────────────────────
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

function detectarDepto(lat: number, lng: number, geojson: FeatureCollection): Feature | null {
  return geojson.features.find((f) => {
    const g = f.geometry
    if (g.type === 'Polygon') return puntoEnAnillo(lat, lng, g.coordinates[0])
    if (g.type === 'MultiPolygon') return g.coordinates.some((p) => puntoEnAnillo(lat, lng, p[0]))
    return false
  }) ?? null
}

// ─────────────────────────────────────────────────────────────────
//  Click handler (dentro del MapContainer)
// ─────────────────────────────────────────────────────────────────
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) })
  return null
}

// ─────────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export default function MapaElecciones() {
  const centro: LatLngExpression = [-16.403839, -64.170288]
  const mapRef = useRef<L.Map | null>(null)
  const geoJSONRef = useRef<L.GeoJSON | null>(null)

  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [anio, setAnio] = useState<'2015' | '2021'>('2021')
  const [deptoActivo, setDeptoActivo] = useState<string | null>(null)

  // Carga el GeoJSON de Bolivia (departamentos GAD) desde la API del proyecto
  useEffect(() => {
    getDataGeneralFinal('GAD').then((data) => {
      setGeojson(data as FeatureCollection)
      setIsLoading(false)
    })
  }, [])

  // Cuando cambia el año, resetea selección
  useEffect(() => { setDeptoActivo(null) }, [anio])

  const resultados = RESULTADOS[anio]

  // ── Estilo de cada departamento según partido ganador
  const estiloFeature = useCallback(
    (feature?: Feature) => {
      const cod = String(feature?.properties?.c_ut_dep ?? '')
      const res = resultados[cod]
      const seleccionado = deptoActivo === cod
      return {
        color: '#ffffff',
        weight: seleccionado ? 3.5 : 1.5,
        fillColor: res?.color ?? '#888888',
        fillOpacity: seleccionado ? 0.92 : 0.72,
      }
    },
    [resultados, deptoActivo]
  )

  // ── Tooltip y hover por capa
  const onEachFeature = useCallback(
    (feature: Feature, layer: L.Layer) => {
      const cod = String(feature?.properties?.c_ut_dep ?? '')
      const res = resultados[cod]
      const nombre = NOMBRE_DEPTO[cod] ?? feature.properties?.nom_dpto ?? cod

      const tooltipHtml = res
        ? `<div style="font-family:sans-serif;font-size:13px;line-height:1.6;padding:2px 4px">
             <strong>${nombre}</strong><br/>
             <span style="color:${res.color};font-weight:bold">${res.sigla}</span>
             &nbsp;—&nbsp;${res.porcentaje}%<br/>
             <span style="font-size:11px;color:#555">${res.gobernador}</span>
           </div>`
        : nombre

      layer.bindTooltip(tooltipHtml, { sticky: true, opacity: 1 })

      layer.on({
        mouseover(e) {
          ; (e.target as L.Path).setStyle({ fillOpacity: 0.95, weight: 3 })
            ; (e.target as L.Path).bringToFront()
        },
        mouseout(e) {
          const sel = deptoActivo === cod
            ; (e.target as L.Path).setStyle({
              fillOpacity: sel ? 0.92 : 0.72,
              weight: sel ? 3.5 : 1.5,
            })
        },
      })
    },
    [resultados, deptoActivo]
  )

  // ── Click en el mapa
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (!geojson) return
      const feature = detectarDepto(lat, lng, geojson)
      const cod = feature ? String(feature.properties?.c_ut_dep ?? '') : null

      if (cod && resultados[cod]) {
        setDeptoActivo(cod)
        // Volar al departamento seleccionado
        if (mapRef.current && geoJSONRef.current) {
          geoJSONRef.current.eachLayer((l: any) => {
            if (String(l.feature?.properties?.c_ut_dep) === cod) {
              mapRef.current!.flyToBounds(l.getBounds(), { duration: 1, padding: [50, 50] })
            }
          })
        }
      } else {
        setDeptoActivo(null)
        mapRef.current?.flyTo(centro, 6, { duration: 1 })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geojson, resultados]
  )

  const deptoInfo = deptoActivo ? resultados[deptoActivo] : null

  // Partidos únicos para la leyenda
  const partidosEnMapa = Object.values(resultados).reduce<Record<string, string>>((acc, r) => {
    acc[r.sigla] = r.color
    return acc
  }, {})

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>

      {/* Título y selector de año */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Elecciones Subnacionales — Bolivia
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Partido ganador de Gobernación por departamento
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={anio}
          exclusive
          onChange={(_, v) => { if (v) setAnio(v) }}
          size="small"
        >
          <ToggleButton value="2015">2015</ToggleButton>
          <ToggleButton value="2021">2021</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Panel del departamento seleccionado */}
      {deptoInfo && deptoActivo && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderLeft: `5px solid ${deptoInfo.color}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {NOMBRE_DEPTO[deptoActivo]}
            </Typography>
            <Typography variant="body2">{deptoInfo.gobernador}</Typography>
            <Typography variant="caption" color="text.secondary">
              {deptoInfo.partido}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={deptoInfo.sigla}
              sx={{ background: deptoInfo.color, color: '#fff', fontWeight: 700 }}
            />
            <Chip
              label={`${deptoInfo.porcentaje}%`}
              variant="outlined"
              size="small"
            />
            <Chip
              label="✕"
              size="small"
              variant="outlined"
              onClick={() => {
                setDeptoActivo(null)
                mapRef.current?.flyTo(centro, 6, { duration: 1 })
              }}
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Paper>
      )}

      {/* Mapa */}
      <Box sx={{ height: 560, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
        {isLoading ? (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <CircularProgress />
          </Box>
        ) : geojson && (
          <MapContainer
            ref={mapRef}
            center={centro}
            zoom={6}
            minZoom={5}
            scrollWheelZoom
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            />

            {/*
              key={anio + deptoActivo} fuerza re-render del GeoJSON
              cuando cambia el año o la selección, actualizando estilos.
              Mismo patrón que usa MapaGeneral con geoJSONRef.eachLayer().
            */}
            <GeoJSON
              key={`${anio}-${deptoActivo ?? 'none'}`}
              ref={geoJSONRef}
              data={geojson}
              style={estiloFeature}
              onEachFeature={onEachFeature}
            />

            {/* ClickHandler DENTRO del MapContainer — useMapEvents requiere esto */}
            <ClickHandler onMapClick={handleMapClick} />
          </MapContainer>
        )}
      </Box>

      {/* Leyenda de partidos */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="caption" fontWeight={700} display="block" mb={1}>
          Partidos ganadores — {anio}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {Object.entries(partidosEnMapa).map(([sigla, color]) => {
            // Contar cuántos departamentos ganó este partido
            const count = Object.values(resultados).filter(r => r.sigla === sigla).length
            return (
              <Chip
                key={sigla}
                label={`${sigla} (${count} ${count === 1 ? 'depto' : 'deptos'})`}
                size="small"
                sx={{ background: color, color: '#fff', fontWeight: 600, fontSize: 11 }}
              />
            )
          })}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Tabla resumen */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1 }}>
          {Object.entries(resultados).map(([cod, res]) => (
            <Box
              key={cod}
              onClick={() => {
                setDeptoActivo(cod)
                if (mapRef.current && geoJSONRef.current) {
                  geoJSONRef.current.eachLayer((l: any) => {
                    if (String(l.feature?.properties?.c_ut_dep) === cod) {
                      mapRef.current!.flyToBounds(l.getBounds(), { duration: 1, padding: [50, 50] })
                    }
                  })
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0.8,
                borderRadius: 1,
                cursor: 'pointer',
                border: `1px solid ${deptoActivo === cod ? res.color : 'transparent'}`,
                background: deptoActivo === cod ? `${res.color}18` : 'transparent',
                '&:hover': { background: `${res.color}12` },
              }}
            >
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: res.color, flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" fontWeight={700} display="block" noWrap>
                  {NOMBRE_DEPTO[cod]}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {res.sigla} — {res.gobernador} ({res.porcentaje}%)
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}