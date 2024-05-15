import { styled } from '@mui/system'
import { MapContainer, TileLayer } from 'react-leaflet'
import useMapContext from './useMapContext'
import { LatLngExpression, MapOptions } from 'leaflet'

const MapBaseContainer = styled(MapContainer)`
  &.leaflet-container {
    font-family: sans-serif;
    width: 100%;
    height: 100%;
    color: white;
    outline: 0;
  }
`

export const MapBase: React.FC<
  {
    center: LatLngExpression
    children: JSX.Element | JSX.Element[]
    zoom: number
  } & MapOptions
> = ({ center, children, zoom, ...options }) => {
  const { setMap } = useMapContext()

  return (
    <MapBaseContainer
      ref={(e) => setMap && setMap(e || undefined)}
      center={center}
      zoom={zoom}
      {...options}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapBaseContainer>
  )
}
