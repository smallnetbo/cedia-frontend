/* mapa original */

import React, { useEffect, useRef, useState } from 'react'
import { GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { initialStyleMap, ObjetoEntidad } from '@/types/map/map.interface'
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
import { getDataGeneralFinal } from './api/apiMap'
import { styled } from '@mui/system'

interface MapContainerProps {
  isLoading?: number
}

const StyledDiv = styled('div')`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 15px;
`

const MapContainer = styled('div')<MapContainerProps>`
  position: absolute;
  z-index: 0;
  width: 100%;
  left: 0;
  transition: opacity 0.3s ease;
  opacity: ${({ isLoading }) => (isLoading ? 0 : 1)};
`

interface MapInnerInterface {
  clickFeature: Function
  typeVisualize: tipoGobierno
  selectedEntidad: number
  selectedEntidad2?: number
  selectedButton: string
}

const MapInner = ({
  clickFeature,
  typeVisualize,
  selectedEntidad,
  selectedEntidad2,
  selectedButton,
}: MapInnerInterface) => {
  const position: LatLngExpression = [-16.403839, -64.170288]
  const dynamicZoom = useRef<number>(6)
  const [dynamicZoomMinMap, setDynamicZoomMinMap] = useState<number>(3.5)
  const [sizeMinMap, setSizeMinMap] = useState<{
    height: number
    width: number
  }>({
    height: 160,
    width: 220,
  })

  // Obtiene el mapa y la ventana de Leaflet
  const { map } = useMapContext()
  const leafletWindow = useLeafletWindow()

  // Detectar el tamaño de la ventana
  const {
    width: viewportWidth,
    height: viewportHeight,
    ref: viewportRef,
  } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 200,
  })

  // Verificar si el mapa está cargando
  const isLoading = !map || !leafletWindow || !viewportWidth || !viewportHeight

  // Estados para características y propiedades del mapa
  const [propertiesFeature, setPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)
  const [hoverPropertiesFeature, setHoverPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)

  // Referencia al GeoJSON y a los datos del mapa
  const geoJSONRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null)
  const mapData = useRef<any>()
  const municipioStateRef = useRef<boolean>(false)
  const updatedTypeVisualize = useRef<tipoGobierno>(typeVisualize)

  // Efecto para cargar los datos iniciales del mapa
  useEffect(() => {
    const fetchData = async () => {
      updatedTypeVisualize.current = typeVisualize
      const data = await getDataGeneralFinal(updatedTypeVisualize.current)
      mapData.current = data
      const geoJSONLayer = geoJSONRef.current
      geoJSONLayer?.clearLayers()
      geoJSONLayer?.addData(data)
      setPropertiesFeature(null)
      map?.setView(position, dynamicZoom.current, { animate: true })
    }

    fetchData()
  }, [typeVisualize, selectedButton])

  // Efecto para manejar la selección de una entidad
  useEffect(() => {
    const fetchDataSelect = async () => {
      if (
        !isLoading &&
        (selectedEntidad !== 0 || selectedEntidad2 !== 0) &&
        geoJSONRef.current !== null
      ) {
        const geoJSONLayer = geoJSONRef.current

        // Obtener datos solo si no están en cache
        if (!mapData.current) {
          const data = await getDataGeneralFinal(typeVisualize)
          mapData.current = data
        }

        const data = mapData.current
        geoJSONLayer?.clearLayers()
        geoJSONLayer?.addData(data)

        // const data = await getDataGeneralFinal(typeVisualize)
        // mapData.current = data
        // geoJSONLayer?.clearLayers()
        // geoJSONLayer?.addData(data)

        // Objeto que mapea cada tipo de visualización a su función de filtro y color
        const visualizationConfig: Record<
          tipoGobierno,
          { filter: (elem: any) => boolean; color: string }
        > = {
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
          // Agrega configuraciones para otros tipos de gobierno según sea necesario
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
          // Agrega más configuraciones para otros tipos de gobierno según sea necesario
        }

        // Obtener la configuración según el tipo de visualización
        const config = visualizationConfig[typeVisualize]

        // Filtrar las características seleccionadas usando la función correspondiente
        const selectedFeatures = data.features.filter(config.filter)

        // Procesar las características seleccionadas
        selectedFeatures.forEach((feature: any) => {
          const style = {
            color: config.color,
            opacity: 1,
            weight: 4,
          }
          L.geoJSON(feature, {
            style: style,
          })
            .addTo(geoJSONLayer)
            .bringToFront()
        })

        // Ajustar el mapa según las características seleccionadas
        if (selectedFeatures.length > 0) {
          const bounds = L.geoJSON(
            selectedFeatures.map((f) => f.geometry)
          ).getBounds()
          map?.flyToBounds(bounds, { duration: 1, animate: true })

          setPropertiesFeature(selectedFeatures.map((f) => f.properties))
        }
      }
    }
    fetchDataSelect()
  }, [selectedEntidad, selectedEntidad2, typeVisualize, isLoading])

  // Función para manejar eventos en cada característica del mapa
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
          }
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          const layer = e.target
          layer.setStyle(initialStyleMap)
          setHoverPropertiesFeature(null)
        },
        click: (e: L.LeafletMouseEvent) => {
          if (!municipioStateRef.current) {
            clickFeature(feature.properties)
            setPropertiesFeature(feature.properties)
            map?.flyToBounds(e.target.getBounds(), { animate: true })
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
    <StyledDiv ref={viewportRef}>
      <MapContainer
        isLoading={isLoading ? 1 : 0}
        style={{
          width: viewportWidth || '100%',
          height: viewportHeight || '100%',
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
        </MapBase>
      </MapContainer>
      {hoverPropertiesFeature !== null && (
        <HoverCard
          type={updatedTypeVisualize.current}
          hoverPropertiesFeature={hoverPropertiesFeature}
        />
      )}
    </StyledDiv>
  )
}

interface MapInterface {
  enabledMinMap: boolean
  clickFeature: Function
  typeVisualize: tipoGobierno
  selectedEntidad: number
  selectedEntidad2?: number
  selectedButton: string
}

const Map = ({
  clickFeature,
  enabledMinMap,
  typeVisualize,
  selectedEntidad,
  selectedEntidad2,
  selectedButton,
}: MapInterface) => (
  <MapContextProvider>
    <MapInner
      clickFeature={clickFeature}
      typeVisualize={typeVisualize}
      selectedEntidad={selectedEntidad}
      selectedEntidad2={selectedEntidad2}
      selectedButton={selectedButton}
    />
  </MapContextProvider>
)

export default Map
