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
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { gobiernos, Gobiernos } from '@/types/map/entidad.interface'
import { Categoria, Entidad, SubSector } from '../types/datosGeneralesType'
import { Sector } from '../sectoriales/types/sectorType'
import { filtrado, FiltroGobiernos } from '@/types/filtros/filtros.interface'
import { GroupHeader, GroupItems } from './types/styles'
import { getFilteredOptions } from './controls/controlFilter'
import { prepareOptions } from './controls/prepareOptions'

interface SelectionControlsProps {
  selectedGobierno: Gobiernos
  selectedFiltroGobierno?: FiltroGobiernos
  selectEntidad: Entidad[]
  selectCategoria?: Categoria[]
  selectedSector?: Sector[]

  handleChange: (event: SelectChangeEvent<string>) => void
  handleChangeFiltroGobierno: (
    event: React.ChangeEvent<{}>,
    value: FiltroGobiernos | null
  ) => void
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
  selectedFiltroGobierno,
  selectEntidad,
  selectCategoria,
  selectedSector,
  handleChange,
  handleChangeFiltroGobierno,
  handleAutocompleteChange,
  selectedOption,
}) => {
  const [showComparativaFields, setShowComparativaFields] = useState(true)
  const [entidadValues, setEntidadValues] = useState<
    Record<string, string | null>
  >({})

  const [sectorValues, setSectorValues] = useState<
    Record<string, string | null>
  >({})
  const [categoriaValues, setCategoriaValues] = useState<
    Record<string, string | null>
  >({})
  const [filteredEntidadesPrimero, setFilteredEntidadesPrimero] = useState<
    Entidad[]
  >([])
  const [filteredEntidadesSegundo, setFilteredEntidadesSegundo] = useState<
    Entidad[]
  >([])

  const [filteredOptions, setFilteredOptions] = useState<FiltroGobiernos[]>([])

  const filterActions: Record<string, () => void> = {
    DOSGOB: () => setShowComparativaFields(true),
    TODOGAD: () => setShowComparativaFields(false),
    MUNICAT: () => setShowComparativaFields(false),
    MUNIDPTO: () => setShowComparativaFields(false),
    TODOGAIOC: () => setShowComparativaFields(false),
  }

  const handleFilterGobiernoChange = () => {
    const filtroId = selectedFiltroGobierno?.id ?? ''
    if (filtroId in filterActions) {
      filterActions[filtroId]()
    }
  }

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
  }, [selectedOption, selectedGobierno, selectedFiltroGobierno])

  useEffect(() => {
    handleFilterGobiernoChange()
  }, [selectedFiltroGobierno])

  useEffect(() => {
    if (selectedOption === 'comparativaGGAA') {
      setFilteredOptions(getFilteredOptions(selectedGobierno.id, filtrado))
    }
  }, [selectedOption, selectedGobierno])

  const handleChangeValues = (
    values: Record<string, string | null>,
    setValues: React.Dispatch<
      React.SetStateAction<Record<string, string | null>>
    >,
    type: 'entidad' | 'sector',
    uniqueId: string,
    value: string | null
  ) => {
    setValues({ ...values, [uniqueId]: value })
    handleAutocompleteChange({} as React.ChangeEvent<{}>, value, type, uniqueId)
  }

  const handleEntidadChange = (
    event: React.ChangeEvent<{}>,
    value: string | null,
    uniqueId: string
  ) => {
    handleChangeValues(
      entidadValues,
      setEntidadValues,
      'entidad',
      uniqueId,
      value
    )
  }

  const handleSectorChange = (
    event: React.ChangeEvent<{}>,
    value: string | null,
    uniqueId: string
  ) => {
    handleChangeValues(sectorValues, setSectorValues, 'sector', uniqueId, value)
  }

  const handleCategoriaChange = (
    event: React.ChangeEvent<{}>,
    value: string | null,
    uniqueId: string
  ) => {
    setCategoriaValues((prev) => ({ ...prev, [uniqueId]: value }))
  }

  const filteredEntidades = selectEntidad.filter(
    (entidad) => entidad.nivelGobierno.nombreCorto === selectedGobierno.id
  )

  useEffect(() => {
    setFilteredEntidadesPrimero(
      selectEntidad.filter(
        (entidad) =>
          entidad.nivelGobierno.nombreCorto === selectedGobierno.id &&
          entidad.categoria?.nombre === categoriaValues.categoria_primero
      )
    )
  }, [categoriaValues.categoria_primero, selectEntidad, selectedGobierno.id])

  useEffect(() => {
    setFilteredEntidadesSegundo(
      selectEntidad.filter(
        (entidad) =>
          entidad.nivelGobierno.nombreCorto === selectedGobierno.id &&
          entidad.categoria?.nombre === categoriaValues.categoria_segundo
      )
    )
  }, [categoriaValues.categoria_segundo, selectEntidad, selectedGobierno.id])

  type SelectorConfig = {
    [key: string]: {
      type: string
      number: number
      label: string
      entidad?: Entidad[]
      categoria?: Categoria[]
      sector?: any
      subSector?: SubSector[]
      uniqueId: string
      show?: boolean
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
        type: 'selectFiltro',
        number: 2,
        label: 'Seleccionar Filtro',
        uniqueId: 'gobierno_select_filtro',
      },
      {
        type: 'categoria',
        number: 3,
        label: 'Seleccionar Categoria 1',
        categoria: selectCategoria,
        uniqueId: 'categoria_primero',
        show:
          showComparativaFields &&
          selectedGobierno.id === 'GAM' &&
          selectedFiltroGobierno?.id === 'DOSGOB',
      },
      {
        type: 'autocomplete',
        number:
          selectedGobierno.id === 'GAM' &&
          selectedFiltroGobierno?.id === 'DOSGOB'
            ? 4
            : 3,
        label: 'Seleccionar Gobierno Autónomo 1',
        entidad:
          selectedGobierno.id === 'GAM' &&
          selectedFiltroGobierno?.id === 'DOSGOB'
            ? filteredEntidadesPrimero
            : filteredEntidades,
        uniqueId: 'entidad_comparativa_primero',
        show: showComparativaFields,
      },
      {
        type: 'categoria',
        number: 5,
        label: 'Seleccionar Categoria 2',
        categoria: selectCategoria,
        uniqueId: 'categoria_segundo',
        show:
          showComparativaFields &&
          selectedGobierno.id === 'GAM' &&
          selectedFiltroGobierno?.id === 'DOSGOB',
      },
      {
        type: 'autocomplete',
        number:
          selectedGobierno.id === 'GAM' &&
          selectedFiltroGobierno?.id === 'DOSGOB'
            ? 6
            : 4,
        label: 'Seleccionar Gobierno Autónomo 2',
        entidad:
          selectedGobierno.id === 'GAM' &&
          selectedFiltroGobierno?.id === 'DOSGOB'
            ? filteredEntidadesSegundo
            : filteredEntidades,
        uniqueId: 'entidad_comparativa_segundo',
        show: showComparativaFields,
      },
      {
        type: 'autocomplete',
        number:
          selectedGobierno.id === 'GAM' &&
          selectedFiltroGobierno?.id === 'DOSGOB'
            ? 7
            : 5,
        label: 'Seleccionar Sector',
        sector: selectedSector,
        uniqueId: 'sector_comparativa',
        show: showComparativaFields,
      },

      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccionar Sector',
        sector: selectedSector,
        uniqueId:
          (selectedGobierno.id === 'GAM' &&
            selectedFiltroGobierno?.id === 'MUNICAT') ||
          selectedFiltroGobierno?.id === 'MUNIDPTO'
            ? 'sector_comparativa_categoria'
            : 'sector_comparativa_filtro',
        show: !showComparativaFields,
      },
    ],
    cruceDeVariables: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccionar Nivel de Gobierno',
        uniqueId: 'gobierno_select',
      },
      // {
      //   type: 'autocomplete',
      //   number: 2,
      //   label: 'Seleccionar Gobierno Autónomo',
      //   entidad: filteredEntidades,
      //   uniqueId: 'entidad_cruce',
      // },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccionar Sector 1',
        sector: selectedSector,
        uniqueId: 'sector_cruce_primero',
      },
      {
        type: 'autocomplete',
        number: 3,
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

  const theme = useTheme()
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'))

  const renderSelectorGroup = () => {
    const config = selectorConfig[selectedOption]
    if (!config) return null

    return config.map(
      (item, key) =>
        item.show !== false && (
          <Grid item xs={12} sm={6} md={2} xl={2} key={key}>
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
                  {item.type === 'select' && (
                    <FormControl
                      fullWidth
                      sx={{ marginTop: 1 }}
                      size="small"
                      key={item.uniqueId}
                    >
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
                  )}
                  {item.type === 'selectFiltro' && (
                    <Autocomplete
                      key={item.uniqueId}
                      disablePortal
                      options={filteredOptions}
                      getOptionLabel={(option) => option.name}
                      onChange={handleChangeFiltroGobierno}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Seleccionar Filtro"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  )}
                  {item.type === 'autocomplete' && (
                    <Autocomplete
                      key={item.uniqueId}
                      disablePortal
                      options={prepareOptions(item.entidad, item.sector)}
                      groupBy={(option) => option.categoria || ''}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.label === value?.label &&
                        option.categoria === value?.categoria
                      }
                      value={
                        item.entidad
                          ? {
                              label: entidadValues[item.uniqueId] ?? '',
                              categoria: undefined,
                            }
                          : {
                              label: sectorValues[item.uniqueId] ?? '',
                              categoria: undefined,
                            }
                      }
                      onChange={(event, value) => {
                        if (item.entidad) {
                          handleEntidadChange(
                            event,
                            value ? value.label : null,
                            item.uniqueId
                          )
                        } else {
                          handleSectorChange(
                            event,
                            value ? value.label : null,
                            item.uniqueId
                          )
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={item.label}
                          size="small"
                          fullWidth
                        />
                      )}
                      renderGroup={(params) => (
                        <li key={params.key}>
                          <GroupHeader>{params.group}</GroupHeader>
                          <GroupItems>{params.children}</GroupItems>
                        </li>
                      )}
                      noOptionsText="No encontrado"
                    />
                  )}
                  {item.type === 'categoria' && (
                    <Autocomplete
                      key={item.uniqueId}
                      disablePortal
                      options={
                        item.categoria?.map((categoria) => categoria.nombre) ||
                        []
                      }
                      onChange={(event, value) => {
                        handleCategoriaChange(event, value, item.uniqueId)
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
        )
    )
  }

  return (
    <Grid container spacing={2} wrap={isLargeScreen ? 'nowrap' : 'wrap'}>
      {renderSelectorGroup()}
    </Grid>
  )
}

export default SelectionControls
