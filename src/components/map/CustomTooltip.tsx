import React from 'react'
import { Popup } from 'react-leaflet'

interface CustomPopupProps {
  position: [number, number]
  content: React.ReactNode
}

const CustomPopup = ({ position, content }: CustomPopupProps) => (
  <Popup position={position}>{content} </Popup>
)

export default CustomPopup
