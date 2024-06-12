'use client'
import React, { useEffect, useState } from 'react'
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  SelectChangeEvent,
} from '@mui/material'
import dynamic from 'next/dynamic'
import { gobiernos, Gobiernos } from '@/types/map/entidad.interface'
import TabButtons from './TabButtons'
import SelectionControls from './SelectionControls'
import EntityInformation from '../generales/EntityInformation'
import { useAlerts } from '@/hooks'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { InterpreteMensajes } from '@/utils'
import { Servicios } from '@/services'
import { Entidad, SubSector } from '../types/datosGeneralesType'
import SectorComponent from '../sectoriales/ui/sector'
import { Sector } from '../sectoriales/types/sectorType'
import ComparativaComponent from '../comparativa/ui/comparativa'
import GeoreferenciaComponent from '../georeferencia/ui/georeferencia'
import CruceVariableComponent from '../cruceVariable/ui/cruceVariable'

const DynamicMap = dynamic(() => import('@/components/map/MapaGeneral'), {
  loading: () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 650,
      }}
    >
      <CircularProgress />
    </Box>
  ),
  ssr: false,
})

const TabMenu = () => {
  const [selectedButton, setSelectedButton] = useState<string>('datosGenerales')
  const [selectedGobierno, setSelectedGobierno] = useState<Gobiernos>(
    gobiernos[0]
  )
  const [selectEntidad, setSelectEntidad] = useState<Entidad[]>([])
  const [infoEntidadData, setInfoEntidadData] = useState<SubSector | null>(null)
  const [infoGeoreferenciaData, setInfoGeoreferenciaData] =
    useState<dataGeoreferencia | null>(null)
  const [selectedSector, setSelectedSector] = useState<Sector[]>([])

  //estados
  const [loadingData, setLoadingData] = useState<boolean>(false)
  const [selectedView, setSelectedView] = useState<string>('map')
  const [listenerEntidad, setListenerEntidad] = useState<number>(0)
  const [listenerEntidadSegundo, setListenerEntidadSegundo] =
    useState<number>(0)
  //sectores
  const [selectedSectorCruce, setselectedSectorCruce] = useState<string>()

  const [errorData, setErrorData] = useState<any>()
  const { Alerta } = useAlerts()

  const handleClick = (button: string) => {
    setSelectedButton(button)
    setSelectedView('map')
  }

  const handleChangeGobierno = (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    const selected = gobiernos.find((gobierno) => gobierno.id === value)
    if (selected) setSelectedGobierno(selected)
  }

  const handleAutocompleteChange = async (
    event: React.ChangeEvent<{}>,
    value: string | null,
    type: 'entidad' | 'sector' | 'otro',
    uniqueId: string
  ) => {
    if (value) {
      switch (type) {
        case 'entidad':
          switch (uniqueId) {
            case 'entidad_general':
              handleEntidadDatosGenerales(value, uniqueId)
              break
            case 'entidad_sectorial':
              handleEntidadPrimero(value, uniqueId)
              break
            case 'entidad_comparativa_primero':
              handleEntidadPrimero(value, uniqueId)
              break
            case 'entidad_comparativa_segundo':
              handleEntidadSegundo(value, uniqueId)
              break
            case 'entidad_cruce':
              handleEntidadPrimero(value, uniqueId)
              break
            default:
              // Manejar otros casos de entidad si es necesario
              break
          }
          break
        case 'sector':
          switch (uniqueId) {
            case 'sector_sectorial':
              handleSectorGeneral(value, uniqueId)
              break
            case 'sector_comparativa':
              handleSectorGeneral(value, uniqueId)
              break
            case 'sector_georeferencia':
              handleSectorGeoreferencia(value, uniqueId)
              break

            case 'sector_cruce_primero':
              handleSectorPrimeroCruce(value, uniqueId)
              break
            case 'sector_cruce_segundo':
              handleSectorGeneral(value, uniqueId)
              break
            default:
              // Manejar otros casos de entidad si es necesario
              break
          }
        case 'otro':
          // Manejar otro tipo de datos si es necesario
          break
        default:
          break
      }
    }
  }

  /* manejo de select  */
  const handleEntidadDatosGenerales = async (
    value: string,
    uniqueId: string
  ) => {
    const entidadSeleccionada = selectEntidad.find(
      (entidad) => entidad.codigoEntidad + ' - ' + entidad.nombre === value
    )
    if (entidadSeleccionada) {
      setListenerEntidad(parseInt(entidadSeleccionada.codigoEntidad, 10))
      await updateInfoEntidad(
        entidadSeleccionada.codigoEntidad,
        undefined,
        '1',
        undefined,
        selectedButton
      )
    }
  }
  const handleEntidadPrimero = async (value: string, uniqueId: string) => {
    const entidadSeleccionada = selectEntidad.find(
      (entidad) => entidad.codigoEntidad + ' - ' + entidad.nombre === value
    )
    if (entidadSeleccionada) {
      setListenerEntidad(parseInt(entidadSeleccionada.codigoEntidad, 10))
    }
  }
  const handleEntidadSegundo = async (value: string, uniqueId: string) => {
    const entidadSeleccionada = selectEntidad.find(
      (entidad) => entidad.codigoEntidad + ' - ' + entidad.nombre === value
    )
    if (entidadSeleccionada) {
      setListenerEntidadSegundo(parseInt(entidadSeleccionada.codigoEntidad, 10))
    }
  }

  const handleSectorPrimeroCruce = async (value: string, uniqueId: string) => {
    const sectorSeleccionada = selectedSector.find(
      (sector) => sector.codigoSector + ' - ' + sector.nombreCorto === value
    )
    if (sectorSeleccionada) {
      setselectedSectorCruce(sectorSeleccionada.id)
    }
  }

  const handleSectorGeneral = async (value: string, uniqueId: string) => {
    const sectorSeleccionado = selectedSector.find(
      (sector) => sector.codigoSector + ' - ' + sector.nombreCorto === value
    )
    if (sectorSeleccionado) {
      await updateInfoEntidad(
        listenerEntidad.toString(),
        listenerEntidadSegundo.toString(),
        sectorSeleccionado.id,
        selectedSectorCruce?.toString(),
        selectedButton
      )
      setSelectedView(uniqueId)
    }
  }
  const handleSectorGeoreferencia = async (value: string, uniqueId: string) => {
    const sectorSeleccionado = selectedSector.find(
      (sector) => sector.codigoSector + ' - ' + sector.nombreCorto === value
    )
    if (sectorSeleccionado) {
      await updateInfoEntidad(
        undefined,
        undefined,
        sectorSeleccionado.id,
        undefined,
        selectedButton
      )

      setSelectedView(uniqueId)
    }
  }

  const clickFeature = async (feature: any) => {
    let id
    if (feature.c_ut_dep) {
      id = feature.c_ut_dep
      setListenerEntidad(feature.c_ut_dep)
    } else {
      id = feature.codigomef
      setListenerEntidad(feature.codigomef)
    }
    await updateInfoEntidad(id, undefined, undefined, undefined, selectedButton)
  }

  // Consultas
  const updateInfoEntidad = async (
    primeraEntidad?: string,
    segundaEntidad?: string,
    tipoSector?: string,
    tipoSector2?: string,
    vista?: string
  ) => {
    try {
      setLoadingData(true)

      let url = `${Constantes.baseUrl}/sector/datos-generales`
      const queryParams = []

      if (primeraEntidad) {
        queryParams.push(`codigoEntidad=${primeraEntidad}`)
      }
      if (segundaEntidad) {
        queryParams.push(`codigoEntidad2=${segundaEntidad}`)
      }
      if (tipoSector) {
        queryParams.push(`tipoSector=${tipoSector}`)
      }
      if (tipoSector2) {
        queryParams.push(`tipoSector2=${tipoSector2}`)
      }
      if (vista) {
        queryParams.push(`vista=${vista}`)
      }
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`
      }

      const respuesta = await Servicios.get({ url })

      if (
        !respuesta.datos ||
        (Array.isArray(respuesta.datos) && respuesta.datos.length === 0)
      ) {
        setInfoEntidadData(null)
        Alerta({
          mensaje: 'No hay registros para la entidad seleccionada.',
          variant: 'warning',
        })
      } else {
        setInfoEntidadData(respuesta.datos)
      }
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la informacion`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoadingData(false)
    }
  }
  const infoSectorGeoreferencia = async (
    tipoGobierno: string,
    tipoSector: string
  ) => {
    try {
      setLoadingData(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/sector/georeferenciaVariable?tipoGobierno=${tipoGobierno}&tipoSector=${tipoSector}`,
      })
      setInfoGeoreferenciaData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la información`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoadingData(false)
    }
  }

  const listarEntidadMapa = async () => {
    try {
      setLoadingData(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/entidad/entidades-mapa`,
      })
      setSelectEntidad(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la informacion`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoadingData(false)
    }
  }

  const listarSector = async () => {
    try {
      setLoadingData(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/sector/filtro`,
      })
      setSelectedSector(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la informacion`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      listarEntidadMapa()
      setInfoEntidadData(null)
      setSelectEntidad([])
      setListenerEntidad(0)
    }
  }, [selectedGobierno])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedGobierno(gobiernos[0])
      setInfoEntidadData(null)
      setListenerEntidad(0)
      setListenerEntidadSegundo(0)
      setSelectedView('map')
    }
  }, [selectedButton])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      listarSector()
    }
  }, [selectedButton === 'datosSectoriales'])

  return (
    <Grid container spacing={2} justifyContent="center">
      {/* Controles de pestañas */}
      <Grid item xs={12} sm={12} md={12}>
        <TabButtons
          selectedButton={selectedButton}
          handleClick={handleClick}
          formatButtonText={(buttonName: string) => {
            const words = buttonName.split(/(?=[A-Z])/)
            return words
              .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
          }}
        />
      </Grid>
      {/* Controles de selección */}
      <Grid item xs={12}>
        <SelectionControls
          selectedGobierno={selectedGobierno}
          handleChange={handleChangeGobierno}
          selectEntidad={selectEntidad}
          selectedSector={selectedSector}
          handleAutocompleteChange={handleAutocompleteChange}
          selectedOption={selectedButton}
          infoEntidadData={infoEntidadData}
        />
      </Grid>
      {/* Mapa */}
      {selectedView === 'map' && (
        <>
          <Grid
            item
            xs={12}
            sm={12}
            md={
              selectedButton === 'datosGenerales' && infoEntidadData !== null
                ? 8
                : 12
            }
          >
            <Paper
              elevation={15}
              sx={{
                borderRadius: '15px',
                marginTop: 5,
                position: 'relative',
                height: '450px',
                zIndex: 0,
                '@media (min-width: 600px)': {
                  height: '670px',
                },
              }}
            >
              <DynamicMap
                enabledMinMap={false}
                clickFeature={clickFeature}
                selectedEntidad={listenerEntidad}
                selectedEntidad2={listenerEntidadSegundo}
                typeVisualize={selectedGobierno.id}
                selectedButton={selectedButton}
              />
            </Paper>
          </Grid>

          {/* Información de entidad */}
          <Grid item xs={12} md={4} lg={4} xl={4}>
            {loadingData ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={750}
              >
                <CircularProgress />
              </Box>
            ) : (
              selectedButton === 'datosGenerales' &&
              infoEntidadData !== null && (
                <EntityInformation
                  infoEntidadData={infoEntidadData}
                  selectedGobierno={selectedGobierno}
                />
              )
            )}
          </Grid>
        </>
      )}
      {/* Datos Sectoriales */}
      {selectedButton === 'datosSectoriales' &&
        selectedView === 'sector_sectorial' &&
        infoEntidadData !== null && (
          <Grid item xs={12} sm={12} md={12}>
            <SectorComponent infoSectorData={infoEntidadData} />
          </Grid>
        )}

      {/* Datos Sectoriales */}
      {selectedButton === 'comparativaGGAA' &&
        selectedView === 'sector_comparativa' &&
        infoEntidadData !== null && (
          <Grid item xs={12} sm={12} md={12}>
            <ComparativaComponent infoSectorData={infoEntidadData} />
          </Grid>
        )}

      {/* Cruce de variable */}
      {selectedButton === 'cruceDeVariables' &&
        selectedView === 'sector_cruce_segundo' &&
        infoEntidadData !== null && (
          <Grid item xs={12} sm={12} md={12}>
            <CruceVariableComponent infoSectorData={infoEntidadData} />
          </Grid>
        )}

      {/* georeferencia */}
      {selectedButton === 'georeferenciaDeVariables' &&
        selectedView === 'sector_georeferencia' &&
        infoEntidadData !== null && (
          <Grid item xs={12} sm={12} md={12}>
            <GeoreferenciaComponent
              infoSectorData={infoEntidadData}
              selectedGobierno={selectedGobierno}
            />
          </Grid>
        )}
    </Grid>
  )
}

export default TabMenu
