import React from 'react'
import { AppBar, Toolbar, Typography, Grid, Box } from '@mui/material'
import Image from 'next/image'
import { Constantes } from '@/config/Constantes'
import { useRouter } from 'next/router'

const FooterInicio = () => {
  return (
    <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
      {/* Primer nivel de footer */}
      <Toolbar
        sx={{
          backgroundColor: '#555555',
          borderBottomLeftRadius: '15px',
          borderBottomRightRadius: '15px',
          height: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Contenedor del logo y el texto */}
        <Grid container alignItems="center" justifyContent="center" spacing={5}>
          {/* Imagen */}
          <Grid item>
            <Image
              src={`${Constantes.sitePath}/logo.png`}
              alt={''}
              width="120"
              height="120"
              style={{ maxWidth: '100%', height: 'auto' }}
              unoptimized
            />
          </Grid>
          {/* Texto */}
          <Grid item>
            <Grid container direction="column" spacing={1}>
              <Typography
                variant="body1"
                color="white"
                sx={{ textAlign: 'justify' }}
              >
                SERVICIO ESTATAL DE AUTONOMÍAS
              </Typography>
              <Typography
                variant="body2"
                color="white"
                sx={{ textAlign: 'justify' }}
              >
                Datos correspondientes
              </Typography>
              <Typography
                variant="caption"
                color="white"
                sx={{ textAlign: 'justify' }}
              >
                2240000 - 2798365
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>

      {/* Segundo nivel de footer */}
      <Toolbar
        sx={{
          backgroundColor: '#eeeeee',
          height: '100px',
        }}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          sx={{ flexGrow: 1 }}
        >
          <Image
            src={`${Constantes.sitePath}/ministerio_logo.png`}
            alt={''}
            width="180"
            height="180"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <Box sx={{ px: 0.5 }} />
        </Grid>
      </Toolbar>
    </AppBar>
  )
}

export default FooterInicio
