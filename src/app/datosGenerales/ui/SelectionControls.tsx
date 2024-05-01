import React from 'react'
import {
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  SelectChangeEvent,
  Grid,
  Box,
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

const renderNumberAndFormControlBox = (
  number: number,
  selectedGobiernoId?: string,
  handleChange?: (event: SelectChangeEvent<string>) => void,
  handleAutocompleteChange?: (
    event: React.ChangeEvent<{}>,
    value: string | null
  ) => void,
  filteredEntidades?: Entidad[],
  gobierno?: Gobiernos[]
) => (
  <Box display="flex" alignItems="center">
    <Box
      borderRadius="50%"
      bgcolor="#F7931E"
      color="white"
      display="flex"
      justifyContent="center"
      alignItems="center"
      width={40}
      height={40}
      fontSize={20}
      marginRight={0.5}
    >
      {number}
    </Box>
    <Box flexGrow={1}>
      {gobierno && (
        <FormControl fullWidth sx={{ marginTop: 1 }} size="small">
          <Select
            value={selectedGobiernoId}
            onChange={handleChange}
            displayEmpty
          >
            {gobierno.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {filteredEntidades && (
        <Autocomplete
          disablePortal
          options={filteredEntidades.map(
            (entidad) => entidad.codigoEntidad + ' - ' + entidad.nombre
          )}
          onChange={handleAutocompleteChange}
          renderInput={(params) => (
            <TextField {...params} label="Seleccione entidad" />
          )}
          noOptionsText="No encontrado"
        />
      )}
    </Box>
  </Box>
)

const SelectionControls: React.FC<SelectionControlsProps> = ({
  selectedGobierno,
  selectEntidad,
  handleChange,
  handleAutocompleteChange,
}) => {
  const filteredEntidades = selectEntidad.filter(
    (entidad) => entidad.nivelGobierno.nombreCorto === selectedGobierno.id
  )
  const gobierno = gobiernos
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={2}>
        {renderNumberAndFormControlBox(
          1,
          selectedGobierno.id,
          handleChange,
          undefined,
          undefined,
          gobierno
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={2}>
        {renderNumberAndFormControlBox(
          2,
          undefined,
          undefined,
          handleAutocompleteChange,
          filteredEntidades,
          undefined
        )}
      </Grid>
    </Grid>
  )
}

export default SelectionControls
