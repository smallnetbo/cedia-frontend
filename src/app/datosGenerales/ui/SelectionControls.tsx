import React, { useState } from 'react'
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
  Button,
} from '@mui/material'
import { gobiernos, Gobiernos } from '@/types/map/entidad.interface'
import { Entidad, SubSector } from '../types/datosGeneralesType'
import { Sector } from '../sectoriales/types/sectorType'
import ModalPdf from '../reporte/ui/modalPdf'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { delay } from '@/utils'

interface SelectionControlsProps {
  selectedGobierno: Gobiernos
  selectEntidad: Entidad[]
  selectedSector?: Sector[]
  infoEntidadData?: SubSector[]

  handleChange: (event: SelectChangeEvent<string>) => void
  handleAutocompleteChange: (
    event: React.ChangeEvent<{}>,
    value: string | null,
    type: 'entidad' | 'sector' | 'otro',
    uniqueId: string
  ) => void
}

const SelectionControls: React.FC<
  SelectionControlsProps & { selectedOption: string } & {
    mapImage?: string | undefined
  }
> = ({
  selectedGobierno,
  selectEntidad,
  selectedSector,
  infoEntidadData,
  handleChange,
  handleAutocompleteChange,
  selectedOption,
  mapImage,
}) => {
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
        label: 'Seleccione gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione entidad',
        entidad: filteredEntidades,
        uniqueId: 'entidad_general',
      },
      // {
      //   type: 'print',
      //   number: 3,
      //   label: '',
      //   subSector: infoEntidadData,
      //   uniqueId: 'print_button',
      // },
    ],
    datosSectoriales: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccione gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione entidad',
        entidad: filteredEntidades,
        uniqueId: 'entidad_sectorial',
      },
      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccione sector',
        sector: selectedSector,
        uniqueId: 'sector_sectorial',
      },
    ],
    comparativaGGAA: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccione gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione gobierno 1',
        entidad: filteredEntidades,
        uniqueId: 'entidad_comparativa_primero',
      },
      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccione gobierno 2',
        entidad: filteredEntidades,
        uniqueId: 'entidad_comparativa_segundo',
      },
      {
        type: 'autocomplete',
        number: 4,
        label: 'Seleccione sector',
        sector: selectedSector,
        uniqueId: 'sector_comparativa',
      },
    ],
    cruceDeVariables: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccione gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione gobierno ',
        entidad: filteredEntidades,
        uniqueId: 'entidad_cruce',
      },
      {
        type: 'autocomplete',
        number: 3,
        label: 'Seleccione sector 1',
        sector: selectedSector,
        uniqueId: 'sector_cruce_primero',
      },
      {
        type: 'autocomplete',
        number: 4,
        label: 'Seleccione sector 2',
        sector: selectedSector,
        uniqueId: 'sector_cruce_segundo',
      },
    ],
    georeferenciaDeVariables: [
      {
        type: 'select',
        number: 1,
        label: 'Seleccione gobierno',
        uniqueId: 'gobierno_select',
      },
      {
        type: 'autocomplete',
        number: 2,
        label: 'Seleccione sector',
        entidad: selectEntidad,
        uniqueId: 'sector_georeferencia',
      },
    ],
  }

  const [modalPdf, setModalPdf] = useState(false)

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }
  const verPdfModal = () => {
    setModalPdf(true)
  }
  const renderSelectorGroup = () => {
    const config = selectorConfig[selectedOption]
    if (!config) return null

    return config.map((item) => (
      <Grid item xs={12} sm={6} md={4} xl={2} key={item.number}>
        <Box display="flex" alignItems="center">
          {item.type === 'print' ? (
            <Box ml="auto">
              {item.subSector?.length > 0 && (
                <>
                  <Button
                    onClick={verPdfModal}
                    variant="outlined"
                    startIcon={
                      <span className="material-icons">visibility</span>
                    }
                  >
                    Ver pdf
                  </Button>
                  <CustomDialog
                    isOpen={modalPdf}
                    handleClose={cerrarModalPdf}
                    title="VISTA PREVIA PDF"
                    maxWidth="lg"
                  >
                    <ModalPdf
                      infoEntidadData={item.subSector}
                      accionCorrecta={() => {
                        cerrarModalPdf().finally()
                      }}
                      accionCancelar={cerrarModalPdf}
                      mapImage={mapImage}
                      tipoGobierno={selectedGobierno}
                    />
                  </CustomDialog>
                </>
              )}
            </Box>
          ) : (
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
                            (sector) =>
                              sector.codigoSector + ' - ' + sector.tipoSector
                          ) || []
                    }
                    onChange={(event, value) =>
                      handleAutocompleteChange(
                        event,
                        value,
                        item.entidad ? 'entidad' : 'sector',
                        item.uniqueId
                      )
                    }
                    renderInput={(params) => (
                      <TextField {...params} label={item.label} />
                    )}
                    noOptionsText="No encontrado"
                  />
                )}
              </Box>
            </>
          )}
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
