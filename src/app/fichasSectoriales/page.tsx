'use client'
import Box from '@mui/material/Box'
import { Grid } from '@mui/material'
import FichasSectoriales from './ui/fichaSectorial'
export default function FichaSectorialPage() {
  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item xs={12}>
        <Box justifyContent="flex-start" alignItems="center" width="100%">
          <FichasSectoriales />
        </Box>
      </Grid>
    </Grid>
  )
}
