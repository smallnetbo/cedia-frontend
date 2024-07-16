import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L, { LatLngExpression } from 'leaflet'
import { Box, CircularProgress } from '@mui/material'
import { getDataGeneralFinal } from './api/apiMap'
import { tipoGobierno } from '@/types/map/entidad.interface'
import { GeoJsonObject } from 'geojson'
import ReloadButton from './CenterButton'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import ReactDOMServer from 'react-dom/server'
import TooltipContent from './PopupContent'
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
  selectedEntidades?: SelectedEntidad[]
}

const MapIner = ({ typeVisualize, selectedEntidades = [] }: MapInerProps) => {
  const mapRef = useRef<L.Map | null>(null)
  const geoJSONRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null)
  const mapData = useRef<any>()
  const [isLoading, setIsLoading] = useState(true)
  const position: LatLngExpression = [-16.403839, -64.170288]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const data = await getDataGeneralFinal(typeVisualize)
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
      if (!mapData.current) {
        return
      }

      const data = mapData.current
      geoJSONRef.current.clearLayers()
      geoJSONRef.current.addData(data)

      if (selectedEntidades.length === 0) {
        return
      }

      const visualizationConfig = {
        GAD: {
          color: '#FF9B3E',
        },
        GAM: {
          color: '#F79A38',
        },
        GAR: {
          color: '#F7F338',
        },
        GAIOC: {
          color: '#38F738',
        },
      }

      const config = visualizationConfig[typeVisualize]

      selectedEntidades.forEach((entidad) => {
        const feature = data.features.find(
          (elem: any) =>
            Number(elem.properties.c_ut_dep) === Number(entidad.codigoEntidad)
        )

        if (feature) {
          const style = {
            color: config.color,
            opacity: 1,
            weight: 4,
          }
          const bounds = L.geoJSON(feature).getBounds()

          L.geoJSON(feature, {
            style: style,
          })
            .addTo(geoJSONRef.current!)
            .bringToFront()
            .bindTooltip(
              ReactDOMServer.renderToString(
                <TooltipContent
                  nombre={entidad.nombre}
                  chartData={entidad.chartData}
                  color={entidad.color}
                />
              ),
              {
                permanent: true,
                direction: 'left',
              }
            )
            .openTooltip()
        }
      })
    }
  }, [selectedEntidades, isLoading])

  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      layer.on({
        mouseover: (e: any) => {
          const layer = e.target
          layer.setStyle({
            color: '#F49A45',
          })
          layer.bringToFront()
        },
        mouseout: (e: any) => {
          const layer = e.target
          layer.setStyle(initialStyleMap)
        },
      })
    }
  }

  const handleReloadMap = () => {
    mapRef.current?.setView(position, 5)
  }

  return (
    <Box position="relative" width="100%" height="100%">
      {isLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      )}
      {!isLoading && (
        <MapContainer
          ref={mapRef}
          center={position}
          zoom={5}
          minZoom={4}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          touchZoom={false}
          style={{ width: '100%', height: '100%', zIndex: '0' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSON
            ref={geoJSONRef}
            style={initialStyleMap}
            onEachFeature={onEachFeature}
            data={mapData.current}
          />
          <ReloadButton onClick={handleReloadMap} />
        </MapContainer>
      )}
    </Box>
  )
}

export default MapIner
