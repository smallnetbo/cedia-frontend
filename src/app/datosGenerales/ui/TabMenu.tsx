'use client'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  SelectChangeEvent,
} from '@mui/material'

import dynamic from 'next/dynamic'
import { gobiernos, Gobiernos } from '@/types/map/entidad.interface'
import TabButtons from './TabButtons'
import SelectionControls from './SelectionControls'
import EntityInformation from './EntityInformation'

const DynamicMap = dynamic(() => import('@/components/map/index'), {
  ssr: false,
})

const TabMenu = () => {
  const [selectedButton, setSelectedButton] = useState<string>('datosGenerales')
  const [listenerEntidad, setListenerEntidad] = useState<number>(0)
  const [selectedGobierno, setSelectedGobierno] = useState<Gobiernos>(
    gobiernos[0]
  )

  // Funciones de manejo de eventos
  const handleClick = (button: string) => {
    setSelectedButton(button)
  }

  const handleChangeGobierno = (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    const selected = gobiernos.find((gobierno) => gobierno.id === value)
    if (selected) setSelectedGobierno(selected)
  }

  const handleAutocompleteChange = (
    event: React.ChangeEvent<{}>,
    value: string | null
  ) => {
    // Lógica para el cambio de valor en el Autocomplete
  }

  // Lógica para manejar el clic en una característica del mapa
  const clickFeature = async (feature: any) => {
    let id = 0
    if (feature.c_ut_dep) {
      id = feature.c_ut_dep
      setListenerEntidad(feature.c_ut_dep)
    } else {
      id = feature.codigomef
      setListenerEntidad(feature.codigomef)
    }
    //await updateInfoEntidad(id);
  }

  // Otras funciones auxiliares
  const capitalizeFirstLetter = (str: any) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  const formatButtonText = (buttonName: string) => {
    const words = buttonName.split(/(?=[A-Z])/)
    return words.map((word: any) => capitalizeFirstLetter(word)).join(' ')
  }

  return (
    <Grid container spacing={2}>
      {/* Sección de pestañas */}
      <Grid item xs={12}>
        <TabButtons
          selectedButton={selectedButton}
          handleClick={handleClick}
          formatButtonText={formatButtonText}
        />
      </Grid>

      {/* Sección de controles de selección */}
      <Grid item xs={12}>
        <SelectionControls
          selectedGobierno={selectedGobierno}
          handleChange={handleChangeGobierno}
        />
      </Grid>

      {/* Sección del mapa */}
      <Grid item xs={12} sm={8} md={9}>
        <DynamicMap
          enabledMinMap={false}
          clickFeature={clickFeature}
          selectedEntidad={listenerEntidad}
          typeVisualize={selectedGobierno.id}
        />
      </Grid>

      {/* Sección de información de la entidad */}
      <Grid item xs={12} sm={4} md={3}>
        <EntityInformation />
      </Grid>
    </Grid>
  )
}

export default TabMenu
