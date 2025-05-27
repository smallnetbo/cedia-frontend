import React, { ReactNode, Suspense } from 'react'
import { Constantes } from '@/config/Constantes'
import { FullScreenLoading } from '@/components/progreso/FullScreenLoading'

export const metadata = {
  title: Constantes.siteName,
}

export default function InicioLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<FullScreenLoading mensaje={'Cargando...'} />}>
      {children}
    </Suspense>
  )
}
