import React from 'react'
import { TextField, Autocomplete, SxProps } from '@mui/material'
import { EntidadFicha } from '../types/fichaType'

interface EntidadSelectProps {
  listaEntidad: EntidadFicha[]
  selectedEntidad: EntidadFicha | null
  handleEntidadChange: (
    event: React.ChangeEvent<{}>,
    value: EntidadFicha | null
  ) => void
  sx?: SxProps
}

const EntidadSelect: React.FC<EntidadSelectProps> = ({
  listaEntidad,
  selectedEntidad,
  handleEntidadChange,
  sx,
}) => {
  return (
    <Autocomplete
      disablePortal
      id="entidad"
      options={listaEntidad}
      getOptionLabel={(option) => `${option.codigoEntidad} - ${option.nombre}`}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      value={selectedEntidad}
      onChange={handleEntidadChange}
      renderInput={(params) => (
        <TextField {...params} label="Seleccione una entidad" />
      )}
      noOptionsText="No encontrado"
      sx={sx}
    />
  )
}

export default EntidadSelect
