import React, { useState } from 'react'
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  Autocomplete,
  TextField,
} from '@mui/material'
import { Gobiernos, gobiernos } from '@/types/map/entidad.interface'

const SelectFiltros = () => {
  const [selectedGobierno, setSelectedGobierno] = useState<Gobiernos>(
    gobiernos[0]
  )

  const handleChange = (event: SelectChangeEvent<typeof gobiernos>) => {
    const selectedId = event.target.value as string
    const selected = gobiernos.find((gobierno) => gobierno.id === selectedId)
    if (selected) {
      setSelectedGobierno(selected)
    }
  }

  const top100Films = [
    { label: 'The Shawshank Redemption', year: 1994 },
    { label: 'The Godfather', year: 1972 },
    { label: 'The Godfather: Part II', year: 1974 },
    { label: 'The Dark Knight', year: 2008 },
    { label: '12 Angry Men', year: 1957 },
    { label: "Schindler's List", year: 1993 },
    { label: 'Pulp Fiction', year: 1994 },
  ]
  return (
    <Grid container direction={'column'} justifyContent="space-evenly">
      <Box height={'20px'} />
      <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
        <Grid item xs={12} sm={12} md={2}>
          <FormControl fullWidth>
            <InputLabel id="select-gobierno-label">
              Selecciona un Gobierno
            </InputLabel>
            <Select
              labelId="select-gobierno-label"
              id="select-gobierno"
              value={selectedGobierno.id}
              onChange={handleChange}
              label="Selecciona un Gobierno"
            >
              {gobiernos.map((gobierno) => (
                <MenuItem key={gobierno.id} value={gobierno.id}>
                  {gobierno.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={top100Films}
            renderInput={(params) => <TextField {...params} label="Movie" />}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SelectFiltros
