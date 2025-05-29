'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { isLowEndDevice } from '@/utils/deviceCapabilities'

// Importar dinámicamente ambas versiones
const FullVersion = dynamic(() => import('./full/page'), { ssr: false })
const LightVersion = dynamic(() => import('./light/page'), { ssr: false })

export default function InicioPage(): JSX.Element {
  const [isLowEnd, setIsLowEnd] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Detectar capacidades del dispositivo
    setIsLowEnd(isLowEndDevice())
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div>Cargando...</div>
      </div>
    )
  }

  return isLowEnd ? <LightVersion /> : <FullVersion />
}
