import React, { useEffect, useRef, useState } from 'react'
import Grid from '@mui/material/Grid'
import {
  Button,
  FormControlLabel,
  Paper,
  styled,
  Switch,
  Typography,
} from '@mui/material'
import html2canvas from 'html2canvas'
import {
  SubSector,
  DatoRegistro,
  ChartData,
} from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import ModalReporteGeneral from '../../reporte/ui/modalReporteGeneral'
import { delay } from '@/utils'
import ChartComponent from '@/components/echarts/chartComponent'

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

const SectorComponent = ({ infoSectorData }: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [modalPdf, setModalPdf] = useState(false)
  const [chartData, setChartData] = useState<{
    [key: string]: { name: string; data: { datoRegistro: DatoRegistro }[] }[]
  }>({})

  const [activeCharts, setActiveCharts] = useState<string[]>([])
  const [capturedImages, setCapturedImages] = useState<{
    [key: string]: string
  }>({})
  const paperRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const filteredInfoSectorData = infoSectorData.filter(
    (sector) => sector.tipoDatoGeneral === false
  )
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
  }, [])

  useEffect(() => {
    const newData: { [key: string]: ChartData[] } = {}

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
  }, [switchStates])

  useEffect(() => {
    const newActiveCharts = Object.keys(switchStates).filter(
      (itemName) => switchStates[itemName]
    )
    setActiveCharts(newActiveCharts.slice(0, 4))
  }, [switchStates])

  const toggleSwitch = (itemName: string) => {
    const newSwitchStates = { ...switchStates }
    newSwitchStates[itemName] = !newSwitchStates[itemName]
    const activeCount = Object.values(newSwitchStates).filter(Boolean).length

    if (activeCount <= 4) {
      setSwitchStates(newSwitchStates)
    }
  }
  const graficosPorVariable = filteredInfoSectorData.reduce(
    (acumulador: GraficosPorVariable, subSector) => {
      subSector.variables.forEach((variable) => {
        acumulador[variable.nombre] = variable.graficos.tipoGrafico.descripcion
      })
      return acumulador
    },
    {}
  )
  const transformDataForChart = (data: SubSector[], variableName: string) => {
    const formattedChartData: {
      name: string
      data: { chartData: ChartData }[]
    }[] = []

    data.forEach((category) => {
      category.variables.forEach((variable) => {
        if (variable.nombre === variableName) {
          const items = variable.items
          const entidadVariables = variable.entidadVariables

          entidadVariables.forEach((entidad) => {
            const registro = entidad.datoRegistro

            items.forEach((item) => {
              const itemName = item.nombre
              const itemColor = item.color
              const itemIcono = item.icono
              const value = registro[itemName.toLowerCase()]
              if (value !== undefined) {
                const formattedData: { chartData: ChartData }[] = [
                  {
                    chartData: {
                      nombre: itemName,
                      valor: Number(value),
                      color: itemColor,
                      icono: itemIcono,
                    },
                  },
                ]

                formattedChartData.push({
                  name: itemName,
                  data: formattedData,
                })
              }
            })
          })
        }
      })
    })

    return formattedChartData
  }

  const verPdfModal = async () => {
    const images: { [key: string]: string } = {}
    for (const key in paperRefs.current) {
      if (paperRefs.current.hasOwnProperty(key)) {
        const ref = paperRefs.current[key]
        if (ref) {
          const canvas = await html2canvas(ref, {
            backgroundColor: '#fff',
            useCORS: true,
          })
          const imgData = canvas.toDataURL('image/png')
          images[key] = imgData
        }
      }
    }
    setCapturedImages(images)
    setModalPdf(true)
  }

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  const dataReporteGraficos = infoSectorData
    ?.filter((element) => element.tipoDatoGeneral === true)
    .map((element) => ({
      id: element.id,
      nombre: element.nombre,
      icono: element.icono,
      variables: element.variables
        .map((variable) => {
          const items = variable.items
            .map((item) => {
              const entidadVariable = variable.entidadVariables.find(
                (entidad) =>
                  entidad.datoRegistro[item.nombre.toLowerCase()] !== undefined
              )

              const datoRegistro = entidadVariable
                ? entidadVariable.datoRegistro[item.nombre.toLowerCase()]
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
        <ModalReporteGeneral
          infoEntidadData={infoSectorData}
          dataReporteGraficos={dataReporteGraficos}
          chartImages={capturedImages}
          accionCorrecta={() => {
            cerrarModalPdf().finally()
          }}
          accionCancelar={cerrarModalPdf}
        />
      </CustomDialog>

      <Grid container alignItems="center">
        <Grid item xs={6} md={6}>
          <Typography variant={'body1'}>
            Seleccione hasta 4 variables para su visualización
          </Typography>
        </Grid>
        <Grid item xs={6} md={6} style={{ textAlign: 'right' }}>
          <Button
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
            {activeCharts.map((chartName, index) => (
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={6}
                xl={6}
                style={{
                  minHeight: '320px',
                  display: 'block',
                }}
                key={index}
              >
                <Paper
                  ref={(el) => (paperRefs.current[chartName] = el)}
                  elevation={4}
                  style={{
                    textAlign: 'center',
                    backgroundColor: 'white',
                    transition: 'transform 0.3s ease-in-out',
                    height: '100%',
                  }}
                >
                  <ChartComponent
                    type={graficosPorVariable[chartName]}
                    data={chartData[chartName]}
                    title={chartName}
                    subTitle=""
                  />
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
