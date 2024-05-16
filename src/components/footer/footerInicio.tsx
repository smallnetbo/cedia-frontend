import React from 'react'
import { AppBar, Toolbar, Typography, Grid, Box } from '@mui/material'
import Image from 'next/image'
import { Constantes } from '@/config/Constantes'
import { useRouter } from 'next/router'

const FooterInicio = () => {
  return (
    <AppBar
      position="fixed"
      sx={{ top: 'auto', bottom: 0, borderTop: '1px solid #ccc' }}
    >
      <Toolbar>
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
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
          <Box sx={{ px: 0.5 }} />
        </Grid>
      </Toolbar>
    </AppBar>
  )
}

export default FooterInicio
