'use client'
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'

import Grid from '@mui/material/Grid'
import Image from 'next/image'
import { Constantes } from '@/config/Constantes'
import { useRouter } from 'next/navigation'

export const NavbarGeneral = () => {
  const router = useRouter()
  const [isLoading, setLoading] = useState(false)

  const handleNavigation = async (path) => {
    try {
      setLoading(true)
      await router.push(path)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Grid
            container
            alignItems="center"
            flexDirection="row"
            justifyContent="flex-start"
            onClick={() => {
              router.replace('/admin/home')
            }}
            sx={{ cursor: 'pointer' }}
          >
            <Image
              src={`${Constantes.sitePath}/logo_sea.gif`}
              alt={''}
              width="70"
              height="70"
              style={{ maxWidth: '100%', height: 'auto' }}
              unoptimized
            />
            <Box sx={{ px: 0.5 }} />
          </Grid>
        </Box>

        {/* Título */}
        <Grid
          item
          xs
          container
          alignItems="center"
          justifyContent="center"
          sx={{ flexGrow: 1 }}
        >
          <Typography
            variant="h1"
            component="h1"
            color="#304E66"
            align="center"
            sx={{
              fontSize: {
                xs: '14px',
                sm: '18px',
                md: '20px',
                lg: '28px',
                '2xl': '18px',
              },
              fontWeight: 'normal',
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Centro de{' '}
            <Typography
              variant="h1"
              component="span"
              color="#00AE98"
              sx={{
                fontSize: {
                  xs: '16px',
                  sm: '20px',
                  md: '24px',
                  lg: '38px',
                  '2xl': '32px',
                },
                fontWeight: 'bold',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Datos Autonómicos
            </Typography>
          </Typography>
        </Grid>

        {/* Botones */}
        <Stack direction="row" spacing={2}>
          {/* Botón de Inicio */}
          <Button
            onClick={() => {
              router.replace('/')
            }}
            size="small"
            variant="outlined"
            endIcon={<span className="material-icons">house</span>}
          >
            INICIO
          </Button>

          {/* Botón de Login */}
          <Button
            onClick={() => {
              handleNavigation('/login')
            }}
            size="small"
            variant="contained"
            sx={{ color: 'white' }}
            endIcon={<span className="material-icons">login</span>}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'LOGIN'
            )}
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
