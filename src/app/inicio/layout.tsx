import React, { ReactNode, Suspense } from 'react'
import { Constantes } from '@/config/Constantes'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import { FullScreenLoading } from '@/components/progreso/FullScreenLoading'

import { NavbarInicial } from '@/components/navbars/NavBarInicial'
import FooterInicio from '@/components/footer/footerInicio'

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
        backgroundColor: '#FFFFFF',
      }}
    >
      <NavbarInicial />
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        <Toolbar />
        <Suspense fallback={<FullScreenLoading mensaje={'Cargando...'} />}>
          {children}
        </Suspense>
      </Box>
      <FooterInicio />
    </Box>
  )
}
