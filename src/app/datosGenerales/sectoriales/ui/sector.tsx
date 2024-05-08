import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import {
  Button,
  FormControlLabel,
  IconButton,
  Paper,
  styled,
  Switch,
  Typography,
} from '@mui/material'
import ChartPie from '@/components/echarts/pie'
import ChartBar from '@/components/echarts/bar'
import {
  SubSector,
  Variable,
  DatoRegistro,
} from '../../types/datosGeneralesType'

// Estilizado del componente Paper
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

// Interfaz para los datos del componente
interface InformacionInterface {
  infoSectorData: SubSector[]
}

// Componente principal SectorComponent
const SectorComponent = ({ infoSectorData }: InformacionInterface) => {
  // Estado para controlar el estado de los switches
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  // Estado para controlar el item seleccionado
  const [selectedItem, setSelectedItem] = React.useState(null)

  // Función para manejar el clic en un item
  const handleItemClick = (id) => {
    setSelectedItem(id === selectedItem ? null : id)
  }

  // Efecto para inicializar el estado de los switches por defecto
  useEffect(() => {
    const initialState: { [key: string]: boolean } = {}
    infoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        initialState[variable.nombre] = true
      })
    })
    setSwitchStates(initialState)
  }, [infoSectorData])

  // Estado para los datos del gráfico
  const [chartData, setChartData] = useState<
    { name: string; data: { datoRegistro: DatoRegistro }[] }[]
  >([])

  // Función para alternar el estado del switch
  const toggleSwitch = (itemName: string) => {
    setSwitchStates((prevState) => {
      const newState = {
        ...prevState,
        [itemName]: !prevState[itemName],
      }
      return newState
    })
  }

  // Función para transformar los datos para el gráfico
  const transformDataForChart = (data: SubSector[]) => {
    const formattedChartData: {
      name: string
      data: { datoRegistro: DatoRegistro }[]
    }[] = []

    const groupedData: { [year: string]: { [resource: string]: number } } = {}

    data.forEach((subSector) => {
      subSector.variables.forEach((variable) => {
        variable.entidadVariables.forEach((entidadVariable) => {
          const { datoRegistro } = entidadVariable
          const { año, recurso, ejecucion } = datoRegistro
          if (!groupedData[año]) {
            groupedData[año] = {}
          }
          if (!groupedData[año][recurso]) {
            groupedData[año][recurso] = 0
          }
          groupedData[año][recurso] += parseFloat(ejecucion)
        })
      })
    })

    Object.entries(groupedData).forEach(([year, resources]) => {
      const formattedData: { datoRegistro: DatoRegistro }[] = []
      Object.entries(resources).forEach(([resource, execution]) => {
        formattedData.push({
          datoRegistro: {
            año: year,
            recurso: resource,
            ejecucion: execution.toFixed(2),
          },
        })
      })

      formattedChartData.push({
        name: year,
        data: formattedData,
      })
    })

    return formattedChartData
  }

  // Efecto para filtrar y actualizar los datos del gráfico
  useEffect(() => {
    const filteredData = infoSectorData.map((sector) => ({
      ...sector,
      variables: sector.variables.filter(
        (variable) => switchStates[variable.nombre]
      ),
    }))

    const newData = transformDataForChart(filteredData)
    setChartData(newData)
  }, [switchStates, infoSectorData])

  // Calcula cuántos elementos activos hay
  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  // Estado para almacenar los gráficos activos
  const [activeCharts, setActiveCharts] = useState<string[]>([])

  // Función para manejar la activación y desactivación de gráficos
  useEffect(() => {
    const newActiveCharts = Object.keys(switchStates).filter(
      (itemName) => switchStates[itemName]
    )
    setActiveCharts(newActiveCharts.slice(0, 4)) // Limita a solo cuatro gráficos activos
  }, [switchStates])

  return (
    <>
      <Typography variant={'caption'}>
        Seleccione hasta 4 variables para su visualización
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        {/* Primer grid con altura definida y scroll */}
        <Grid item xs={12} md={12} lg={4} xl={3} overflow="auto">
          <Item elevation={4} style={{ maxWidth: '100%', maxHeight: '650px' }}>
            {infoSectorData.map((Item) => (
              <Grid key={Item.id}>
                <Typography
                  variant="h6"
                  style={{
                    backgroundColor: '#50C0B2',
                    padding: '8px',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  {Item.nombre}
                </Typography>
                {Item.variables.map((subItem: Variable) => (
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

        {/* Segundo grid */}
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
                  <ChartBar data={chartData} title={item.nombre} subTitle="" />

                  {selectedItem === item.id && (
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
