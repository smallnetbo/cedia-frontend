import React, { useEffect, useState } from 'react'
import {
  Grid,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Fullscreen } from '@mui/icons-material'
import { SubSector, ChartData } from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import TipoGraficoComponent from '@/components/echarts/TipoGraficoComponent'
import { delay } from '@/utils'
import ModalReporteGeneralMapa from '../../reporte/ui/modalReportes/modalReporteGeneralMapa'
import { generarDataReporteGraficos } from '../../dataUtils/reportes/generateDataReporteGraficos'
import {
  filterDatoGeneralReporte,
  filterDatoGeneralVista,
} from '../../dataUtils/filtros/filterDatosGenerales'
import { transformDataForChartByEntidad } from '../../dataUtils/transformDataForChartByEntidad'

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
  const [chartData, setChartData] = useState<{
    [key: string]: {
      [entidad: string]: {
        name: string
        data: ChartData[]
      }[]
    }
  }>({})
  const [activeCharts, setActiveCharts] = useState<string[]>([])
  const [entidades, setEntidades] = useState<string[]>([])
  const [modalPdf, setModalPdf] = useState(false)
  const [chartImage, setChartImage] = useState<{ [key: string]: string[] }>({})
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [selectedEntidad, setSelectedEntidad] = useState<string | null>(null)
  const [modalChartOpen, setModalChartOpen] = useState(false)

  const filteredInfoSectorData = filterDatoGeneralVista(infoSectorData)
  const dataDatosGenerales = filterDatoGeneralReporte(infoSectorData)

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
    const initialState = createInitialState(infoSectorData)
    const uniqueEntidades = extractUniqueEntidades(infoSectorData)

    setSwitchStates(initialState)
    setEntidades(uniqueEntidades)
  }, [infoSectorData])

  const createInitialState = (data: SubSector[]) => {
    const initialState: { [key: string]: boolean } = {}
    data.forEach((sector) => {
      sector.variables.forEach((variable) => {
        initialState[variable.nombre] = false
      })
    })
    return initialState
  }

  const extractUniqueEntidades = (data: SubSector[]): string[] => {
    const uniqueEntidades: Set<string> = new Set()
    data.forEach((sector) => {
      sector.variables.forEach((variable) => {
        variable.entidadVariables.forEach((entidadVariable) => {
          uniqueEntidades.add(entidadVariable.entidad.nombre)
        })
      })
    })
    return Array.from(uniqueEntidades)
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

    infoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        if (switchStates[variable.nombre]) {
          newData[variable.nombre] = entidades.reduce(
            (acc, entidad) => {
              acc[entidad] = transformDataForChartByEntidad(
                infoSectorData,
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
      })
    })

    setChartData(newData)
  }, [switchStates, entidades, infoSectorData])

  useEffect(() => {
    const newActiveCharts = Object.keys(switchStates)
      .filter((itemName) => switchStates[itemName])
      .slice(0, 2)
    setActiveCharts(newActiveCharts)
  }, [switchStates])

  const toggleSwitch = (itemName: string) => {
    const newSwitchStates = { ...switchStates }
    const wasActivated = newSwitchStates[itemName]
    newSwitchStates[itemName] = !wasActivated
    const activeCount = Object.values(newSwitchStates).filter(Boolean).length

    if (activeCount <= 2) {
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

  const verPdfModal = () => {
    setModalPdf(true)
  }

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

  const handlePaperClick = (chartName: string, entidad: string) => {
    setSelectedChart(chartName)
    setSelectedEntidad(entidad)
    setModalChartOpen(true)
  }

  const closeModalChart = () => {
    setModalChartOpen(false)
    setSelectedChart(null)
    setSelectedEntidad(null)
  }

  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  const dataReporteGraficos: SubSector[] = generarDataReporteGraficos(
    filteredInfoSectorData,
    switchStates
  )

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
          {selectedChart} - {selectedEntidad}
          <IconButton
            aria-label="close"
            onClick={closeModalChart}
            style={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedChart && selectedEntidad && (
            <div style={{ height: '70vh' }}>
              <TipoGraficoComponent
                type={graficosPorVariable[selectedChart]}
                data={chartData[selectedChart][selectedEntidad]}
                title={`${selectedEntidad} ${selectedChart}`}
                subTitle=""
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Grid container alignItems="center">
        <Grid item xs={6} md={6}>
          <Typography variant={'body1'}>
            Seleccione hasta 2 variables para su visualización
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
          <Paper elevation={4} style={{ maxWidth: '100%', padding: '8px' }}>
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
          </Paper>
        </Grid>
        <Grid item xs={12} md={12} lg={8} xl={9}>
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, index) => {
              const activeChartKey = activeCharts[Math.floor(index / 2)]
              const entidad = entidades[index % 2]
              const chartDataForPaper =
                activeChartKey && switchStates[activeChartKey]
                  ? chartData[activeChartKey]?.[entidad] || []
                  : null
              const isActive = chartDataForPaper !== null
              const key = `${activeChartKey}-${entidad}-${index}`
              return (
                isActive && (
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={6}
                    xl={6}
                    style={{ minHeight: '320px', display: 'block' }}
                    key={key}
                  >
                    <Paper
                      elevation={4}
                      style={{
                        textAlign: 'center',
                        backgroundColor: 'white',
                        transition: 'transform 0.3s ease-in-out',
                        height: '100%',
                        position: 'relative',
                      }}
                    >
                      <IconButton
                        aria-label="close"
                        onClick={() =>
                          handlePaperClick(activeChartKey, entidad)
                        }
                        style={{
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          zIndex: 10,
                        }}
                      >
                        <Fullscreen />
                      </IconButton>
                      {chartDataForPaper && (
                        <TipoGraficoComponent
                          type={graficosPorVariable[activeChartKey]}
                          data={chartDataForPaper}
                          title={`${entidad} ${activeChartKey}`}
                          subTitle=""
                          onExport={(image: string) =>
                            setChartImage((prevImages) => ({
                              ...prevImages,
                              [activeChartKey]: prevImages[activeChartKey]
                                ? [...prevImages[activeChartKey], image]
                                : [image],
                            }))
                          }
                        />
                      )}
                      {!chartDataForPaper && (
                        <Typography variant="h6">
                          Gráfico Placeholder {index + 1}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                )
              )
            })}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default ComparativaComponent
