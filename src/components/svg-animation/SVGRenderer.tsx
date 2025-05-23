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

interface LoadedSVG extends SVGConfig {
  svgContent: string;
}

export default function SVGRenderer() {
  const [svgs, setSvgs] = useState<LoadedSVG[]>([])

  useEffect(() => {
    const loadSVGs = async () => {
      try {
        const svgConfigs: SVGConfig[] = [
          { 
            file: '/svg/holographic_shape_ring.svg',
            colors: ['#84D8D3', '#D1E3A6', '#FACCA2'],
            opacity: 0.77,
            rotationSpeed: 30
          },
          {
            file: '/svg/holographic_shape_circle.svg',
            colors: ['#D1E3A6', '#FACCA2', '#84D8D3'],
            opacity: 0.77,
            rotationSpeed: 40,
            scale: .61,
            //moveYSpeed: 0.3
          },
          {
            file: '/svg/holographic_shape_orbits.svg',
            colors: ['#FACCA2', '#84D8D3', '#D1E3A6'],
            opacity: 0.48,
            rotationSpeed: -50,
            moveXSpeed: 0.2,
            scale: 1.77
            //moveYSpeed: -0.2
          }
        ]

        const loadedSvgs = await Promise.all(
          svgConfigs.map(async (config) => {
            const response = await fetch(config.file) 
            if (!response.ok) {
              throw new Error(`Failed to fetch ${config.file}: ${response.statusText}`);
            }
            const svgContent = await response.text();
            return { ...config, svgContent }
          })
        )

        setSvgs(loadedSvgs)
      } catch (error) {
        console.error("Error loading SVGs:", error)
      }
    }

    loadSVGs()
  }, [])

  return (
    <>
      {svgs.map((svg, index) => (
        <AnimatedSVG
          key={index}
          svgContent={svg.svgContent}
          colors={svg.colors}
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