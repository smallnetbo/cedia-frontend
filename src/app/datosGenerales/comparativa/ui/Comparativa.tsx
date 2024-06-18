import React, { useEffect, useState } from 'react'
import {
  Grid,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material'
import { styled } from '@mui/system'
import { transformDataForChartByEntidad } from '../../dataUtils/chartsUtil'
import { SubSector, DatoRegistro } from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import TipoGraficoComponent from '@/components/echarts/TipoGraficoComponent'
import ModalReporteGeneral from '../../reporte/ui/modalReportes/modalReporteGeneralMapa'
import { delay } from '@/utils'
import ModalReporteGeneralMapa from '../../reporte/ui/modalReportes/modalReporteGeneralMapa'

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
  const [modalPdf, setModalPdf] = useState(false)
  const [chartImage, setChartImage] = useState<{ [key: string]: string[] }>({})

  const filteredInfoSectorData = infoSectorData.filter(
    (sector) => !sector.vistasVisualizadas.datosGenerales
  )
  const dataDatosGenerales = infoSectorData.filter(
    (sector) => sector.vistasVisualizadas.datosGenerales
  )

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
    const initialState: { [key: string]: boolean } = {}
    const uniqueEntidades: Set<string> = new Set()

    infoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        initialState[variable.nombre] = false
        variable.entidadVariables.forEach((entidadVariable) => {
          uniqueEntidades.add(entidadVariable.entidad.nombre)
        })
      })
    })

    setSwitchStates(initialState)
    setEntidades(Array.from(uniqueEntidades))
  }, [infoSectorData])

  useEffect(() => {
    const newData: {
      [key: string]: {
        [entidad: string]: {
          name: string
          data: { datoRegistro: DatoRegistro }[]
        }[]
      }
    } = {}

    infoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        if (switchStates[variable.nombre]) {
          newData[variable.nombre] = entidades.reduce((acc, entidad) => {
            acc[entidad] = transformDataForChartByEntidad(
              infoSectorData,
              variable.nombre,
              entidad
            )
            return acc
          }, {})
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

  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  const dataReporteGraficos = filteredInfoSectorData
    .map((element) => ({
      id: element.id,
      nombre: element.nombre,
      icono: element.icono,
      variables: element.variables
        .filter((variable) => switchStates[variable.nombre])
        .map((variable) => {
          const items = variable.items
            .map((item) => {
              const entidadVariable = variable.entidadVariables.find(
                (entidad) =>
                  entidad.datoRegistro[item.nombreCorto] !== undefined
              )

              const datoRegistro = entidadVariable
                ? entidadVariable.datoRegistro[item.nombreCorto]
                : undefined

              return {
                ...item,
                datoRegistro:
                  datoRegistro !== undefined
                    ? { nombre: item.nombre, valor: datoRegistro }
                    : undefined,
              }
            })
            .filter((item) => item.datoRegistro !== undefined)

          return {
            ...variable,
            items,
          }
        })
        .filter((variable) => variable.items.length > 0),
    }))
    .filter((element) => element.variables.length > 0)

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
                    key={index}
                  >
                    <Paper
                      elevation={4}
                      style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: 'black',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease-in-out',
                        height: '100%',
                      }}
                    >
                      {chartDataForPaper && (
                        <TipoGraficoComponent
                          type={graficosPorVariable[activeChartKey]}
                          data={chartDataForPaper}
                          title={entidad + ' ' + activeChartKey}
                          subTitle=""
                          onExport={(image) =>
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
