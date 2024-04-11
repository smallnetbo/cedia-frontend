import React from 'react'
import { AppBar, Toolbar, Typography, Grid } from '@mui/material'

const Footer = () => {
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
          <Typography color="textSecondary" variant="subtitle1">
            {`Servicio Estatal de Autonomías ©${new Date().getFullYear()}`}
          </Typography>
        </Grid>
      </Toolbar>
    </AppBar>
  )
}

export default Footer
