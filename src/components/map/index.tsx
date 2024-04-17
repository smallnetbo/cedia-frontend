import React, { useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import MiniMap from './miniMap'
import { departamentosGeneral } from '@/types/map/map.interface'
import CenterButton from './CenterButton'
import { LatLngExpression } from 'leaflet'

const MyMap = () => {
  const initialCenter: [number, number] = [-16.403839, -64.170288]
  const initialZoom = 6

  const [dynamicZoomMinMap, setDynamicZoomMinMap] = useState<number>(3.5)
  const [sizeMinMap, setSizeMinMap] = useState<{
    height: number
    width: number
  }>({
    height: 160,
    width: 220,
  })
  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '650px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        data={departamentosGeneral}
        style={() => ({
          color: 'red', // Color del borde del polígono

          weight: 2, // Grosor del borde del polígono
        })}
      />
      <CenterButton initialCenter={initialCenter} initialZoom={initialZoom} />
      <MiniMap
        position="topright"
        zoom={dynamicZoomMinMap}
        height={sizeMinMap.height}
        width={sizeMinMap.width}
      />
    </MapContainer>
  )
}

export default MyMap
