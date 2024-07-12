import React, { useEffect, useState } from 'react'
import {
  FormControl,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  SelectChangeEvent,
  Grid,
  Box,
  InputLabel,
} from '@mui/material'
import { gobiernos, Gobiernos } from '@/types/map/entidad.interface'
import { Entidad, SubSector } from '../types/datosGeneralesType'
import { Sector } from '../sectoriales/types/sectorType'

interface SelectionControlsProps {
  selectedGobierno: Gobiernos
  selectEntidad: Entidad[]
  selectedSector?: Sector[]

  handleChange: (event: SelectChangeEvent<string>) => void
  handleAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    value: string | null,
    type: 'entidad' | 'sector' | 'otro',
    uniqueId: string
  ) => void
}

const SelectionControls: React.FC<
  SelectionControlsProps & { selectedOption: string }
> = ({
  selectedGobierno,
  selectEntidad,
  selectedSector,
  handleChange,
  handleAutocompleteChange,
  selectedOption,
}) => {
  const [entidadValues, setEntidadValues] = useState<{
    [key: string]: string | null
  }>({
    entidad_general: null,
    entidad_sectorial: null,
    entidad_comparativa_primero: null,
    entidad_comparativa_segundo: null,
    entidad_cruce: null,
  })

  const [sectorValues, setSectorValues] = useState<{
    [key: string]: string | null
  }>({
    sector_sectorial: null,
    sector_comparativa: null,
    sector_cruce_primero: null,
    sector_cruce_segundo: null,
    sector_georeferencia: null,
  })
  useEffect(() => {
    setEntidadValues({
      entidad_general: null,
      entidad_sectorial: null,
      entidad_comparativa_primero: null,
      entidad_comparativa_segundo: null,
      entidad_cruce: null,
    })
    setSectorValues({
      sector_sectorial: null,
      sector_comparativa: null,
      sector_cruce_primero: null,
      sector_cruce_segundo: null,
      sector_georeferencia: null,
    })
  }, [selectedOption, selectedGobierno])

  const handleEntidadChange = (
    event: React.ChangeEvent<{}>,
    value: string | null,
    uniqueId: string
  ) => {
    setEntidadValues({
      ...entidadValues,
      [uniqueId]: value,
    })
    handleAutocompleteChange(event, value, 'entidad', uniqueId)
  }

  const handleSectorChange = (
    event: React.ChangeEvent<{}>,
    value: string | null,
    uniqueId: string
  ) => {
    setSectorValues({
      ...sectorValues,
      [uniqueId]: value,
    })
    handleAutocompleteChange(event, value, 'sector', uniqueId)
  }

  const filteredEntidades = selectEntidad.filter(
    (entidad) => entidad.nivelGobierno.nombreCorto === selectedGobierno.id
  )
  type SelectorConfig = {
    [key: string]: {
      type: string
      number: number
      label: string
      entidad?: Entidad[]
      sector?: any
      subSector?: SubSector[]
      uniqueId: string
    }[]
  }

  const selectorConfig: SelectorConfig = {
    datosGenerales: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccionar Nivel de Gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccionar Gobierno Autónomo',
        entidad: filteredEntidades,
        uniqueId: 'entidad_general',
      },
    ],
    datosSectoriales: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccionar Nivel de Gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccionar Gobierno Autónomo',
        entidad: filteredEntidades,
        uniqueId: 'entidad_sectorial',
      },
      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccionar Sector',
        sector: selectedSector,
        uniqueId: 'sector_sectorial',
      },
    ],
    comparativaGGAA: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccionar Nivel de Gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccionar Gobierno Autónomo 1',
        entidad: filteredEntidades,
        uniqueId: 'entidad_comparativa_primero',
      },
      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccionar Gobierno Autónomo 2',
        entidad: filteredEntidades,
        uniqueId: 'entidad_comparativa_segundo',
      },
      {
        type: 'autocomplete',
        number: 4,
        label: 'Seleccionar Sector',
        sector: selectedSector,
        uniqueId: 'sector_comparativa',
      },
    ],
    cruceDeVariables: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccionar Nivel de Gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccionar Gobierno Autónomo',
        entidad: filteredEntidades,
        uniqueId: 'entidad_cruce',
      },
      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccionar Sector 1',
        sector: selectedSector,
        uniqueId: 'sector_cruce_primero',
      },
      {
        type: 'autocomplete',
        number: 4,
        label: 'Seleccionar Sector 2',
        sector: selectedSector,
        uniqueId: 'sector_cruce_segundo',
      },
    ],
    georeferenciaDeVariables: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccionar Nivel de Gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccionar Sector',
        sector: selectedSector,
        uniqueId: 'sector_georeferencia',
      },
    ],
  }

  const renderSelectorGroup = () => {
    const config = selectorConfig[selectedOption]
    if (!config) return null

    return config.map((item) => (
      <Grid item xs={12} sm={6} md={4} xl={3} key={item.number}>
        <Box display="flex" alignItems="center">
          <>
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
                  <InputLabel id="idGobierno">{item.label}</InputLabel>
                  <Select
                    labelId="idGobierno"
                    value={selectedGobierno.id}
                    label={item.label}
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
                <Autocomplete
                  disablePortal
                  options={
                    item.entidad
                      ? item.entidad.map(
                          (entidad) =>
                            entidad.codigoEntidad + ' - ' + entidad.nombre
                        )
                      : item.sector?.map(
                          (sector: Sector) =>
                            sector.codigoSector + ' - ' + sector.nombreCorto
                        ) || []
                  }
                  value={
                    item.entidad
                      ? entidadValues[item.uniqueId]
                      : sectorValues[item.uniqueId]
                  }
                  onChange={(event, value) => {
                    if (item.entidad) {
                      handleEntidadChange(event, value, item.uniqueId)
                    } else {
                      handleSectorChange(event, value, item.uniqueId)
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={item.label} />
                  )}
                  noOptionsText="No encontrado"
                />
              )}
            </Box>
          </>
        </Box>
      </Grid>
    ))
  }
  return (
    <Grid container spacing={2}>
      {renderSelectorGroup()}
    </Grid>
  )
}

export default SelectionControls
