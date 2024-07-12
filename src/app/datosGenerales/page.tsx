import Box from '@mui/material/Box'
import { Grid } from '@mui/material'
import TabMenu from './ui/Principal'

export default function DatosGeneralesPage() {
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item xs={12}>
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          width="100%"
        >
          <TabMenu />
        </Box>
      </Grid>
    </Grid>
  )
}
