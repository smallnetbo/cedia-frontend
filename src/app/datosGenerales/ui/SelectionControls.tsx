import React from 'react'
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  SelectChangeEvent,
} from '@mui/material'
import { gobiernos, Gobiernos } from '@/types/map/entidad.interface'

interface SelectionControlsProps {
  selectedGobierno: Gobiernos
  handleChange: (event: SelectChangeEvent<string>) => void
}

const SelectionControls: React.FC<SelectionControlsProps> = ({
  selectedGobierno,
  handleChange,
}) => {
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
      <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
        <Grid item xs={12} sm={12} md={2}>
          <FormControl fullWidth>
            <Select
              value={selectedGobierno.id}
              onChange={handleChange}
              displayEmpty
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
          <FormControl fullWidth>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={top100Films}
              renderInput={(params) => (
                <TextField {...params} label="seleccione entidad " />
              )}
            />
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SelectionControls
