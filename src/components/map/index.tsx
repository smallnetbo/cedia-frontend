import React, { useEffect, useRef, useState } from 'react'
import { GeoJSON, Tooltip } from 'react-leaflet'
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
}

const MapInner = ({
  clickFeature,
  typeVisualize,
  selectedEntidad,
  selectedEntidad2,
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
  const [tooltipPosition, setTooltipPosition] = useState<{
    latlng: LatLngExpression
    content: string
  } | null>(null)

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
  }, [typeVisualize])

  // Efecto para manejar la selección de una entidad
  useEffect(() => {
    const fetchDataSelect = async () => {
      if (
        !isLoading &&
        (selectedEntidad !== 0 || selectedEntidad2 !== 0) &&
        geoJSONRef.current !== null
      ) {
        const geoJSONLayer = geoJSONRef.current
        const data = await getDataGeneralFinal(typeVisualize)
        mapData.current = data
        geoJSONLayer?.clearLayers()
        geoJSONLayer?.addData(data)

        const selectedFeatures = data.features.filter((elem: any) => {
          if (typeVisualize === 'GAD') {
            return (
              Number(elem.properties.c_ut_dep) === selectedEntidad ||
              Number(elem.properties.c_ut_dep) === selectedEntidad2
            )
          } else if (typeVisualize === 'GAM') {
            return (
              Number(elem.properties.codigomef) === selectedEntidad ||
              Number(elem.properties.codigomef) === selectedEntidad2
            )
          }
          return false
        })
        if (selectedFeatures.length > 0) {
          //const boundsArray = []
          selectedFeatures.forEach((feature: any) => {
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

            //boundsArray.push(L.geoJSON(feature.geometry).getBounds())
          })

          const bounds = L.geoJSON(
            selectedFeatures.map((f) => f.geometry)
          ).getBounds()
          map?.flyToBounds(bounds, { duration: 1, animate: true })

          setPropertiesFeature(selectedFeatures.map((f) => f.properties))
          // Unir todos los límites para ajustar la vista del mapa
          // const combinedBounds = boundsArray.reduce(
          //   (acc, bounds) => acc.extend(bounds),
          //   L.latLngBounds([])
          // )
          // map?.flyToBounds(combinedBounds, { duration: 2, animate: true })

          //setPropertiesFeature(selectedFeatures.map((f) => f.properties))
        }
      }
    }
    fetchDataSelect()
  }, [selectedEntidad, selectedEntidad2])

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
          <Tooltip position={tooltipPosition?.latlng}>
            {tooltipPosition?.content}
          </Tooltip>
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
}

const Map = ({
  clickFeature,
  enabledMinMap,
  typeVisualize,
  selectedEntidad,
  selectedEntidad2,
}: MapInterface) => (
  <MapContextProvider>
    <MapInner
      clickFeature={clickFeature}
      typeVisualize={typeVisualize}
      selectedEntidad={selectedEntidad}
      selectedEntidad2={selectedEntidad2}
    />
  </MapContextProvider>
)

export default Map
