'use client'
import React, { useEffect, useState } from 'react'
import {
  Box,
  CircularProgress,
  Grid,
  SelectChangeEvent,
  useMediaQuery,
} from '@mui/material'
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
import { useTheme } from '@emotion/react'

const DynamicMap = dynamic(() => import('@/components/map/index'), {
  loading: () => (
    <Box sx={{ display: 'flex' }}>
      <CircularProgress />
    </Box>
  ),
  ssr: false,
})

const TabMenu = () => {
  const [selectedButton, setSelectedButton] = useState<string>('datosGenerales')
  const [listenerEntidad, setListenerEntidad] = useState<number>(0)
  const [selectedGobierno, setSelectedGobierno] = useState<Gobiernos>(
    gobiernos[0]
  )
  const [selectEntidad, setSelectEntidad] = useState<Entidad[]>([])
  const [infoEntidadData, setInfoEntidadData] = useState<SubSector[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingData, setLoadingData] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const [errorData, setErrorData] = useState<any>()

  const handleClick = (button: string) => {
    setSelectedButton(button)
  }

  const handleChangeGobierno = (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    const selected = gobiernos.find((gobierno) => gobierno.id === value)
    if (selected) setSelectedGobierno(selected)
  }

  const handleAutocompleteChange = async (
    event: React.ChangeEvent<{}>,
    value: string | null
  ) => {
    if (value) {
      const entidadSeleccionada = selectEntidad.find(
        (entidad) => entidad.codigoEntidad + ' - ' + entidad.nombre === value
      )
      if (entidadSeleccionada) {
        setListenerEntidad(parseInt(entidadSeleccionada.codigoEntidad, 10))
        await updateInfoEntidad(entidadSeleccionada.codigoEntidad)
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
    await updateInfoEntidad(id)
    setLoadingData(false)
  }

  const updateInfoEntidad = async (id: string) => {
    try {
      setLoading(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/entidad/${id}/datos-generales`,
      })
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

  useEffect(() => {
    listarEntidadMapa()
    setInfoEntidadData([])
    setSelectEntidad([])
    setListenerEntidad(0)
  }, [selectedGobierno])

  useEffect(() => {
    setSelectedGobierno(gobiernos[0])
  }, [selectedButton])

  return (
    <Grid container spacing={2}>
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
          handleAutocompleteChange={handleAutocompleteChange}
          selectedOption={selectedButton}
        />
      </Grid>
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
    </Grid>
  )
}

export default TabMenu
