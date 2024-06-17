import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  SxProps,
} from '@mui/material'
import { Ficha } from '../types/fichaType'

interface FichaSelectProps {
  selectedFicha: string
  listaFicha: Ficha[]
  handleFichaChange: (event: SelectChangeEvent<string>) => void
  sx?: SxProps
}

const FichaSelect: React.FC<FichaSelectProps> = ({
  selectedFicha,
  listaFicha,
  handleFichaChange,
  sx,
}) => {
  return (
    <FormControl fullWidth size="small" sx={sx}>
      <InputLabel id="ficha-label">Seleccione una ficha</InputLabel>
      <Select
        labelId="ficha-label"
        value={selectedFicha}
        onChange={handleFichaChange}
        label="Seleccione una ficha"
      >
        {listaFicha.map((ficha) => (
          <MenuItem key={ficha.id} value={ficha.id}>
            {ficha.nombre}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default FichaSelect
