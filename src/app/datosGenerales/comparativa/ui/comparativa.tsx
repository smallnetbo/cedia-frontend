import React, { useEffect, useState, useMemo } from 'react'
import Grid from '@mui/material/Grid'
import { Typography, Paper, Switch, FormControlLabel } from '@mui/material'
import { styled } from '@mui/system'
import ChartComponent from '@/components/echarts/chartComponent' // Assuming this is the component to render charts
import { transformDataForChartByEntidad } from '../../dataUtils/chartsUtil'
import { DatoRegistro, SubSector } from '../../types/datosGeneralesType'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

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

  const getChartDataForPaper = (index: number) => {
    const activeChartKey = activeCharts[Math.floor(index / 2)]
    if (activeChartKey) {
      const entidad = entidades[index % 2]
      return { entidad, data: chartData[activeChartKey][entidad] || [] }
    }
    return null
  }

  return (
    <>
      <Typography variant="caption">
        Seleccione hasta 2 variables para su visualización
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        <Grid
          item
          xs={12}
          md={12}
          lg={4}
          xl={3}
          sx={{ height: 650, overflow: 'auto' }}
        >
          <Item elevation={4} style={{ maxWidth: '100%', maxHeight: '650px' }}>
            {filteredInfoSectorData.map((item) => (
              <Grid key={item.id}>
                <Typography
                  variant="h6"
                  style={{
                    backgroundColor: '#50C0B2',
                    padding: '8px',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  {item.nombre}
                </Typography>
                {item.variables.map((subItem) => (
                  <Grid container alignItems="center" key={subItem.id}>
                    <Grid item xs={6}>
                      <Typography variant="caption">
                        {subItem.nombre}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'right' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={switchStates[subItem.nombre] || false}
                            onChange={() => toggleSwitch(subItem.nombre)}
                            disabled={
                              activeSwitchesCount >= 2 &&
                              !switchStates[subItem.nombre]
                            }
                          />
                        }
                        label=""
                      />
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            ))}
          </Item>
        </Grid>
        <Grid item xs={12} md={12} lg={8} xl={9}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {Array.from({ length: 4 }).map((_, index) => {
              const chartDataForPaper = getChartDataForPaper(index)
              return (
                <Grid item xs={12} sm={6} key={index} sx={{ height: '50%' }}>
                  <Item elevation={4} sx={{ height: '100%' }}>
                    {chartDataForPaper ? (
                      <ChartComponent
                        type={
                          graficosPorVariable[
                            activeCharts[Math.floor(index / 2)]
                          ] || 'line'
                        }
                        data={chartDataForPaper.data}
                        title={`${chartDataForPaper.entidad} - ${activeCharts[Math.floor(index / 2)]}`}
                        subTitle=""
                      />
                    ) : (
                      <Typography variant="h6">
                        Gráfico Placeholder {index + 1}
                      </Typography>
                    )}
                  </Item>
                </Grid>
              )
            })}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default ComparativaComponent
