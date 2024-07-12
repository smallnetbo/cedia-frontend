import React, { ReactNode, Suspense } from 'react'
import { Constantes } from '@/config/Constantes'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import { FullScreenLoading } from '@/components/progreso/FullScreenLoading'
import { NavbarGeneral } from '@/components/navbars/NavbarGeneral'

export const metadata = {
  title: Constantes.siteName,
}

export default function FichaSectorialLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
      }}
    >
      <NavbarGeneral />
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        <Toolbar />
        <Suspense fallback={<FullScreenLoading mensaje={'Cargando...'} />}>
          {children}
        </Suspense>
      </Box>
    </Box>
  )
}
