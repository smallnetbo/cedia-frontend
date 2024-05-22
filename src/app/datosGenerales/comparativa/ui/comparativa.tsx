import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'
import { SubSector, DatoRegistro } from '../../types/datosGeneralesType'
import SwitchListComponent from '../../componentes/switchListComponent'
import ChartListComponent from '../../componentes/chartListComponent'
import { transformDataForChartByEntidad } from '../../dataUtils/chartsUtil'

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
      [key: string]: {
        entidad1: { name: string; data: { datoRegistro: DatoRegistro }[] }[]
        entidad2: { name: string; data: { datoRegistro: DatoRegistro }[] }[]
      }
    } = {}

    const entidades = ['Beni', 'Tarija'] // Reemplaza con las entidades que necesites

    filteredInfoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        if (switchStates[variable.nombre]) {
          newData[variable.nombre] = {
            entidad1: transformDataForChartByEntidad(
              filteredInfoSectorData,
              variable.nombre,
              entidades[0]
            ),
            entidad2: transformDataForChartByEntidad(
              filteredInfoSectorData,
              variable.nombre,
              entidades[1]
            ),
          }
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
            chartData={Object.fromEntries(
              Object.entries(chartData).map(([key, value]) => [
                key,
                value.entidad1,
              ])
            )}
            selectedItem={selectedItem}
            handleItemClick={handleItemClick}
            switchStates={switchStates}
            graficosPorVariable={graficosPorVariable}
            entidades={['Beni']} // Pasando las entidades
          />
          <ChartListComponent
            charts={activeCharts}
            chartData={Object.fromEntries(
              Object.entries(chartData).map(([key, value]) => [
                key,
                value.entidad2,
              ])
            )}
            selectedItem={selectedItem}
            handleItemClick={handleItemClick}
            switchStates={switchStates}
            graficosPorVariable={graficosPorVariable}
            entidades={['Tarija']} // Pasando las entidades
          />
        </Grid>
      </Grid>
    </>
  )
}

export default ComparativaComponent
