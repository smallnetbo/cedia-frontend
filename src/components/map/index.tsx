import React, { useEffect, useRef, useState } from 'react'
import { GeoJSON, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  departamentosGeneral,
  getData,
  initialStyleMap,
  municipiosGeneral,
  ObjetoEntidad,
} from '@/types/map/map.interface'
import { tipoGobierno } from '@/types/map/entidad.interface'
import useMapContext from './useMapContext'
import useLeafletWindow from './useLeafletWindow'
import { useResizeDetector } from 'react-resize-detector'
import { GeoJsonObject } from 'geojson'
import { MapBase } from './MapBase'
import L, { LatLngExpression } from 'leaflet'
import MinimapControl from './miniMap'
import HoverCard from './HoverCard'
import MapContextProvider from './MapContextProvider'

interface MapInnerInterface {
  clickFeature: Function
  typeVisualize: tipoGobierno
  selectedEntidad: number
}

// Componente para la visualización principal del mapa
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

  // Hooks personalizados
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

  //Propiedades de características
  const [propertiesFeature, setPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)
  const [hoverPropertiesFeature, setHoverPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)

  const [tooltipPosition, setTooltipPosition] = useState<{
    latlng: LatLngExpression
    content: string
  } | null>(null)

  // Referencia para capa GeoJSON
  const geoJSONRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null)
  const data = useRef<any>(getData(typeVisualize))
  const municipioStateRef = useRef<boolean>(false)
  const updatedTypeVisualize = useRef<tipoGobierno>(typeVisualize)

  // Efecto para actualizar los datos cuando cambia el tipo de visualización
  useEffect(() => {
    updatedTypeVisualize.current = typeVisualize
    if (updatedTypeVisualize.current === 'GAM') {
      data.current = getData('GAM')
      municipioStateRef.current = true
    } else {
      data.current = getData(typeVisualize)
    }
    const geoJSONLayer = geoJSONRef.current
    geoJSONLayer?.clearLayers()
    geoJSONLayer?.addData(data.current)
    setPropertiesFeature(null)
    map?.setView(position, dynamicZoom.current)
  }, [typeVisualize])

  // Efecto para cargar datos cuando cambia la entidad seleccionada
  useEffect(() => {
    if (!isLoading && selectedEntidad !== 0 && geoJSONRef.current !== null) {
      const geoJSONLayer = geoJSONRef.current
      data.current = getData(typeVisualize)
      geoJSONLayer?.clearLayers()
      geoJSONLayer?.addData(data.current)
      if (typeVisualize === 'GAD') {
        departamentosGeneral.features.map((elem: any) => {
          if (Number(elem.properties.c_ut_dep) === selectedEntidad) {
            setPropertiesFeature(elem.properties)
            const bounds = L.geoJSON(elem.geometry).getBounds()
            map.flyToBounds(bounds, { duration: 2 })
            const style = {
              color: '#FF9B3E',
              opacity: 1,
              weight: 4,
            }
            L.geoJSON(elem, {
              style: style,
            })
              .addTo(geoJSONLayer)
              .bringToFront()
          }
        })
      }
      if (typeVisualize === 'GAM') {
        municipiosGeneral.features.map((elem: any) => {
          if (Number(elem.properties.codigomef) === selectedEntidad) {
            setPropertiesFeature(elem.properties)
            const bounds = L.geoJSON(elem.geometry).getBounds()
            map.flyToBounds(bounds, { duration: 2 })
            const style = {
              color: '#F79A38',
              opacity: 1,
              weight: 4,
            }
            L.geoJSON(elem, {
              style: style,
            })
              .addTo(geoJSONLayer)
              .bringToFront()
          }
        })
      }
    }
  }, [selectedEntidad])

  // Función para manejar eventos en las características
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

            // Establecer el contenido y la posición del tooltip
            setTooltipPosition({
              latlng: e.latlng,
              //content: `Datos: ${feature.properties}`, // Aquí debes proporcionar el contenido adecuado para el tooltip
              content: 'hola mundo',
            })
          }
        },

        //cuando el mause sale del area
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
            const layerWithoutSelectedDepartment = data.current.features.filter(
              (elemDepartment: any) => {
                return (
                  elemDepartment.properties.nom_dpto !==
                  feature.properties.nom_dpto
                )
              }
            )
            data.current = getData('GAM')
            const geoJSONLayer = geoJSONRef.current

            const filteredByDepartment = data.current.features.filter(
              (elemFeature: any) => {
                return (
                  elemFeature.properties.nom_dpto ===
                  feature.properties.nom_dpto
                )
              }
            )
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

  // Efecto para manejar el cambio de tamaño de la ventana
  useEffect(() => {
    handleWindowResize()
  }, [isLoading, map])

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

  // Renderizado del componente
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
              data={data.current}
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
  clickFeature?: Function
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
