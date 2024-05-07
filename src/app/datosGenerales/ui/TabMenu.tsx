'use client'
import React, { useEffect, useState } from 'react'
import { Box, CircularProgress, Grid, SelectChangeEvent } from '@mui/material'
import dynamic from 'next/dynamic'
import { gobiernos, Gobiernos } from '@/types/map/entidad.interface'
import TabButtons from './TabButtons'
import SelectionControls from './SelectionControls'
import EntityInformation from './EntityInformation'
import { useAlerts } from '@/hooks'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { InterpreteMensajes } from '@/utils'
import { Servicios } from '@/services'
import { Entidad, SubSector } from '../types/datosGeneralesType'
import SectorComponent from '../sectoriales/ui/sector'
import { Sector } from '../sectoriales/types/sectorType'

const DynamicMap = dynamic(() => import('@/components/map/index'), {
  loading: () => (
    <Box sx={{ display: 'flex' }}>
      <CircularProgress />
    </Box>
  ),
  ssr: false,
})

const TabMenu = () => {
  // datos
  const [selectedButton, setSelectedButton] = useState<string>('datosGenerales')
  const [listenerEntidad, setListenerEntidad] = useState<number>(0)
  const [selectedGobierno, setSelectedGobierno] = useState<Gobiernos>(
    gobiernos[0]
  )
  const [selectEntidad, setSelectEntidad] = useState<Entidad[]>([])
  const [infoEntidadData, setInfoEntidadData] = useState<SubSector[]>([])
  const [selectedSector, setSelectedSector] = useState<Sector[]>([])

  // estados
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingData, setLoadingData] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const [errorData, setErrorData] = useState<any>()
  const [selectedView, setSelectedView] = useState<string>('map')

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
    type: 'entidad' | 'sector' | 'otro'
  ) => {
    if (value) {
      if (type === 'entidad') {
        const entidadSeleccionada = selectEntidad.find(
          (entidad) => entidad.codigoEntidad + ' - ' + entidad.nombre === value
        )
        if (entidadSeleccionada) {
          setListenerEntidad(parseInt(entidadSeleccionada.codigoEntidad, 10))
          await updateInfoEntidad(entidadSeleccionada.codigoEntidad, 'GENERAL')
        }
      } else if (type === 'sector') {
        const sectorSeleccionado = selectedSector.find(
          (sector) => sector.codigoSector + ' - ' + sector.tipoSector === value
        )
        if (sectorSeleccionado) {
          await updateInfoEntidad(sectorSeleccionado.codigoSector)
          setSelectedView('sector')
        }
      } else if (type === 'otro') {
        // Manejar otro tipo de datos
      }
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
    setLoadingData(true)
    await updateInfoEntidad(id, 'GENERAL')
    setLoadingData(false)
  }

  // Consultas
  const updateInfoEntidad = async (id: string, tipoSector?: string) => {
    try {
      setLoading(true)

      let url = `${Constantes.baseUrl}/sector/${id}/datos-generales/`
      if (tipoSector) {
        url += `?tipoSector=${tipoSector}`
      }

      const respuesta = await Servicios.get({ url })

      setInfoEntidadData(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la informacion`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoading(false)
    }
  }

  const listarEntidadMapa = async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }

  const listarSector = async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }

  useEffect(() => {
    listarEntidadMapa()
    setInfoEntidadData([])
    setSelectEntidad([])
    setListenerEntidad(0)
  }, [selectedGobierno])

  useEffect(() => {
    setSelectedGobierno(gobiernos[0])
    setListenerEntidad(0)
    setInfoEntidadData([])
    setSelectedView('map')
  }, [selectedButton])

  useEffect(() => {
    listarSector()
  }, [selectedButton === 'datosSectoriales'])

  return (
    <Grid container spacing={2} justifyContent="center">
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

      <Grid item xs={12}>
        <SelectionControls
          selectedGobierno={selectedGobierno}
          handleChange={handleChangeGobierno}
          selectEntidad={selectEntidad}
          selectedSector={selectedSector}
          handleAutocompleteChange={handleAutocompleteChange}
          selectedOption={selectedButton}
        />
      </Grid>
      {selectedView === 'map' && (
        <>
          <Grid item xs={12} sm={12} md={8}>
            <DynamicMap
              enabledMinMap={false}
              clickFeature={clickFeature}
              selectedEntidad={listenerEntidad}
              typeVisualize={selectedGobierno.id}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            {loadingData ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={650}
              >
                <CircularProgress />
              </Box>
            ) : (
              infoEntidadData && (
                <EntityInformation infoEntidadData={infoEntidadData} />
              )
            )}
          </Grid>
        </>
      )}

      {selectedView === 'sector' && (
        <Grid item xs={12} sm={12} md={12}>
          <SectorComponent infoSectorData={infoEntidadData} />
        </Grid>
      )}
    </Grid>
  )
}

export default TabMenu
