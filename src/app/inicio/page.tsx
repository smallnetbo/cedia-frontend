import Box from '@mui/material/Box'
import { Grid } from '@mui/material'
import MenuPrincipal from './ui/menuPrincipal'

export default function InicioPage() {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: '80vh' }}
    >
      <Grid item xs={12}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <MenuPrincipal />
        </Box>
      </Grid>
    </Grid>
  )
}
