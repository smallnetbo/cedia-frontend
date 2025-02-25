import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L, { LatLngExpression } from 'leaflet'
import { Box, CircularProgress } from '@mui/material'
import { getDataGeneralFinal } from './api/apiMap'
import { tipoGobierno } from '@/types/map/entidad.interface'
import { FeatureCollection, Feature } from 'geojson'
import ReloadButton from './CenterButton'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import ReactDOMServer from 'react-dom/server'
import TooltipContent from './PopupContent'
import html2canvas from 'html2canvas'

const initialStyleMap = {
  color: '#50C0B2',
  weight: 2,
  opacity: 1,
  fillOpacity: 0.2,
}

interface SelectedEntidad {
  codigoEntidad: string
  nombre: string
  chartData: ChartData[]
  color: string
}

interface MapInerProps {
  typeVisualize: tipoGobierno
  switchEntidadesMap?: {
    [key: string]: {
      nameAgrupador: string
      entidades: SelectedEntidad[]
    }
  }
  onMapLoad?: (mapInstance: L.Map) => void
  onCapture?: (imageDataUrl: string) => void
}

const MapIner = ({
  typeVisualize,
  switchEntidadesMap = {},
  onMapLoad,
  onCapture,
}: MapInerProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const geoJSONRef = useRef<L.GeoJSON<
    FeatureCollection<GeoJSON.Geometry>
  > | null>(null)
  const mapData = useRef<FeatureCollection<GeoJSON.Geometry> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const position: LatLngExpression = [-16.403839, -64.170288]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const data = (await getDataGeneralFinal(
        typeVisualize
      )) as FeatureCollection<GeoJSON.Geometry>
      mapData.current = data

      if (geoJSONRef.current) {
        geoJSONRef.current.clearLayers()
        geoJSONRef.current.addData(data)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [typeVisualize])

  useEffect(() => {
    if (!isLoading && geoJSONRef.current !== null) {
      if (!mapData.current) return

      const data = mapData.current
      geoJSONRef.current.clearLayers()
      geoJSONRef.current.addData(data)

      const todasEntidadesSeleccionadas = Object.values(switchEntidadesMap)
        .flat()
        .map((group) => group.entidades)
        .flat()

      geoJSONRef.current.eachLayer((layer: L.Layer) => {
        const feature = (layer as L.GeoJSON).feature as Feature

        const entidadesSeleccionadas = todasEntidadesSeleccionadas.filter(
          (entidad) =>
            Number(feature?.properties?.c_ut_dep) ===
            Number(entidad.codigoEntidad)
        )

        if (entidadesSeleccionadas.length > 0) {
          entidadesSeleccionadas.forEach((entidad, index) => {
            const style = {
              color: entidad.color,
              opacity: 1,
              weight: 4 + index,
              dashArray: index % 2 === 0 ? '5,5' : '10,5',
            }

            const tooltipContent = ReactDOMServer.renderToString(
              <TooltipContent
                nombre={entidad.nombre}
                chartData={entidad.chartData}
              />
            )

            const customTooltip = L.tooltip({
              permanent: false,
              direction: 'auto',
              opacity: 1,
            }).setContent(tooltipContent)

            customTooltip.on('add', function () {
              const tooltipElement = customTooltip.getElement()
              if (tooltipElement) {
                tooltipElement.style.backgroundColor = entidad.color
                tooltipElement.style.color = '#fff'
                tooltipElement.style.borderRadius = '15px'
                tooltipElement.style.padding = '5px'
                tooltipElement.style.display = 'flex'
                tooltipElement.style.flexDirection = 'column'
                tooltipElement.style.alignItems = 'center'
              }
            })

            if (layer instanceof L.Path) {
              layer.setStyle(style)
              layer.bringToFront()
            }
            layer.bindTooltip(customTooltip)
          })
        }
      })

      if (mapRef.current) {
        mapRef.current.invalidateSize()
        setTimeout(() => {
          captureMapImage()
        }, 300)
      }
    }
  }, [switchEntidadesMap, isLoading])

  const captureMapImage = async () => {
    if (mapRef.current && onCapture) {
      const mapElement = document.querySelector(
        '.leaflet-container'
      ) as HTMLElement
      if (!mapElement) return

      setTimeout(async () => {
        try {
          const canvas = await html2canvas(mapElement, { useCORS: true })
          const imageDataUrl = canvas.toDataURL('image/png')
          onCapture(imageDataUrl)
        } catch (error) {
          console.error('Error capturando el mapa:', error)
        }
      }, 300)
    }
  }

  const handleReloadMap = () => {
    mapRef.current?.setView(position, 5)
  }

  return (
    <Box width="100%" height="100%">
      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      ) : (
        <MapContainer
          ref={(map) => {
            if (map) {
              mapRef.current = map
              if (onMapLoad) onMapLoad(map)
            }
          }}
          center={position}
          zoom={6}
          minZoom={5}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          touchZoom={false}
          style={{ width: '100%', height: '100%', zIndex: '0' }}
          renderer={L.canvas()}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            crossOrigin="anonymous"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          {mapData.current && (
            <GeoJSON
              ref={(el) => {
                geoJSONRef.current = el
              }}
              style={initialStyleMap}
              data={mapData.current}
            />
          )}

          <ReloadButton onClick={handleReloadMap} />
        </MapContainer>
      )}
    </Box>
  )
}

export default MapIner
