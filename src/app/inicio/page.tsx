'use client'
import Box from '@mui/material/Box'
import { Grid } from '@mui/material'
import MenuPrincipal from './ui/menuPrincipal'

export default function InicioPage() {
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item xs={12}>
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          width="100%"
        >
          <MenuPrincipal />
        </Box>
      </Grid>
    </Grid>
  )
}
