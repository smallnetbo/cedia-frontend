import { orange } from '@mui/material/colors'
import { useEventHandlers } from '@react-leaflet/core'
import { Map } from 'leaflet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvent,
} from 'react-leaflet'

// Clases utilizadas por Leaflet para posicionar controles
const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right',
}

const BOUNDS_STYLE = { weight: 1, color: 'orange' }

const MinimapBounds = ({
  parentMap,
  zoom,
}: {
  parentMap: Map
  zoom: number
}) => {
  const minimap = useMap()

  // Al hacer clic en un punto del minimapa se establece el centro del mapa principal
  const onClick = useCallback(
    (e: any) => {
      parentMap.setView(e.latlng, parentMap.getZoom())
    },
    [parentMap]
  )
  useMapEvent('click', onClick)

  // Realizar un seguimiento de los límites en el estado para activar renderizados
  const [bounds, setBounds] = useState(parentMap.getBounds())
  const onChange = useCallback(() => {
    setBounds(parentMap.getBounds())
    // Actualiza la vista del minimapa para que coincida con el centro y el zoom del mapa principal
    minimap.setView(parentMap.getCenter(), zoom)
  }, [minimap, parentMap, zoom])

  // Escuchar eventos en el mapa principal
  const handlers = useMemo(() => ({ move: onChange, zoom: onChange }), [])
  useEventHandlers(
    { instance: parentMap, context: { __version: 1, map: parentMap } },
    handlers
  )

  return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />
}

const MinimapControl = ({
  position,
  zoom,
  width,
  height,
}: {
  position: string
  zoom: number
  width: number
  height: number
}) => {
  const parentMap = useMap()
  let mapZoom = zoom || 0
  let boxHeight = height
  let boxWidth = width

  useEffect(() => {
    mapZoom = zoom
    boxHeight = height
    boxWidth = width
  }, [height, width, zoom])

  // Memoriza el minimapa para que no se vea afectado por los cambios de posición
  const minimap = useMemo(
    () => (
      <MapContainer
        style={{ height: boxHeight, width: boxWidth }}
        center={parentMap.getCenter()}
        zoom={mapZoom}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MinimapBounds parentMap={parentMap} zoom={mapZoom} />
      </MapContainer>
    ),
    [height, width, zoom]
  )
  const positionClass =
    POSITION_CLASSES[position as keyof typeof POSITION_CLASSES] ||
    POSITION_CLASSES.topright

  return (
    <div className={positionClass}>
      <div className="leaflet-control leaflet-bar">{minimap}</div>
    </div>
  )
}

export default MinimapControl
