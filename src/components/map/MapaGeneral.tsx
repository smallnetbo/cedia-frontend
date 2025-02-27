import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L, { LatLngExpression } from 'leaflet'
import { Box, CircularProgress } from '@mui/material'
import { getDataGeneralFinal } from './api/apiMap'
import { tipoGobierno } from '@/types/map/entidad.interface'
import { GeoJsonObject } from 'geojson'
import { ObjetoEntidad } from '@/types/map/map.interface'
import HoverCard from './HoverCard'
import ReloadButton from './CenterButton'

const initialStyleMap = {
  color: '#50C0B2',
  weight: 2,
  opacity: 1,
  fillOpacity: 0.2,
}

interface MapInnerInterface {
  clickFeature: Function
  typeVisualize: tipoGobierno
  selectedEntidad: number
  selectedEntidad2?: number
  selectedButton: string
}
const DynamicMap = ({
  clickFeature,
  typeVisualize,
  selectedEntidad,
  selectedEntidad2,
  selectedButton,
}: MapInnerInterface) => {
  const mapRef = useRef<L.Map | null>(null)
  const geoJSONRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null)
  const mapData = useRef<any>()

  const municipioStateRef = useRef<boolean>(false)
  const dynamicZoom = useRef<number>(5)
  const [isLoading, setIsLoading] = useState(true)

  const [, setPropertiesFeature] = useState<ObjetoEntidad | null>(null)
  const [hoverPropertiesFeature, setHoverPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)

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
      setPropertiesFeature(null)

      setIsLoading(false)
    }
    fetchData()
  }, [typeVisualize, selectedButton])

  useEffect(() => {
    const fetchDataSelect = async () => {
      if (
        !isLoading &&
        (selectedEntidad !== 0 || selectedEntidad2 !== 0) &&
        geoJSONRef.current !== null
      ) {
        if (!mapData.current) {
          const data = await getDataGeneralFinal(typeVisualize)
          mapData.current = data
        }

        const data = mapData.current
        geoJSONRef.current.clearLayers()
        geoJSONRef.current.addData(data)

        const visualizationConfig = {
          GAD: {
            filter: (elem: any) =>
              Number(elem.properties.c_ut_dep) === selectedEntidad ||
              Number(elem.properties.c_ut_dep) === selectedEntidad2,
            color: '#FF9B3E',
          },
          GAM: {
            filter: (elem: any) =>
              Number(elem.properties.c_ut_dep) === selectedEntidad ||
              Number(elem.properties.c_ut_dep) === selectedEntidad2,
            color: '#F79A38',
          },
          GAR: {
            filter: (elem: any) =>
              Number(elem.properties.c_ut_dep) === selectedEntidad ||
              Number(elem.properties.c_ut_dep) === selectedEntidad2,
            color: '#F7F338',
          },
          GAIOC: {
            filter: (elem: any) =>
              Number(elem.properties.c_ut_dep) === selectedEntidad ||
              Number(elem.properties.c_ut_dep) === selectedEntidad2,
            color: '#38F738',
          },
        }

        const config = visualizationConfig[typeVisualize]

        const selectedFeatures = data.features.filter(config.filter)

        selectedFeatures.forEach((feature: any) => {
          const style = {
            color: config.color,
            opacity: 1,
            weight: 4,
          }
          L.geoJSON(feature, {
            style: style,
          })
            .addTo(geoJSONRef.current!)
            .bringToFront()
        })

        if (selectedFeatures.length > 0) {
          const bounds = L.geoJSON(
            selectedFeatures.map((f: any) => f.geometry)
          ).getBounds()
          mapRef.current?.flyToBounds(bounds, { duration: 2, animate: true })

          setPropertiesFeature(selectedFeatures.map((f: any) => f.properties))
        }
      }
    }
    fetchDataSelect()
  }, [selectedEntidad, selectedEntidad2, typeVisualize, isLoading])

  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      const entidad = feature.properties.nom_dpto
      layer.bindTooltip(entidad)
      layer.on({
        mouseover: (e: any) => {
          const layer = e.target
          layer.setStyle({
            color: '#F49A45',
          })
          layer.bringToFront()
          if (feature.properties !== hoverPropertiesFeature) {
            setHoverPropertiesFeature(feature.properties)
          }
        },
        mouseout: (e: any) => {
          const layer = e.target
          layer.setStyle(initialStyleMap)
          setHoverPropertiesFeature(null)
        },
        click: (e: any) => {
          e.originalEvent.preventDefault()
          e.originalEvent.stopPropagation()
          if (!municipioStateRef.current) {
            clickFeature(feature.properties)
            setPropertiesFeature(feature.properties)
            mapRef.current?.flyToBounds(e.target.getBounds(), { animate: true })
          } else {
            const layerWithoutSelectedDepartment =
              mapData.current.features.filter(
                (elemDepartment: any) =>
                  elemDepartment.properties.nom_dpto !==
                  feature.properties.nom_dpto
              )
            const filteredByDepartment = mapData.current.features.filter(
              (elemFeature: any) =>
                elemFeature.properties.nom_dpto === feature.properties.nom_dpto
            )
            geoJSONRef.current?.clearLayers()
            geoJSONRef.current?.addData(layerWithoutSelectedDepartment)
            geoJSONRef.current?.addData(filteredByDepartment)
            municipioStateRef.current = false
          }
        },
      })
    }
  }
  const handleReloadMap = () => {
    mapRef.current?.setView(position, dynamicZoom.current)
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
          zoom={dynamicZoom.current}
          minZoom={dynamicZoom.current - 1}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          touchZoom={false}
          style={{ width: '100%', height: '100%', zIndex: '0' }}
          //whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
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
      {hoverPropertiesFeature !== null && (
        <HoverCard
          type={typeVisualize}
          hoverPropertiesFeature={hoverPropertiesFeature}
        />
      )}
    </Box>
  )
}

export default DynamicMap
