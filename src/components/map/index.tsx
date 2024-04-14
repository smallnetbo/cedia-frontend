import React from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import MiniMap from './miniMap'
import { departamentosGeneral } from '@/types/map/map.interface'

const MyMap = () => {
  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '600px' }}
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
      <MiniMap />
    </MapContainer>
  )
}

export default MyMap
