'use client'
import { AppBar, Box, Toolbar, Typography } from '@mui/material'

import React from 'react'
import { useRouter } from 'next/navigation'
import Grid from '@mui/material/Grid'
import Image from 'next/image'
import { Constantes } from '@/config/Constantes'

export const NavbarGeneral = () => {
  const router = useRouter()

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center">
          <Grid
            container
            alignItems="center"
            flexDirection="row"
            justifyContent="flex-start"
            onClick={() => {
              router.replace('/login')
            }}
            sx={{ cursor: 'pointer' }}
          >
            <Image
              src={`${Constantes.sitePath}/ministerio_logo.png`}
              alt={''}
              width="180"
              height="180"
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
            <Box sx={{ px: 0.5 }} />
          </Grid>
        </Box>

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
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
            <Box sx={{ px: 0.5 }} />
          </Grid>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
