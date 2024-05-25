import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  RefObject,
  createRef,
} from 'react'
import Grid from '@mui/material/Grid'
import {
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material'
import { styled } from '@mui/system'
import ChartComponent from '@/components/echarts/chartComponent'
import { transformDataForChartByEntidad } from '../../dataUtils/chartsUtil'
import { DatoRegistro, SubSector } from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import ModalReporteGeneral from '../../reporte/ui/modalReporteGeneral'
import { delay } from '@/utils'
import html2canvas from 'html2canvas'

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
  const [switchOrder, setSwitchOrder] = useState<string[]>([])
  const [capturedImages, setCapturedImages] = useState<{
    [key: string]: string
  }>({})

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

  const activePaperRefs = useRef<{
    [key: string]: RefObject<HTMLDivElement>[]
  }>({})
  console.log('🚀🚀🚀 : activePaperRefs', activePaperRefs)
  const toggleSwitch = (itemName: string) => {
    setSwitchStates((prevState) => {
      const newState = {
        ...prevState,
        [itemName]: !prevState[itemName],
      }

      if (newState[itemName]) {
        if (!activePaperRefs.current[itemName]) {
          activePaperRefs.current[itemName] = Array.from({ length: 2 }).map(
            () => createRef()
          )
        }
        setSwitchOrder((prevOrder) => [...prevOrder, itemName])
      } else {
        delete activePaperRefs.current[itemName]
        setSwitchOrder((prevOrder) =>
          prevOrder.filter((item) => item !== itemName)
        )
      }

      return newState
    })
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
    const newActiveCharts = switchOrder.filter(
      (itemName) => switchStates[itemName]
    )
    setActiveCharts(newActiveCharts.slice(0, 2))
  }, [switchStates, switchOrder])

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

  const dataReporteGraficos = infoSectorData
    .filter((sector) => sector.tipoDatoGeneral === false)
    .map((element) => ({
      id: element.id,
      nombre: element.nombre,
      icono: element.icono,
      variables: element.variables
        .filter((variable) => switchStates[variable.nombre])
        .map((variable) => ({
          ...variable,
          items: variable.items.map((item) => ({
            ...item,
            datoRegistro: variable.entidadVariables.find(
              (entidad) => entidad.datoRegistro.recurso === item.nombre
            )?.datoRegistro,
          })),
        }))
        .filter((variable) => variable.items.length > 0),
    }))
    .filter((element) => element.variables.length > 0)
  const [modalPdf, setModalPdf] = useState(false)

  const verPdfModal = async () => {
    const images: { [key: string]: string } = {}
    for (const key in activePaperRefs.current) {
      if (activePaperRefs.current.hasOwnProperty(key)) {
        const refs = activePaperRefs.current[key]
        for (const ref of refs) {
          if (ref.current) {
            const canvas = await html2canvas(ref.current)
            const imgData = canvas.toDataURL('image/png')
            images[key] = imgData
          }
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

  return (
    <>
      <Button
        onClick={verPdfModal}
        variant="outlined"
        startIcon={<span className="material-icons">visibility</span>}
      >
        Ver pdf
      </Button>
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
              const activeChartKey = activeCharts[Math.floor(index / 2)]
              const isActive = activeChartKey && switchStates[activeChartKey]

              if (isActive) {
                const itemName = activeChartKey
                if (!activePaperRefs.current[itemName]) {
                  activePaperRefs.current[itemName] = Array.from({
                    length: 2,
                  }).map(() => createRef())
                }

                return (
                  <Grid item xs={12} sm={6} key={index} sx={{ height: '50%' }}>
                    <Item
                      ref={activePaperRefs.current[itemName][index % 2]}
                      elevation={4}
                      sx={{ height: '100%' }}
                    >
                      {chartDataForPaper ? (
                        <ChartComponent
                          type={
                            graficosPorVariable[
                              activeCharts[Math.floor(index / 2)]
                            ]
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
              } else {
                return null
              }
            })}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default ComparativaComponent
