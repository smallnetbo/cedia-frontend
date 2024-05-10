import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import {
  FormControlLabel,
  IconButton,
  Paper,
  styled,
  Switch,
  Typography,
} from '@mui/material'
import ChartBar from '@/components/echarts/bar'
import {
  SubSector,
  Variable,
  DatoRegistro,
} from '../../types/datosGeneralesType'
import ChartPie from '@/components/echarts/pie'
import HorizontalBarChart from '@/components/echarts/barHorizontal'
import ChartLine from '@/components/echarts/line'
import VerticalBarChart from '@/components/echarts/barVertical'

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

const SectorComponent = ({ infoSectorData }: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [selectedItem, setSelectedItem] = useState(null)
  const [chartData, setChartData] = useState<
    { name: string; data: { datoRegistro: DatoRegistro }[] }[]
  >([])
  const [activeCharts, setActiveCharts] = useState<string[]>([])
  useEffect(() => {
    const initialState: { [key: string]: boolean } = {}
    infoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        initialState[variable.nombre] = false
      })
    })
    setSwitchStates(initialState)
  }, [infoSectorData])

  const toggleSwitch = (itemName: string) => {
    setSwitchStates((prevState) => ({
      ...prevState,
      [itemName]: !prevState[itemName],
    }))
  }

  // Función para manejar el clic en un item
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
          const agrupadores = variable.items.filter((item) => item.esAgrupador)
          const agrupadorNames = agrupadores.map(
            (agrupador) => agrupador.nombre
          )

          const groupedData: { [key: string]: { [resource: string]: number } } =
            {}

          variable.entidadVariables.forEach((entidadVariable) => {
            const { datoRegistro } = entidadVariable
            const { año, recurso, ejecucion } = datoRegistro

            // Determinar la clave de agrupación
            let key: string
            if (agrupadorNames.length > 0) {
              key = agrupadorNames.map((name) => datoRegistro[name]).join('-') // Unir los nombres de los agrupadores
            } else {
              key = recurso // Si no hay agrupadores, la clave es el recurso
            }

            if (!groupedData[key]) {
              groupedData[key] = {}
            }

            if (!groupedData[key][recurso]) {
              groupedData[key][recurso] = 0
            }

            groupedData[key][recurso] += parseFloat(ejecucion)
          })

          // Convertir los datos agrupados en el formato adecuado para el gráfico
          Object.entries(groupedData).forEach(([key, resources]) => {
            const formattedData: { datoRegistro: DatoRegistro }[] = []
            Object.entries(resources).forEach(([resource, execution]) => {
              formattedData.push({
                datoRegistro: {
                  año: key,
                  recurso: resource,
                  ejecucion: execution.toFixed(2),
                },
              })
            })

            formattedChartData.push({
              name: key,
              data: formattedData,
            })
          })
        }
      })
    })

    return formattedChartData
  }

  useEffect(() => {
    const newData: { [key: string]: { datoRegistro: DatoRegistro }[] } = {}
    infoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        if (switchStates[variable.nombre]) {
          newData[variable.nombre] = transformDataForChart(
            infoSectorData,
            variable.nombre
          )
        }
      })
    })
    setChartData(newData)
  }, [switchStates, infoSectorData])

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
          <Item elevation={4} style={{ maxWidth: '100%', maxHeight: '650px' }}>
            {infoSectorData.map((item) => (
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
                {item.variables.map((subItem: Variable) => (
                  <Grid container alignItems="center" key={subItem.id}>
                    <Grid item xs={6} key={subItem.id}>
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
                              activeSwitchesCount >= 4 &&
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
          <Grid container spacing={2}>
            {infoSectorData.map((item, index) => (
              <Grid
                item
                xs={12}
                sm={selectedItem === null ? 12 : 12}
                md={selectedItem === null ? 12 : 12}
                lg={selectedItem === null ? 6 : 12}
                xl={selectedItem === null ? 6 : 12}
                style={{
                  display:
                    selectedItem === item.id || selectedItem === null
                      ? 'block'
                      : 'none',
                  // Mostrar solo el elemento seleccionado o todos si no hay selección
                  minHeight: selectedItem === null ? '320px' : '640px',
                }}
                key={index}
              >
                <Paper
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'black',
                    cursor: 'pointer',
                    transform:
                      selectedItem === item.id ? 'scale(1)' : 'scale(1)',
                    transition: 'transform 0.3s ease-in-out',
                    height: '100%',
                  }}
                  onClick={() => handleItemClick(item.id)}
                >
                  <IconButton
                    aria-label="expanded"
                    style={{ position: 'absolute', right: '1px', top: '1px' }}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <span className="material-icons">
                      {selectedItem === item.id ? 'close' : 'open_in_full'}
                    </span>
                  </IconButton>

                  {item.variables.map(
                    (subItem) =>
                      switchStates[subItem.nombre] && (
                        <React.Fragment key={subItem.id}>
                          {subItem.graficos.tipoGrafico.descripcion ===
                            'bar' && (
                            <ChartBar
                              key={subItem.id}
                              data={chartData[subItem.nombre]}
                              title={subItem.nombre}
                              subTitle=""
                            />
                          )}
                          {subItem.graficos.tipoGrafico.descripcion ===
                            'bar_horizontal' && (
                            <HorizontalBarChart
                              key={subItem.id}
                              data={chartData[subItem.nombre]}
                              title={subItem.nombre}
                              subTitle=""
                            />
                          )}
                          {subItem.graficos.tipoGrafico.descripcion ===
                            'pie' && (
                            <ChartPie
                              key={subItem.id}
                              data={chartData[subItem.nombre]}
                              title={subItem.nombre}
                              subTitle=""
                            />
                          )}
                          {subItem.graficos.tipoGrafico.descripcion ===
                            'line' && (
                            <ChartLine
                              key={subItem.id}
                              data={chartData[subItem.nombre]}
                              title={subItem.nombre}
                              subTitle=""
                            />
                          )}
                          {subItem.graficos.tipoGrafico.descripcion ===
                            'bar_vertical' && (
                            <VerticalBarChart
                              key={subItem.id}
                              data={chartData[subItem.nombre]}
                              title={subItem.nombre}
                              subTitle=""
                            />
                          )}
                        </React.Fragment>
                      )
                  )}

                  {selectedItem === item && (
                    <IconButton
                      aria-label="close"
                      style={{ position: 'absolute', right: '5px', top: '5px' }}
                      onClick={() => setSelectedItem(null)}
                    >
                      X
                    </IconButton>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default SectorComponent
