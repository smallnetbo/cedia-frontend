import React, { useCallback, useState } from 'react'
import { Button, IconButton } from '@mui/material'
import { useMap } from 'react-leaflet'

interface CenterButtonProps {
  initialCenter: [number, number]
  initialZoom: number
}

const CenterButton: React.FC<CenterButtonProps> = ({
  initialCenter,
  initialZoom,
}) => {
  const [isTouched, setIsTouched] = useState(false)
  const map = useMap()

  const handleMove = useCallback(() => {
    if (!isTouched && map) {
      setIsTouched(true)
    }
  }, [isTouched, map])

  map.on('move', handleMove)

  const handleClick = useCallback(() => {
    if (!isTouched || !map) return

    map.setView(initialCenter, initialZoom)

    map.flyTo(initialCenter, initialZoom)
    map.once('moveend', () => {
      setIsTouched(false)
    })
  }, [initialCenter, initialZoom, isTouched, map])

  return (
    <Button
      variant="outlined"
      onClick={handleClick}
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
