import { useState, useEffect } from 'react'
import AnimatedSVG from './AnimatedSVG'

interface SVGConfig {
  file: string;
  colors: string[];
  opacity?: number;
  rotationSpeed?: number;
  moveXSpeed?: number;
  moveYSpeed?: number;
  floatHeight?: number;
  floatSpeed?: number;
  scale?: number;
  elements?: {
    [key: string]: {
      rotateSpeed?: number;
      colorSpeed?: number;
      scaleSpeed?: number;
    }
  }
}

interface LoadedSVG {
  file: string;
  opacity?: number;
  rotationSpeed?: number;
  moveXSpeed?: number;
  moveYSpeed?: number;
  floatHeight?: number;
  floatSpeed?: number;
  scale?: number;
  elements?: {
    [key: string]: {
      rotateSpeed?: number;
      colorSpeed?: number;
      scaleSpeed?: number;
    }
  };
  svgContent: string;
}

export default function SVGRenderer({ isLight }: { isLight?: boolean }) {
  const [svgs, setSvgs] = useState<LoadedSVG[]>([])

  useEffect(() => {
    const loadSVGs = async () => {
      try {
        const svgConfigs = [
          { 
            file: '/svg/holographic_shape_ring.svg',
            opacity: 0.77,
            rotationSpeed: 30
          },
          {
            file: '/svg/holographic_shape_circle.svg',
            opacity: 0.77,
            rotationSpeed: 40,
            scale: .61,
          },
          {
            file: '/svg/holographic_shape_orbits.svg',
            opacity: 0.48,
            rotationSpeed: -50,
            moveXSpeed: 0.2,
            scale: 1.77
          }
        ]

        const loadedSvgs = await Promise.all(
          svgConfigs.map(async (config) => {
            const response = await fetch(config.file) 
            if (!response.ok) {
              throw new Error(`No se puede obtener el svg ${config.file}: ${response.statusText}`);
            }
            const svgContent = await response.text();
            return { ...config, svgContent }
          })
        )

        setSvgs(loadedSvgs)
      } catch (error) {
        console.error("Error al cargar los svg", error)
      }
    }

    loadSVGs()
  }, [])

  const getColorsForIndex = (index: number) => {
    if (isLight) {
      if (index === 0) return ['#004D40', '#1B5E20', '#B71C1C']
      if (index === 1) return ['#1B5E20', '#B71C1C', '#004D40']
      return ['#B71C1C', '#004D40', '#1B5E20']
    } else {
      if (index === 0) return ['#84D8D3', '#D1E3A6', '#FACCA2']
      if (index === 1) return ['#D1E3A6', '#FACCA2', '#84D8D3']
      return ['#FACCA2', '#84D8D3', '#D1E3A6']
    }
  }

  return (
    <>
      {svgs.map((svg, index) => (
        <AnimatedSVG
          key={index}
          svgContent={svg.svgContent}
          colors={getColorsForIndex(index)}
          opacity={svg.opacity}
          rotationSpeed={svg.rotationSpeed}
          moveXSpeed={svg.moveXSpeed}
          moveYSpeed={svg.moveYSpeed}
          floatHeight={svg.floatHeight}
          floatSpeed={svg.floatSpeed}
          elementsConfig={svg.elements}
          scale={svg.scale}
        />
      ))}
    </>
  )
} 