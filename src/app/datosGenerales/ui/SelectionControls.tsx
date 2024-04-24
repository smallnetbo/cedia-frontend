import React from 'react'
import {
  Grid,
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  SelectChangeEvent,
} from '@mui/material'
import { Entidad, gobiernos, Gobiernos } from '@/types/map/entidad.interface'

interface SelectionControlsProps {
  selectedGobierno: Gobiernos
  selectEntidad: Entidad[]
  handleChange: (event: SelectChangeEvent<string>) => void

  handleAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    value: string | null
  ) => void
}

const SelectionControls: React.FC<SelectionControlsProps> = ({
  selectedGobierno,
  selectEntidad,
  handleChange,
  handleAutocompleteChange,
}) => {
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
              options={selectEntidad.map(
                (entidad) => entidad.codigoEntidad + ' - ' + entidad.nombre
              )}
              onChange={handleAutocompleteChange}
              renderInput={(params) => (
                <TextField {...params} label="seleccione entidad " />
              )}
              noOptionsText="No encontrado"
            />
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SelectionControls
