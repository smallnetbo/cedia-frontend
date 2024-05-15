import React, { ReactNode, Suspense } from 'react'
import { Constantes } from '@/config/Constantes'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import { FullScreenLoading } from '@/components/progreso/FullScreenLoading'

import Footer from '@/components/footer/footer'
import { NavbarInicial } from '@/components/navbars/NavBarInicial'

export const metadata = {
  title: Constantes.siteName,
}

export default function InicioLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#F0F0F0',
      }}
    >
      <NavbarInicial />
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        <Toolbar />
        <Suspense fallback={<FullScreenLoading mensaje={'Cargando...'} />}>
          {children}
        </Suspense>
      </Box>
      <Footer />
    </Box>
  )
}
