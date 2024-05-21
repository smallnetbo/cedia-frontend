import React from 'react'
import { Popup } from 'react-leaflet'

interface CustomPopupProps {
  position: L.LatLngExpression | null
  content: React.ReactNode // Cambiado a React.ReactNode para aceptar cualquier contenido de React
  className?: string
  style?: React.CSSProperties
}

const CustomPopup: React.FC<CustomPopupProps> = ({
  position,
  content,
  className,
  style,
}) => {
  return position !== null && content ? (
    <Popup position={position} className={className} style={style}>
      {content}
    </Popup>
  ) : null
}

export default CustomPopup
