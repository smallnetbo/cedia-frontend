import React, { useEffect, useRef, useState } from 'react'
import { GeoJSON, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { initialStyleMap, ObjetoEntidad } from '@/types/map/map.interface'
import { Entidad, tipoGobierno } from '@/types/map/entidad.interface'
import useMapContext from './useMapContext'
import useLeafletWindow from './useLeafletWindow'
import { useResizeDetector } from 'react-resize-detector'
import { GeoJsonObject } from 'geojson'
import { MapBase } from './MapBase'
import L, { LatLngExpression } from 'leaflet'
import MinimapControl from './miniMap'
import HoverCard from './HoverCard'
import MapContextProvider from './MapContextProvider'
import { getDataGeneralFinal } from './api/apiMap'

interface MapInnerInterface {
  clickFeature: Function
  typeVisualize: tipoGobierno
  selectedEntidad: number
}

const MapInner = ({
  clickFeature,
  typeVisualize,
  selectedEntidad,
}: MapInnerInterface) => {
  const position: LatLngExpression = [-16.403839, -64.170288]
  const dynamicZoom = useRef<number>(5.3)
  const [dynamicZoomMinMap, setDynamicZoomMinMap] = useState<number>(3.5)
  const [sizeMinMap, setSizeMinMap] = useState<{
    height: number
    width: number
  }>({
    height: 160,
    width: 220,
  })

  const { map } = useMapContext()
  const leafletWindow = useLeafletWindow()
  const {
    width: viewportWidth,
    height: viewportHeight,
    ref: viewportRef,
  } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 200,
  })

  const isLoading = !map || !leafletWindow || !viewportWidth || !viewportHeight

  const [propertiesFeature, setPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)
  const [hoverPropertiesFeature, setHoverPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{
    latlng: LatLngExpression
    content: string
  } | null>(null)

  const geoJSONRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null)
  const mapData = useRef<any>()
  const municipioStateRef = useRef<boolean>(false)
  const updatedTypeVisualize = useRef<tipoGobierno>(typeVisualize)

  useEffect(() => {
    const fetchData = async () => {
      updatedTypeVisualize.current = typeVisualize
      const data = await getDataGeneralFinal(updatedTypeVisualize.current)
      mapData.current = data
      const geoJSONLayer = geoJSONRef.current
      geoJSONLayer?.clearLayers()
      geoJSONLayer?.addData(data)
      setPropertiesFeature(null)
      map?.setView(position, dynamicZoom.current)
    }

    fetchData()
  }, [typeVisualize])

  useEffect(() => {
    const fetchDataSelect = async () => {
      if (!isLoading && selectedEntidad !== 0 && geoJSONRef.current !== null) {
        const geoJSONLayer = geoJSONRef.current
        const data = await getDataGeneralFinal(typeVisualize)
        mapData.current = data
        geoJSONLayer?.clearLayers()
        geoJSONLayer?.addData(data)
        const feature = data.features.find((elem: any) => {
          if (typeVisualize === 'GAD') {
            return Number(elem.properties.c_ut_dep) === selectedEntidad
          } else if (typeVisualize === 'GAM') {
            return Number(elem.properties.codigomef) === selectedEntidad
          }
        })
        if (feature) {
          setPropertiesFeature(feature.properties)
          const bounds = L.geoJSON(feature.geometry).getBounds()
          map.flyToBounds(bounds, { duration: 2 })
          const style = {
            color: typeVisualize === 'GAD' ? '#FF9B3E' : '#F79A38',
            opacity: 1,
            weight: 4,
          }
          L.geoJSON(feature, {
            style: style,
          })
            .addTo(geoJSONLayer)
            .bringToFront()
        }
      }
    }
    fetchDataSelect()
  }, [selectedEntidad])

  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const layer = e.target
          layer.setStyle({
            color: '#F49A45',
          })
          layer.bringToFront()
          if (feature.properties !== hoverPropertiesFeature) {
            setHoverPropertiesFeature(feature.properties)
            setTooltipPosition({
              latlng: e.latlng,
              content: 'Datos: ' + JSON.stringify(feature.properties),
            })
          }
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          const layer = e.target
          layer.setStyle(initialStyleMap)
          setHoverPropertiesFeature(null)
          setTooltipPosition(null)
        },
        click: (e: L.LeafletMouseEvent) => {
          if (!municipioStateRef.current) {
            clickFeature(feature.properties)
            setPropertiesFeature(feature.properties)
          } else {
            const layerWithoutSelectedDepartment =
              mapData.current.features.filter((elemDepartment: any) => {
                return (
                  elemDepartment.properties.nom_dpto !==
                  feature.properties.nom_dpto
                )
              })
            const filteredByDepartment = mapData.current.features.filter(
              (elemFeature: any) => {
                return (
                  elemFeature.properties.nom_dpto ===
                  feature.properties.nom_dpto
                )
              }
            )
            const geoJSONLayer = geoJSONRef.current
            geoJSONLayer?.clearLayers()
            geoJSONLayer?.addData(layerWithoutSelectedDepartment)
            geoJSONLayer?.addData(filteredByDepartment)
            municipioStateRef.current = false
          }
          map?.flyToBounds(e.target.getBounds())
        },
      })
    }
  }

  const handleWindowResize = () => {
    const zoomLevel = window.innerWidth < 600 ? 5 : 5.4
    dynamicZoom.current = zoomLevel
    if (window.innerWidth > 600) {
      setDynamicZoomMinMap(4)
      setSizeMinMap({
        height: 170,
        width: 225,
      })
    }
    if (map) {
      map.setView(position, zoomLevel)
      map.setMinZoom(zoomLevel)
    }
  }

  useEffect(() => {
    handleWindowResize()
  }, [viewportWidth, viewportHeight])

  return (
    <div ref={viewportRef}>
      <div
        style={{
          width: viewportWidth ?? '100%',
          height: viewportHeight ?? '100%',
        }}
      >
        <MapBase
          center={position}
          inertia={true}
          zoom={dynamicZoom.current}
          minZoom={dynamicZoom.current - 1}
          touchZoom={false}
          scrollWheelZoom={true}
          doubleClickZoom={false}
        >
          {!isLoading ? (
            <GeoJSON
              ref={geoJSONRef}
              style={initialStyleMap}
              onEachFeature={onEachFeature}
              data={mapData.current}
            />
          ) : (
            <></>
          )}
          <MinimapControl
            position="topright"
            zoom={dynamicZoomMinMap}
            height={sizeMinMap.height}
            width={sizeMinMap.width}
          />
          <Tooltip position={tooltipPosition?.latlng}>
            {tooltipPosition?.content}
          </Tooltip>
        </MapBase>
      </div>
      {hoverPropertiesFeature !== null && (
        <HoverCard
          type={updatedTypeVisualize.current}
          hoverPropertiesFeature={hoverPropertiesFeature}
        />
      )}
    </div>
  )
}

interface MapInterface {
  enabledMinMap: boolean
  clickFeature: Function
  typeVisualize: tipoGobierno
  selectedEntidad: number
}

const Map = ({
  clickFeature,
  enabledMinMap,
  typeVisualize,
  selectedEntidad,
}: MapInterface) => (
  <MapContextProvider>
    <MapInner
      clickFeature={clickFeature}
      typeVisualize={typeVisualize}
      selectedEntidad={selectedEntidad}
    />
  </MapContextProvider>
)

export default Map
