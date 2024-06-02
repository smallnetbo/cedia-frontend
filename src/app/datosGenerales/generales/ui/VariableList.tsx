import React from 'react'
import { Grid, List, Typography, Box } from '@mui/material'
import VariableItem from './VariableItem'

interface VariableListProps {
  variable: {
    id: string
    nombre: string
    items: {
      id: string
      nombre: string
      icono: string
      color: string
      datoRegistro?: {
        nombre: string
        valor: any
      }
    }[]
  }
  totalVariables: number
}

const VariableList: React.FC<VariableListProps> = ({
  variable,
  totalVariables,
}) => {
  return (
    <Grid item xs={12} sx={{ marginBottom: '2px' }}>
      {totalVariables > 1 && (
        <Box sx={{ marginBottom: '2px' }}>
          <Typography
            variant="subtitle1"
            sx={{
              padding: '2px',
              color: 'black',
              textAlign: 'center',
            }}
          >
            {variable.nombre}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2} sx={{ backgroundColor: 'inherit' }}>
        {variable.items.map((item) => (
          <Grid item xs={12} sm={6} md={6} key={item.id}>
            <List sx={{ width: '100%' }}>
              <VariableItem item={item} />
            </List>
          </Grid>
        ))}
      </Grid>
    </Grid>
  )
}

export default VariableList
