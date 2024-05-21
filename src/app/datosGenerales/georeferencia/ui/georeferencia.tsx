import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import {
  Box,
  CircularProgress,
  Paper,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import dynamic from 'next/dynamic'
import {
  gobiernos,
  Gobiernos,
  NivelGobierno,
} from '@/types/map/entidad.interface'
import { DatoRegistro } from '../../types/datosGeneralesType'
import SwitchListComponent from '../../componentes/switchListComponent'
import StaticSwitchListComponent from '../../componentes/staticSwitch'

const DynamicMap = dynamic(() => import('@/components/map/index'), {
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

interface InformacionInterface {
  infoGeoreferenciaData: NivelGobierno[]
}

type GraficosPorVariable = {
  [variable: string]: string
}

const GeoreferenciaComponent = ({
  infoGeoreferenciaData,
}: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [chartData, setChartData] = useState<{
    [key: string]: { name: string; data: { datoRegistro: DatoRegistro }[] }[]
  }>({})
  const [activeCharts, setActiveCharts] = useState<string[]>([])
  const [listenerEntidad, setListenerEntidad] = useState<number>(0)
  const [listenerEntidadSegundo, setListenerEntidadSegundo] =
    useState<number>(0)
  const [selectedGobierno, setSelectedGobierno] = useState<Gobiernos>(
    gobiernos[0]
  )

  const toggleSwitch = (itemName: string, entityId: number) => {
    setSwitchStates((prevState) => ({
      ...prevState,
      [itemName]: !prevState[itemName],
    }))
    if (!switchStates[itemName]) {
      setListenerEntidad(entityId)
    } else {
      setListenerEntidad(0)
    }
  }

  const handleItemClick = (id: number) => {
    setSelectedItem(id === selectedItem ? null : id)
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
  }

  return (
    <>
      <Typography variant={'caption'}>
        Seleccione hasta 4 variables para su visualización
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        <Grid item xs={12} md={12} lg={4} xl={3} overflow="auto">
          <StaticSwitchListComponent
            switchStates={switchStates}
            toggleSwitch={toggleSwitch}
          />
        </Grid>

        <Grid item xs={12} md={12} lg={8} xl={9}>
          <Paper
            elevation={15}
            sx={{
              borderRadius: '15px',
              position: 'relative',
              height: '450px',
              zIndex: 0,
              '@media (min-width: 600px)': {
                height: '650px',
              },
            }}
          >
            <DynamicMap
              enabledMinMap={false}
              clickFeature={clickFeature}
              selectedEntidad={listenerEntidad}
              selectedEntidad2={listenerEntidadSegundo}
              typeVisualize={selectedGobierno.id}
              tooltip={true}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default GeoreferenciaComponent
