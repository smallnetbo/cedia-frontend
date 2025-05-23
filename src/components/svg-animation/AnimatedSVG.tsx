import { motion } from 'framer-motion'
import styles from './AnimatedSVG.module.css' 
import { useEffect, useState } from 'react'

interface ElementConfig {
  rotateSpeed?: number;
  colorSpeed?: number;
  scaleSpeed?: number;
}

interface AnimatedSVGProps {
  svgContent: string;
  colors?: string[];
  opacity?: number;
  rotationSpeed?: number;
  moveXSpeed?: number;
  moveYSpeed?: number;
  floatHeight?: number;
  floatSpeed?: number;
  elementsConfig?: {
    [key: string]: ElementConfig;
  };
  scale?: number;
}

export default function AnimatedSVG({ 
  svgContent, 
  colors = ['#84D8D3', '#D1E3A6', '#FACCA2'], 
  opacity = 1,
  rotationSpeed = 20, 
  moveXSpeed = 0,
  moveYSpeed = 0,
  floatHeight = 0,
  floatSpeed = 1,
  elementsConfig = {},
  scale = 1
}: AnimatedSVGProps) {
  const [currentColors, setCurrentColors] = useState<string[]>(colors)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColors(prev => {
        const newColors = [...prev]
        newColors.unshift(newColors.pop() as string)
        return newColors
      })
    }, 10000) // cambia de color cada 10 segundos
    return () => clearInterval(interval)
  }, [])

  const groupAnimation = {
    rotate: rotationSpeed ? [0, rotationSpeed > 0 ? 360 : -360] : undefined,
    x: moveXSpeed ? [0, 10 * moveXSpeed, 0] : undefined, 
    y: moveYSpeed ? [0, 10 * moveYSpeed, 0] : floatHeight ? [0, floatHeight * 5, 0] : undefined,
    scale:[scale, scale * 1.1, scale],
    //scale: scale,
    transition: {
      duration: rotationSpeed  ? Math.abs(rotationSpeed) : 20, 
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: 'linear'
    }
  }

  const processedSVG = elementsConfig 
    ? Object.keys(elementsConfig).reduce((acc, elementId) => {
        const config = elementsConfig[elementId];
        const rotateSpeedValue = config?.rotateSpeed || 20;
        const colorSpeedValue = config?.colorSpeed || 15;
        
        return acc.replace(
          new RegExp(`id="${elementId}"`, 'g'),
          `id="${elementId}" class="${styles.animatedElement}" style="
            --rotate-speed:${rotateSpeedValue}s;
            --color-speed:${colorSpeedValue}s;
            --color-start:${currentColors[0]};
            --color-mid:${currentColors[1]};
            --color-end:${currentColors[2]};
          "`
        )
      }, svgContent)
    : svgContent

  return (
    <motion.div 
      className={styles.svgContainer}
      style={{ 
        filter: `drop-shadow(0 0 5px ${currentColors[1]})`,
        opacity,
        transformOrigin: 'center center',
        color: currentColors[0]
      }}
      animate={groupAnimation}
    >
      <div 
        className={styles.svgWrapper}
        dangerouslySetInnerHTML={{ __html: processedSVG }} 
      />
    </motion.div>
  )
} 