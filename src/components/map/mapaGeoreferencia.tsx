import React, { useEffect, useRef, useState } from 'react'
import { GeoJSON, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { ObjetoEntidad, initialStyleMap } from '@/types/map/map.interface'
import { tipoGobierno } from '@/types/map/entidad.interface'
import useMapContext from './useMapContext'
import { GeoJsonObject } from 'geojson'
import { MapBase } from './MapBase'
import L from 'leaflet'
import MapContextProvider from './MapContextProvider'
import { getDataGeneralFinal } from './api/apiMap'
import { styled } from '@mui/system'
import CustomTooltip from './CustomTooltip'

const StyledDiv = styled('div')`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 15px;
`

interface MapInnerInterface {
  typeVisualize: tipoGobierno
  selectedEntidades: number[]
}

const MapInner = ({ typeVisualize, selectedEntidades }: MapInnerInterface) => {
  const position: [number, number] = [-16.403839, -64.170288]
  const { map } = useMapContext()
  const [propertiesFeatures, setPropertiesFeatures] = useState<ObjetoEntidad[]>(
    []
  )
  const [tooltipPositions, setTooltipPositions] = useState<[number, number][]>(
    []
  )
  const geoJSONRef = useRef<L.GeoJSON<GeoJsonObject> | null>(null)
  const mapData = useRef<any>()

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDataGeneralFinal(typeVisualize)
      mapData.current = data
      const geoJSONLayer = geoJSONRef.current
      geoJSONLayer?.clearLayers()
      geoJSONLayer?.addData(data)
      setPropertiesFeatures([])
      setTooltipPositions([])
      map?.setView(position, 6, { animate: true })
    }

    fetchData()
  }, [typeVisualize])

  useEffect(() => {
    const fetchDataSelect = async () => {
      if (!mapData.current) {
        const data = await getDataGeneralFinal(typeVisualize)
        mapData.current = data
      }

      const data = mapData.current
      const geoJSONLayer = geoJSONRef.current
      geoJSONLayer?.clearLayers()
      geoJSONLayer?.addData(data)

      const selectedFeatures = data.features.filter((elem: any) =>
        selectedEntidades.includes(Number(elem.properties.c_ut_dep))
      )

      const positions: [number, number][] = []
      const properties: ObjetoEntidad[] = []

      selectedFeatures.forEach((selectedFeature: any) => {
        try {
          const bounds = L.geoJSON(selectedFeature).getBounds()
          const center = bounds.getCenter()
          positions.push([center.lat, center.lng])
          properties.push(selectedFeature.properties)

          const selectedStyle = {
            color: '#F79A38',
          }

          L.geoJSON(selectedFeature, {
            style: selectedStyle,
          }).addTo(geoJSONLayer)
        } catch (error) {
          console.error(
            'Error getting center for feature',
            selectedFeature,
            error
          )
        }
      })

      setTooltipPositions(positions)
      setPropertiesFeatures(properties)
    }

    fetchDataSelect()
  }, [selectedEntidades, typeVisualize])

  return (
    <StyledDiv>
      <MapBase center={position} zoom={5} minZoom={5}>
        <GeoJSON
          ref={geoJSONRef}
          style={initialStyleMap}
          data={mapData.current}
        />
        <>
          {propertiesFeatures.map((feature, index) => (
            <CustomTooltip
              key={index}
              position={tooltipPositions[index]}
              content={<div>{feature.nom_dpto}</div>}
            />
          ))}
        </>
      </MapBase>
    </StyledDiv>
  )
}

interface MapInterface {
  typeVisualize: tipoGobierno
  selectedEntidades: number[]
}

const MapGeoreferencia = ({
  typeVisualize,
  selectedEntidades,
}: MapInterface) => (
  <MapContextProvider>
    <MapInner
      typeVisualize={typeVisualize}
      selectedEntidades={selectedEntidades}
    />
  </MapContextProvider>
)

export default MapGeoreferencia
