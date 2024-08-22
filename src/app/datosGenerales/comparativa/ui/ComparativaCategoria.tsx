import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Typography,
} from '@mui/material'
import { SubSector, ChartData } from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { delay } from '@/utils'
import TipoGraficoComponent from '@/components/echarts/TipoGraficoComponent'
import {
  filterDatoGeneralReporte,
  filterDatoGeneralVista,
} from '../../dataUtils/filtros/filterDatosGenerales'
import { generarDataReporteGraficos } from '../../dataUtils/reportes/generateDataReporteGraficos'
import ModalReporteGeneralMapa from '../../reporte/ui/modalReportes/modalReporteGeneralMapa'
import CloseIcon from '@mui/icons-material/Close'
import { Fullscreen } from '@mui/icons-material'
import { transformDataForChartByCategoria } from '../../dataUtils/transformDataForChartByCategoria'
import { FiltroGobiernos } from '@/types/filtros/filtros.interface'
import { transformDataForChartByDepartamentos } from '../../dataUtils/transformDataForChartByDepartamentos'

interface InformacionInterface {
  infoSectorData: SubSector[]
  selectedFiltroGobierno: FiltroGobiernos
}

type GraficosPorVariable = {
  [variable: string]: string
}

const ComparativaCategoria = ({
  infoSectorData,
  selectedFiltroGobierno,
}: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [modalPdf, setModalPdf] = useState(false)
  const [chartData, setChartData] = useState<{
    [key: string]: {
      [categoria: string]: {
        name: string
        data: ChartData[]
      }[]
    }
  }>({})

  const [activeCharts, setActiveCharts] = useState<string[]>([])
  const [chartImage, setChartImage] = useState<{ [key: string]: string }>({})
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [modalChartOpen, setModalChartOpen] = useState(false)
  const [entidades, setEntidades] = useState<string[]>([])

  const filteredInfoSectorData = filterDatoGeneralVista(infoSectorData)
  const dataDatosGenerales = filterDatoGeneralReporte(infoSectorData)

  const filtrarVariablesRepetidas = (variables: SubSector['variables']) => {
    const uniqueVariables: { [key: string]: boolean } = {}
    return variables.filter((variable) => {
      if (uniqueVariables[variable.nombre]) {
        return false
      }
      uniqueVariables[variable.nombre] = true
      return true
    })
  }

  useEffect(() => {
    const initialState = createInitialState(filteredInfoSectorData)

    if (selectedFiltroGobierno.id === 'MUNICAT') {
      const uniqueEntidades = extractUniqueCategorias(filteredInfoSectorData)
      setEntidades(uniqueEntidades)
    } else if (selectedFiltroGobierno.id === 'MUNIDPTO') {
      const uniqueDepartamentos = extractUniqueDepartamentos(
        filteredInfoSectorData
      )
      setEntidades(uniqueDepartamentos)
    }

    setSwitchStates(initialState)
  }, [infoSectorData])

  const extractUniqueCategorias = (data: SubSector[]): string[] => {
    const uniqueCategorias = new Set<string>()
    data.forEach((sector) =>
      sector.variables.forEach((variable) =>
        variable.entidadVariables.forEach(
          (entidadVariable) =>
            entidadVariable.entidad.categoria.nombre &&
            uniqueCategorias.add(entidadVariable.entidad.categoria.nombre)
        )
      )
    )
    return Array.from(uniqueCategorias)
  }

  const departamentoMap: { [codigo: string]: string } = {
    '1': 'Chuquisaca',
    '2': 'La Paz',
    '3': 'Cochabamba',
    '4': 'Oruro',
    '5': 'Potosí',
    '6': 'Tarija',
    '7': 'Santa Cruz',
    '8': 'Beni',
    '9': 'Pando',
  }

  const extractUniqueDepartamentos = (data: SubSector[]): string[] => {
    const uniqueDepartamentos = new Set<string>()

    data.forEach((sector) =>
      sector.variables.forEach((variable) =>
        variable.entidadVariables.forEach((entidadVariable) => {
          const codigoDepartamento = entidadVariable.entidad.codigoDepartamento
          if (codigoDepartamento) {
            const nombreDepartamento = departamentoMap[codigoDepartamento]
            if (nombreDepartamento) {
              uniqueDepartamentos.add(nombreDepartamento)
            }
          }
        })
      )
    )

    return Array.from(uniqueDepartamentos)
  }

  const createInitialState = (data: SubSector[]) => {
    const initialState: { [key: string]: boolean } = {}
    data.forEach((sector) => {
      const filterVariables = filtrarVariablesRepetidas(sector.variables)
      filterVariables.forEach((variable) => {
        initialState[variable.nombre] = false
      })
    })
    return initialState
  }

  useEffect(() => {
    const newData: {
      [key: string]: {
        [entidad: string]: {
          name: string
          data: ChartData[]
        }[]
      }
    } = {}

    filteredInfoSectorData.forEach((sector) => {
      const filteredVariables = filtrarVariablesRepetidas(sector.variables)
      filteredVariables.forEach((variable) => {
        if (switchStates[variable.nombre]) {
          if (selectedFiltroGobierno.id === 'MUNICAT') {
            newData[variable.nombre] = entidades.reduce(
              (acc, entidad) => {
                acc[entidad] = transformDataForChartByCategoria(
                  filteredInfoSectorData,
                  variable.nombre,
                  entidad
                )
                return acc
              },
              {} as {
                [entidad: string]: {
                  name: string
                  data: ChartData[]
                }[]
              }
            )
          } else if (selectedFiltroGobierno.id === 'MUNIDPTO') {
            newData[variable.nombre] = entidades.reduce(
              (acc, entidad) => {
                acc[entidad] = transformDataForChartByDepartamentos(
                  filteredInfoSectorData,
                  variable.nombre,
                  entidad
                )
                return acc
              },
              {} as {
                [entidad: string]: {
                  name: string
                  data: ChartData[]
                }[]
              }
            )
          }
        }
      })
    })

    setChartData(newData)
  }, [switchStates, entidades, infoSectorData])

  useEffect(() => {
    const newActiveCharts = Object.keys(switchStates).filter(
      (itemName) => switchStates[itemName]
    )
    setActiveCharts(newActiveCharts.slice(0, 2))
  }, [switchStates, infoSectorData])

  const toggleSwitch = (itemName: string) => {
    const newSwitchStates = { ...switchStates }
    const wasActivated = newSwitchStates[itemName]
    newSwitchStates[itemName] = !wasActivated
    const activeCount = Object.values(newSwitchStates).filter(Boolean).length

    if (activeCount < 2) {
      setSwitchStates(newSwitchStates)
      if (newSwitchStates[itemName]) {
        const updatedChartImage = { ...chartImage }
        Object.keys(updatedChartImage).forEach((key) => {
          if (key !== itemName) {
            delete updatedChartImage[key]
          }
        })
        const filteredChartImage = Object.fromEntries(
          Object.entries(updatedChartImage).filter(
            ([_, images]) => images.length > 0
          )
        )
        setChartImage(filteredChartImage)
      } else {
        setChartImage((prevState) => {
          const { [itemName]: omit, ...rest } = prevState
          return rest
        })
      }
    }
  }

  const graficosPorVariable = filteredInfoSectorData.reduce(
    (acumulador: GraficosPorVariable, subSector) => {
      filtrarVariablesRepetidas(subSector.variables).forEach((variable) => {
        acumulador[variable.nombre] = variable.graficos.tipoGrafico.descripcion
      })
      return acumulador
    },
    {}
  )

  const verPdfModal = async () => {
    setModalPdf(true)
  }

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  const dataReporteGraficos = generarDataReporteGraficos(
    filteredInfoSectorData,
    switchStates
  )

  const handlePaperClick = (chartName: string) => {
    setSelectedChart(chartName)
    setModalChartOpen(true)
  }

  const closeModalChart = () => {
    setModalChartOpen(false)
    setSelectedChart(null)
  }

  return (
    <>
      <CustomDialog
        isOpen={modalPdf}
        handleClose={cerrarModalPdf}
        title="VISTA PREVIA PDF"
        maxWidth="lg"
      >
        <ModalReporteGeneralMapa
          infoEntidadData={dataDatosGenerales}
          dataReporteGraficos={dataReporteGraficos}
          chartImages={chartImage}
        />
      </CustomDialog>

      <Dialog
        open={modalChartOpen}
        onClose={closeModalChart}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            minHeight: '80vh',
          },
        }}
      >
        <DialogTitle>
          {selectedChart}
          <IconButton
            aria-label="close"
            onClick={closeModalChart}
            style={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedChart && (
            <div style={{ height: '70vh' }}>
              <TipoGraficoComponent
                type={graficosPorVariable[selectedChart]}
                data={chartData[selectedChart]}
                title={selectedChart}
                subTitle=""
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Grid container alignItems="center">
        <Grid item xs={6} md={6}>
          <Typography variant={'body1'}>
            Seleccione 1 variable para su visualización
          </Typography>
        </Grid>
        <Grid item xs={6} md={6} style={{ textAlign: 'right' }}>
          <Button
            disabled={!activeCharts || activeCharts.length === 0}
            onClick={verPdfModal}
            startIcon={
              <span className="material-icons" style={{ fontSize: '34px' }}>
                local_printshop
              </span>
            }
          ></Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} style={{ height: '100%' }}>
        <Grid
          item
          xs={12}
          md={12}
          lg={4}
          xl={3}
          sx={{ maxHeight: 650, overflow: 'auto' }}
        >
          <Paper
            elevation={4}
            style={{
              maxWidth: '100%',
              maxHeight: '650px',
              textAlign: 'center',
            }}
          >
            {filteredInfoSectorData.map((item) => (
              <Grid key={item.id}>
                <Typography
                  variant="h6"
                  style={{
                    backgroundColor: '#50C0B2',
                    padding: '8px',
                    color: 'white',
                    textAlign: 'center',
                    width: '100%',
                    fontSize: '16px',
                  }}
                >
                  {item.nombre}
                </Typography>
                {filtrarVariablesRepetidas(item.variables).map((subItem) => (
                  <Grid container alignItems="center" key={subItem.id}>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        style={{ fontSize: '14px' }}
                      >
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
                              activeSwitchesCount >= 1 &&
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
          </Paper>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={8} xl={9}>
          {activeCharts.length > 0 ? (
            activeCharts.map((chartName) => (
              <Paper
                key={chartName}
                elevation={4}
                sx={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'black',
                  height: '600px',
                  overflow: 'auto',
                  position: 'relative',
                }}
              >
                <IconButton
                  aria-label="close"
                  onClick={() => handlePaperClick(chartName)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    zIndex: 10,
                  }}
                >
                  <Fullscreen />
                </IconButton>

                <TipoGraficoComponent
                  type={graficosPorVariable[chartName]}
                  data={chartData[chartName]}
                  title={chartName}
                  subTitle=""
                  onExport={(image: string) =>
                    setChartImage((prevImages) => ({
                      ...prevImages,
                      [chartName]: image,
                    }))
                  }
                />
              </Paper>
            ))
          ) : (
            <Paper
              sx={{
                padding: '20px',
                textAlign: 'center',
                color: 'black',
                height: '600px',
                overflow: 'auto',
                position: 'relative',
              }}
            >
              <Typography variant="h6" color="textSecondary">
                No hay variables seleccionadas para mostrar el gráfico.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default ComparativaCategoria
