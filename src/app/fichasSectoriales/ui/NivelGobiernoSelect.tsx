import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  SxProps,
} from '@mui/material'
import { NivelGobierno } from '../types/fichaType'

interface NivelGobiernoSelectProps {
  selectedNivelGobierno: string
  listaNivelGobierno: NivelGobierno[]
  handleNivelGobiernoChange: (event: SelectChangeEvent<string>) => void
  sx?: SxProps
}

const NivelGobiernoSelect: React.FC<NivelGobiernoSelectProps> = ({
  selectedNivelGobierno,
  listaNivelGobierno,
  handleNivelGobiernoChange,
  sx,
}) => {
  return (
    <FormControl fullWidth size="small" sx={sx}>
      <InputLabel id="ficha-label">Seleccione nivel de gobierno</InputLabel>
      <Select
        labelId="ficha-label"
        value={selectedNivelGobierno}
        onChange={handleNivelGobiernoChange}
        label="Seleccione nivel de gobierno"
      >
        {listaNivelGobierno.map((nivelGobierno) => (
          <MenuItem key={nivelGobierno.id} value={nivelGobierno.id}>
            {nivelGobierno.nombreCorto}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default NivelGobiernoSelect
