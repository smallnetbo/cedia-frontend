import React from 'react'
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

const options = [
  { value: 1, label: 'Opción 1' },
  { value: 2, label: 'Opción 2' },
  { value: 3, label: 'Opción 3' },
]

const SelectFiltros = ({ value }) => {
  const allOptions = [...options]
  if (value) {
    allOptions.push(...value)
  }

  return (
    <Grid container spacing={2}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Grid item xs={4} key={index}>
          <FormControl fullWidth>
            <InputLabel id={`select-label-${index}`}>Seleccionar</InputLabel>
            <Select
              value={value}
              label={`Seleccionar ${index + 1}`}
              variant="outlined"
            >
              {allOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      ))}
    </Grid>
  )
}

export default SelectFiltros
