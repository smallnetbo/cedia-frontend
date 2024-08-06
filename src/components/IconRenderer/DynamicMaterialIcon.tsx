import React, { useEffect, useState, ComponentType } from 'react'
import { Svg, Path } from '@react-pdf/renderer'
import ReactDOMServer from 'react-dom/server'

interface DynamicMaterialIconProps {
  iconName: string
  style?: React.CSSProperties
}

const DynamicMaterialIcon: React.FC<DynamicMaterialIconProps> = ({
  iconName,
  style = {},
}) => {
  const [IconComponent, setIconComponent] = useState<ComponentType | null>(null)

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const iconModule = await import('@mui/icons-material')
        const Icon = iconModule[iconName as keyof typeof iconModule] as
          | ComponentType
          | undefined
        if (Icon) {
          setIconComponent(() => Icon)
        } else {
          console.warn(`Icon ${iconName} not found.`)
          setIconComponent(null)
        }
      } catch (error) {
        console.warn(`Failed to load icon ${iconName}:`, error)
        setIconComponent(null)
      }
    }

    loadIcon()
  }, [iconName])

  if (!IconComponent) {
    return null
  }

  const svgMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent)
  )

  const svgContent = svgMarkup.match(/<svg[^>]*>(.*?)<\/svg>/s)?.[1]
  if (!svgContent) {
    console.warn(`SVG content for ${iconName} not found.`)
    return null
  }

  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(
    `<svg>${svgContent}</svg>`,
    'image/svg+xml'
  )
  const paths = svgDoc.querySelectorAll('path')
  const viewBox =
    svgDoc.querySelector('svg')?.getAttribute('viewBox') || '0 0 24 24'

  return (
    <Svg viewBox={viewBox} style={{ width: style.width, height: style.height }}>
      {Array.from(paths).map((path, index) => (
        <Path
          key={index}
          d={path.getAttribute('d') || ''}
          fill={style.color || 'currentColor'}
        />
      ))}
    </Svg>
  )
}

export default DynamicMaterialIcon
