import React from 'react'
import { Popup } from 'react-leaflet'

interface CustomTooltipProps {
  position: [number, number]
  content: React.ReactNode
}

const CustomTooltip = ({ position, content }: CustomTooltipProps) => (
  <Popup position={position}>{content}</Popup>
)

export default CustomTooltip
