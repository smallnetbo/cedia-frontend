import { LatLngExpression } from 'leaflet'

import { useCallback, useState } from 'react'
import { useMapEvents } from 'react-leaflet'

import useMapContext from './useMapContext'

interface CenterButtonProps {
  center: LatLngExpression
  zoom: number
}

export const VerEnMapa: React.FC<{
  center: CenterButtonProps['center']
  zoom: CenterButtonProps['zoom']
  onPersonalizedReset?: Function
}> = ({ center, zoom }: CenterButtonProps) => {
  const [isTouched, setIsTouched] = useState(false)
  const { map } = useMapContext()

  const touch = useCallback(() => {
    if (!isTouched && map) {
      setIsTouched(true)
    }
  }, [map])

  useMapEvents({
    move() {
      touch()
    },
    zoom() {
      touch()
    },
  })

  const handleClick = useCallback(() => {
    if (!isTouched || !map) return

    map.flyTo(center, zoom)
    map.once('moveend', () => {
      setIsTouched(false)
    })
  }, [map, isTouched, zoom, center])

  return (
    <button
      type="button"
      style={{ zIndex: 400 }}
      aria-label="Center zoom"
      className={`button absolute rounded top-20 border-2 border-[#AAAEB0] left-2 p-2 shadow-md bg-white ${
        isTouched ? 'text-dark' : 'text-light'
      } `}
      onClick={() => handleClick()}
    ></button>
  )
}
