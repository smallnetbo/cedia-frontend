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

const SelectionControls: React.FC<
  SelectionControlsProps & { selectedOption: string }
> = ({
  selectedGobierno,
  selectEntidad,
  handleChange,
  handleAutocompleteChange,
  selectedOption,
}) => {
  const filteredEntidades = selectEntidad.filter(
    (entidad) => entidad.nivelGobierno.nombreCorto === selectedGobierno.id
  )

  type SelectorConfig = {
    [key: string]: {
      type: string
      number: number
      label: string
      options?: Entidad[]
    }[]
  }
  const selectorConfig: SelectorConfig = {
    datosGenerales: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccione gobierno',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione entidad',
        options: filteredEntidades,
      },
    ],
    datosSectoriales: [
      { type: 'select', number: 1, label: 'Seleccione gobierno' },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione entidad',
        options: filteredEntidades,
      },
      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccione sector',
        options: selectEntidad,
      },
    ],
    comparativaGGAA: [
      { type: 'select', number: 1, label: 'Seleccione gobierno' },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione gobierno 1',
        options: filteredEntidades,
      },
      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccione gobierno 2',
        options: filteredEntidades,
      },
      {
        type: 'autocomplete',
        number: 4,
        label: 'Seleccione sector',
        options: selectEntidad,
      },
    ],
    cruceDeVariables: [
      { type: 'select', number: 1, label: 'Seleccione gobierno' },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione gobierno ',
        options: filteredEntidades,
      },
      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccione sector 1',
        options: selectEntidad,
      },
      {
        type: 'autocomplete',
        number: 4,
        label: 'Seleccione sector 2',
        options: selectEntidad,
      },
    ],
    georeferenciaDeVariables: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccione gobierno',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione sector',
        options: selectEntidad,
      },
    ],
  }

  const renderSelectorGroup = () => {
    const config = selectorConfig[selectedOption]
    if (!config) return null

    return config.map((item) => (
      <Grid item xs={12} sm={6} md={2} key={item.number}>
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
            {item.number}
          </Box>
          <Box flexGrow={1}>
            {item.type === 'select' ? (
              <FormControl fullWidth sx={{ marginTop: 1 }} size="small">
                <Select
                  value={selectedGobierno.id}
                  onChange={handleChange}
                  displayEmpty
                >
                  {gobiernos.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              item.options && (
                <Autocomplete
                  disablePortal
                  options={item.options.map(
                    (entidad) => entidad.codigoEntidad + ' - ' + entidad.nombre
                  )}
                  onChange={handleAutocompleteChange}
                  renderInput={(params) => (
                    <TextField {...params} label={item.label} />
                  )}
                  noOptionsText="No encontrado"
                />
              )
            )}
          </Box>
        </Box>
      </Grid>
    ))
  }
  return (
    <Grid container spacing={2}>
      {/* selectores */}
      {renderSelectorGroup()}
    </Grid>
  )
}

export default SelectionControls
