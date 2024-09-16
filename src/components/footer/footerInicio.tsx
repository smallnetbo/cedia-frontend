import React from 'react'
import { AppBar, Toolbar, Typography, Grid, Box } from '@mui/material'
import Image from 'next/image'
import { Constantes } from '@/config/Constantes'

const FooterInicio = () => {
  return (
    <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar
        sx={{
          backgroundColor: '#555555',
          padding: '2px',
          height: 'auto',

          minHeight: { xs: '10px', sm: '50px' },
        }}
      >
        {/* Primer nivel del footer */}
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          sx={{ textAlign: 'center', padding: { xs: '3px', sm: '10px' } }}
        >
          {/* Contenido izquierdo (logo y texto) */}
          <Grid item xs={12} sm={6}>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >
              {/* Logo */}
              <Grid item>
                <Image
                  src={`${Constantes.sitePath}/logo.png`}
                  alt="Logo"
                  width={80}
                  height={80}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                  unoptimized
                />
              </Grid>
              {/* Contenido de texto */}
              <Grid item>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <Typography
                    variant="body1"
                    color="white"
                    sx={{
                      fontSize: { xs: '0.6rem', sm: '0.9rem' },
                    }}
                  >
                    SERVICIO ESTATAL DE AUTONOMÍAS
                  </Typography>
                  <Typography
                    variant="body2"
                    color="white"
                    sx={{
                      fontSize: { xs: '0.6rem', sm: '0.8rem' },
                    }}
                  >
                    Datos correspondientes
                  </Typography>
                  <Typography
                    variant="caption"
                    color="white"
                    sx={{
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                    }}
                  >
                    2240000 - 2798365
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
      {/* Segundo nivel del footer */}
      <Toolbar
        sx={{
          backgroundColor: '#eeeeee',
          minHeight: { xs: '30px', sm: '50px' },
          padding: { xs: '5px', sm: '10px' },
        }}
      >
        <Grid container alignItems="center" justifyContent="center">
          <Image
            src={`${Constantes.sitePath}/ministerio_logo.png`}
            alt="Ministerio Logo"
            width={180}
            height={180}
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </Grid>
      </Toolbar>
    </AppBar>
  )
}

export default FooterInicio
