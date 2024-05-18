import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'

import { SubSector, DatoRegistro } from '../../types/datosGeneralesType'

import SwitchListComponent from '../../componentes/switchListComponent'
import ChartListComponent from '../../componentes/chartListComponent'

interface InformacionInterface {
  infoSectorData: SubSector[]
}

type GraficosPorVariable = {
  [variable: string]: string
}

const ComparativaComponent = ({ infoSectorData }: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const filteredInfoSectorData = infoSectorData.filter(
    (sector) => sector.tipoDatoGeneral === false
  )

  const [selectedItem, setSelectedItem] = useState(null)
  const [chartData, setChartData] = useState<{
    [key: string]: { name: string; data: { datoRegistro: DatoRegistro }[] }[]
  }>({})
  const [activeCharts, setActiveCharts] = useState<string[]>([])

  useEffect(() => {
    const initialState: { [key: string]: boolean } = {}
    let count = 0
    filteredInfoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        if (count < 4) {
          initialState[variable.nombre] = true
          count++
        } else {
          initialState[variable.nombre] = false
        }
      })
    })
    setSwitchStates(initialState)
  }, []) // No hay dependencias, se ejecutará solo una vez

  const toggleSwitch = (itemName: string) => {
    setSwitchStates((prevState) => ({
      ...prevState,
      [itemName]: !prevState[itemName],
    }))
  }

  const handleItemClick = (id) => {
    setSelectedItem(id === selectedItem ? null : id)
  }

  const transformDataForChart = (
    data: SubSector[],
    variableName: string
  ): { name: string; data: { datoRegistro: DatoRegistro }[] }[] => {
    const formattedChartData: {
      name: string
      data: { datoRegistro: DatoRegistro }[]
    }[] = []

    data.forEach((subSector) => {
      subSector.variables.forEach((variable) => {
        if (variable.nombre === variableName) {
          const formattedData: { datoRegistro: DatoRegistro }[] = []

          variable.entidadVariables.forEach((entidadVariable) => {
            const { datoRegistro } = entidadVariable
            const { año, recurso, ejecucion } = datoRegistro

            formattedData.push({
              datoRegistro: {
                año: año,
                recurso: recurso,
                ejecucion: parseFloat(ejecucion).toFixed(2),
              },
            })
          })

          formattedChartData.push({
            name: variableName,
            data: formattedData,
          })
        }
      })
    })

    return formattedChartData
  }

  //variable con su tipo de grafico
  const graficosPorVariable = filteredInfoSectorData.reduce(
    (acumulador: GraficosPorVariable, subSector) => {
      subSector.variables.forEach((variable) => {
        acumulador[variable.nombre] = variable.graficos.tipoGrafico.descripcion
      })
      return acumulador
    },
    {}
  )
  useEffect(() => {
    const newData: {
      [key: string]: { name: string; data: { datoRegistro: DatoRegistro }[] }[]
    } = {}
    filteredInfoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        if (switchStates[variable.nombre]) {
          newData[variable.nombre] = transformDataForChart(
            filteredInfoSectorData,
            variable.nombre
          )
        }
      })
    })
    setChartData(newData)
  }, [switchStates]) // Solo se ejecuta cuando switchStates cambia

  useEffect(() => {
    const newActiveCharts = Object.keys(switchStates).filter(
      (itemName) => switchStates[itemName]
    )
    setActiveCharts(newActiveCharts.slice(0, 4))
  }, [switchStates])

  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  return (
    <>
      <Typography variant={'caption'}>
        Seleccione hasta 4 variables para su visualización
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        <Grid item xs={12} md={12} lg={4} xl={3} overflow="auto">
          <SwitchListComponent
            data={filteredInfoSectorData}
            switchStates={switchStates}
            toggleSwitch={toggleSwitch}
            activeSwitchesCount={activeSwitchesCount}
          />
        </Grid>

        <Grid item xs={12} md={12} lg={8} xl={9}>
          <ChartListComponent
            charts={activeCharts}
            chartData={chartData}
            selectedItem={selectedItem}
            handleItemClick={handleItemClick}
            switchStates={switchStates}
            graficosPorVariable={graficosPorVariable}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default ComparativaComponent
