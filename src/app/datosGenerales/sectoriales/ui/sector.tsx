import React from 'react'
import Grid from '@mui/material/Grid'

import { Paper, styled, Typography } from '@mui/material'

import ChartPie from '@/components/echarts/pie'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

const SectorComponent = () => {
  return (
    <>
      <Typography variant={'caption'}>
        Seleccione hasta 4 variables para su visualización
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        {/* Primer grid con altura definida y scroll */}

        <Grid item xs={12} md={12} lg={4} xl={3} overflow="auto" height={650}>
          <Item elevation={4} style={{ maxWidth: '100%' }}>
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
        <Grid item xs={12} md={12} lg={8} xl={9} overflow="auto" height={650}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '320px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                <ChartPie />
              </Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '320px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                xs=4
              </Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '320px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                xs=4
              </Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '320px' }}>
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

export default SectorComponent
