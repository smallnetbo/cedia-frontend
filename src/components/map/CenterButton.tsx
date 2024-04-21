import React, { useCallback, useState } from 'react'
import { Button, IconButton } from '@mui/material'
import { useMap, useMapEvents } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import useMapContext from './useMapContext'

interface CenterButtonProps {
  center: LatLngExpression
  zoom: number
  onPersonalizedReset?: Function
}

const CenterButton: React.FC<{
  center: CenterButtonProps['center']
  zoom: CenterButtonProps['zoom']
  onPersonalizedReset?: Function
}> = ({ center, zoom, onPersonalizedReset }: CenterButtonProps) => {
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

    if (onPersonalizedReset) {
      onPersonalizedReset()
    }
  }, [map, isTouched, zoom, center])

  return (
    <Button
      variant="outlined"
      onClick={() => handleClick()}
      style={{
        position: 'absolute',
        top: '73px',
        left: '2px',
        zIndex: 400,
        backgroundColor: 'white',
        borderRadius: '5px',
        padding: '8px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        fontWeight: 'bold',
        color: 'black',
        cursor: 'pointer',
        border: '1px solid #ccc',
        width: '40px',
        height: '33px',
      }}
    >
      <span className="material-icons">refresh</span>
    </Button>
  )
}

export default CenterButton
