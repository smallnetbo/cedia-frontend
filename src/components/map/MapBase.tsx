import { LatLngExpression, MapOptions } from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import useMapContext from './useMapContext'

export const MapBase: React.FC<
  {
    center: LatLngExpression
    children: JSX.Element | JSX.Element[]
    zoom: number
  } & MapOptions
> = ({ ...options }) => {
  const { setMap } = useMapContext()

  return (
    <MapContainer
      ref={(e) => setMap && setMap(e || undefined)}
      {...options}
      style={{ width: '100%', height: '650px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {options.children}
    </MapContainer>
  )
}

/**
 *
 *         url="https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
 */
