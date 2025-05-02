import { useState, useEffect } from 'react'
import AnimatedSVG from './AnimatedSVG'

interface SVGConfig {
  file: string;
  darkColors?: string[];
  lightColors?: string[];
  color?: string;
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
  colors: string[];
}

interface SVGRendererProps {
  activeIndex: number;
  svgOptions: { svg: string }[];
}

export default function SVGRenderer({ activeIndex, svgOptions }: SVGRendererProps) {
  const [svg, setSvg] = useState<LoadedSVG | null>(null)

  useEffect(() => {
    const loadSVG = async () => {
      try {
        const config = svgOptions[activeIndex];
        // Puedes personalizar los colores/animaciones por SVG aquí si lo deseas
        const response = await fetch(`/svg/${config.svg}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch ${config.svg}: ${response.statusText}`);
        }
        const svgContent = await response.text();
        // Colores fijos para todos los temas
        const colors = ['#84D8D3', '#D1E3A6', '#FACCA2'];
        setSvg({ file: config.svg, svgContent, colors });
      } catch (error) {
        setSvg(null);
      }
    }
    loadSVG();
  }, [activeIndex, svgOptions]);

  if (!svg) return null;
  return (
    <AnimatedSVG
      svgContent={svg.svgContent}
      colors={svg.colors}
    />
  )
} 