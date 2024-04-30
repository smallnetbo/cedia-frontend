import React from 'react'
import {
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  SelectChangeEvent,
  Grid,
} from '@mui/material'
import { gobiernos, Gobiernos } from '@/types/map/entidad.interface'
import { Entidad } from '../types/datosGeneralesType'

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
  const filteredEntidades = selectEntidad.filter(
    (entidad) => entidad.nivelGobierno.nombreCorto === selectedGobierno.id
  )

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={2}>
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
      <Grid item xs={12} sm={6} md={2}>
        <FormControl fullWidth>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={filteredEntidades.map(
              (entidad) => entidad.codigoEntidad + ' - ' + entidad.nombre
            )}
            onChange={handleAutocompleteChange}
            renderInput={(params) => (
              <TextField {...params} label="Seleccione entidad" />
            )}
            noOptionsText="No encontrado"
          />
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default SelectionControls
