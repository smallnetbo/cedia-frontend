import React, { useEffect, useState, useMemo } from 'react'
import Grid from '@mui/material/Grid'
import { Typography } from '@mui/material'
import SwitchListComponent from '../../componentes/switchListComponent'
import ChartListComponent from '../../componentes/chartListComponent'
import { transformDataForChartByEntidad } from '../../dataUtils/chartsUtil'
import { DatoRegistro, SubSector } from '../../types/datosGeneralesType'

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
  const filteredInfoSectorData = useMemo(
    () => infoSectorData.filter((sector) => !sector.tipoDatoGeneral),
    [infoSectorData]
  )

  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [chartData, setChartData] = useState<{
    [key: string]: {
      [entidad: string]: {
        name: string
        data: { datoRegistro: DatoRegistro }[]
      }[]
    }
  }>({})

  const [activeCharts, setActiveCharts] = useState<string[]>([])
  const [entidades, setEntidades] = useState<string[]>([])

  useEffect(() => {
    const initialState: { [key: string]: boolean } = {}
    const uniqueEntidades: Set<string> = new Set()

    filteredInfoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        initialState[variable.nombre] = false
        variable.entidadVariables.forEach((entidadVariable) => {
          uniqueEntidades.add(entidadVariable.entidad.nombre)
        })
      })
    })

    setSwitchStates(initialState)
    setEntidades(Array.from(uniqueEntidades))
  }, [filteredInfoSectorData])

  const toggleSwitch = (itemName: string) => {
    setSwitchStates((prevState) => ({
      ...prevState,
      [itemName]: !prevState[itemName],
    }))
  }

  const handleItemClick = (id: string) => {
    setSelectedItem(id === selectedItem ? null : id)
  }

  const graficosPorVariable = useMemo(() => {
    return filteredInfoSectorData.reduce(
      (acumulador: GraficosPorVariable, subSector) => {
        subSector.variables.forEach((variable) => {
          acumulador[variable.nombre] =
            variable.graficos.tipoGrafico.descripcion
        })
        return acumulador
      },
      {}
    )
  }, [filteredInfoSectorData])

  useEffect(() => {
    const newData: {
      [key: string]: {
        [entidad: string]: {
          name: string
          data: { datoRegistro: DatoRegistro }[]
        }[]
      }
    } = {}

    filteredInfoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        if (switchStates[variable.nombre]) {
          newData[variable.nombre] = entidades.reduce((acc, entidad) => {
            acc[entidad] = transformDataForChartByEntidad(
              filteredInfoSectorData,
              variable.nombre,
              entidad
            )
            return acc
          }, {})
        }
      })
    })
    setChartData(newData)
  }, [switchStates, entidades, filteredInfoSectorData])

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
      <Typography variant="caption">
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
          {entidades.map((entidad, index) => (
            <div key={index}>
              <ChartListComponent
                charts={activeCharts}
                chartData={Object.fromEntries(
                  Object.entries(chartData).map(([key, value]) => [
                    key,
                    value[entidad],
                  ])
                )}
                selectedItem={selectedItem}
                handleItemClick={handleItemClick}
                switchStates={switchStates}
                graficosPorVariable={graficosPorVariable}
                entidad={entidad}
              />
            </div>
          ))}
        </Grid>
      </Grid>
    </>
  )
}

export default ComparativaComponent
