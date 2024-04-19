import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
  useMapEvent,
  Rectangle,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  departamentosGeneral,
  getData,
  initialStyleMap,
  municipiosGeneral,
  ObjetoEntidad,
} from '@/types/map/map.interface'
import CenterButton from './CenterButton'
import { tipoGobierno } from '@/types/map/entidad.interface'
import useMapContext from './useMapContext'
import useLeafletWindow from './useLeafletWindow'
import { useResizeDetector } from 'react-resize-detector'
import { useEventHandlers } from '@react-leaflet/core'
import { GeoJsonObject } from 'geojson'
import { MapBase } from './MapBase'
import { VerEnMapa } from './VerEnMapa'
import HoverCard from './HoverCard'
import { LatLngBounds, LatLngExpression } from 'leaflet'
import MapContextProvider from './MapContextProvider'

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
  const position: LatLngExpression = [-16.4038309, -64.170288]
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

  //const isLoading = !map || !leafletWindow || !viewportWidth || !viewportHeight

  const [propertiesFeature, setPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)
  const [hoverPropertiesFeature, setHoverPropertiesFeature] =
    useState<ObjetoEntidad | null>(null)

  const geoJSONRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null)
  const data = useRef<any>(getData(typeVisualize))
  const municipioStateRef = useRef<boolean>(false)
  const updatedTypeVisualize = useRef<tipoGobierno>(typeVisualize)

  const handleResetInReturn = () => {
    updatedTypeVisualize.current = typeVisualize
    if (updatedTypeVisualize.current === 'GAM') {
      data.current = getData('GAD')
      municipioStateRef.current = true
    } else {
      data.current = getData(typeVisualize)
    }
    const geoJSONLayer = geoJSONRef.current
    geoJSONLayer?.clearLayers()
    geoJSONLayer?.addData(data.current)
    setPropertiesFeature(null)
  }

  useEffect(() => {
    updatedTypeVisualize.current = typeVisualize
    if (updatedTypeVisualize.current === 'GAM') {
      data.current = getData('GAD')
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

  useEffect(() => {
    if (
      /*!isLoading &&*/ selectedEntidad !== 0 &&
      geoJSONRef.current !== null
    ) {
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
      /*if (typeVisualize === 'GAR') {
        gar2.features.map((elem: any) => {
          if (Number(elem.properties.codigomef) === selectedEntidad) {
            setPropertiesFeature(elem.properties);
            const bounds = L.geoJSON(elem.geometry).getBounds();
            map.flyToBounds(bounds, {duration: 2});
            const style = {
              color: '#F79A38',
              opacity: 1,
              weight: 4,
            };
            L.geoJSON(elem, {
              style: style,
            })
              .addTo(geoJSONLayer)
              .bringToFront();
          }
        });
      }
      if (typeVisualize === 'GAIOC') {
        gaioc2.features.map((elem: any) => {
          if (Number(elem.properties.codigomef) === selectedEntidad) {
            setPropertiesFeature(elem.properties);
            const bounds = L.geoJSON(elem.geometry).getBounds();
            map.flyToBounds(bounds, {duration: 2});
            const style = {
              color: '#F79A38',
              opacity: 1,
              weight: 4,
            };
            L.geoJSON(elem, {
              style: style,
            })
              .addTo(geoJSONLayer)
              .bringToFront();
          }
        });
      }*/
    }
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
          }
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          /*
          if (
            updatedTypeVisualize.current === 'GAD' &&
            onClickFeature.current.idDepto !== feature.properties.c_ut_dep
          ) {
            const layer = e.target;
            layer.setStyle(initialStyleMap);
            setHoverPropertiesFeature(null);
          }
          if (
            (updatedTypeVisualize.current === 'GAM' ||
              updatedTypeVisualize.current === 'GAIOC' ||
              updatedTypeVisualize.current === 'GAR') &&
            onClickFeature.current.idMunicipio !== feature.properties.codigomef
          ) {
            const layer = e.target;
            layer.setStyle(initialStyleMap);
            setHoverPropertiesFeature(null);
          }
          */
          const layer = e.target
          layer.setStyle(initialStyleMap)
          setHoverPropertiesFeature(null)
        },
        click: (e: L.LeafletMouseEvent) => {
          if (!municipioStateRef.current) {
            clickFeature(feature.properties)
            setPropertiesFeature(feature.properties)
            /*
            onClickFeature.current =
              updatedTypeVisualize.current === 'GAM'
                ? {idDepto: '', idMunicipio: feature.properties.c_ut_dep}
                : {idMunicipio: '', idDepto: feature.properties.codigomef};
                */
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

  // Tal vez la solución es tomar en cuenta loading antes de map si es necesario revisar
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
    // window.addEventListener('resize', handleWindowResize);
    handleWindowResize()
  }, [, /*isLoading*/ map])

  return (
    <MapBase
      center={position}
      inertia={true}
      zoom={dynamicZoom.current}
      minZoom={dynamicZoom.current - 1}
      touchZoom={false}
      scrollWheelZoom={true}
      doubleClickZoom={false}
    >
      <GeoJSON
        ref={geoJSONRef}
        style={initialStyleMap}
        onEachFeature={onEachFeature}
        data={data.current}
      />

      <CenterButton
        center={position}
        zoom={dynamicZoom.current}
        onPersonalizedReset={handleResetInReturn}
      />
      <VerEnMapa center={position} zoom={dynamicZoom.current} />
    </MapBase>
  )
}

interface MapInnerMinifiedInterface {
  selectedEntidad: number
  typeVisualize: tipoGobierno
}

const MapInnerMinifed = ({
  selectedEntidad,
  typeVisualize,
}: MapInnerMinifiedInterface) => {
  const { setMap } = useMapContext()
  const position: LatLngExpression = [-16.403839, -64.170288]
  const boundsForEntity = useRef<LatLngBounds>()

  const dynamicZoom = useRef<number>(5)
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
  const geoJSONRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null)
  const data = useRef<any>(getData(typeVisualize))
  // const isLoading = !map || !leafletWindow || !viewportWidth || !viewportHeight

  // For autocomplete and list niveles
  useEffect(
    () => {
      if (
        /*!isLoading &&*/ selectedEntidad !== 0 &&
        geoJSONRef.current !== null
      ) {
        const geoJSONLayer = geoJSONRef.current
        data.current = getData(typeVisualize)
        geoJSONLayer?.clearLayers()
        geoJSONLayer?.addData(data.current)
        if (typeVisualize === 'GAD') {
          departamentosGeneral.features.map((elem: any) => {
            if (Number(elem.properties.c_ut_dep) === selectedEntidad) {
              const bounds = L.geoJSON(elem.geometry).getBounds()
              boundsForEntity.current = bounds
              // map?.fitBounds(bounds);
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
              const bounds = L.geoJSON(elem.geometry).getBounds()
              boundsForEntity.current = bounds
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
    },
    [
      /*isLoading*/
    ]
  )

  return (
    <MapContainer
      ref={(e) => setMap && setMap(e || undefined)}
      center={position}
      inertia={true}
      zoomControl={false}
      zoom={dynamicZoom.current}
      minZoom={dynamicZoom.current - 1}
      touchZoom={false}
      scrollWheelZoom={true}
      doubleClickZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <GeoJSON ref={geoJSONRef} style={initialStyleMap} data={data.current} />
    </MapContainer>
  )
}

interface MapInterface {
  enabledMinMap: boolean
  clickFeature?: Function
  typeVisualize: tipoGobierno
  selectedEntidad: number
}

const MyMap = ({
  clickFeature,
  enabledMinMap,
  typeVisualize,
  selectedEntidad,
}: MapInterface) => (
  <MapInner
    clickFeature={clickFeature}
    typeVisualize={typeVisualize}
    selectedEntidad={selectedEntidad}
  />
)

export default MyMap
