import React from 'react'
import Grid from '@mui/material/Grid'

import { Paper, styled, Typography } from '@mui/material'
import { CustomSwitch } from '@/components/botones/CustomSwitch'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

const itemsData = [
  {
    id: '1',
    titulo: 'Recursos 1',
    desactivado: true,
    marcado: false,
  },
  {
    id: '2',
    titulo: 'Recursos 2',
    desactivado: false,
    marcado: true,
  },
]
const Sector = () => {
  return (
    <>
      <Typography variant={'caption'}>
        Seleccione hasta 4 variables para su visualización
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        {/* Primer grid con altura definida y scroll */}

        <Grid
          item
          xs={12}
          md={12}
          lg={4}
          xl={3}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Item elevation={4} style={{ height: '600px', width: '100%' }}>
            <Typography
              variant="h6"
              style={{
                backgroundColor: '#50C0B2',
                padding: '8px',
                color: 'white',
                textAlign: 'center',
              }}
            >
              Recursos
            </Typography>
          </Item>
        </Grid>

        {/* Segundo grid */}
        <Grid item xs={12} md={12} lg={8} xl={9}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '300px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                xs=4
              </Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '300px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                xs=4
              </Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '300px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                xs=4
              </Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '300px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                xs=4
              </Item>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default Sector
