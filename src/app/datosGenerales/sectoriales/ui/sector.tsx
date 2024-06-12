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
import {
  SubSector,
  DatoRegistro,
  ChartData,
} from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import ModalReporteGeneral from '../../reporte/ui/modalReporteGeneral'
import { delay } from '@/utils'
import { transformDataForChart } from '../../dataUtils/transformDataForChart'
import TipoGraficoComponent from '@/components/echarts/TipoGraficoComponent'
import {
  filterDatoGeneralReporte,
  filterDatoGeneralVista,
} from '../../dataUtils/filtros/filterDatosGenerales'
import { generarDataReporteGraficos } from '../../dataUtils/reportes/generateDataReporteGraficos'

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
  const [chartImage, setChartImage] = useState<{
    [key: string]: string | null
  }>({})

  const filteredInfoSectorData = filterDatoGeneralVista(infoSectorData)

  const dataDatosGenerales = filterDatoGeneralReporte(infoSectorData)

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

    if (newSwitchStates[itemName]) {
      setChartImage((prevState) => ({ ...prevState, [itemName]: null }))
    } else {
      setChartImage((prevState) => {
        const { [itemName]: omit, ...rest } = prevState
        return rest
      })
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

  return (
    <>
      <CustomDialog
        isOpen={modalPdf}
        handleClose={cerrarModalPdf}
        title="VISTA PREVIA PDF"
        maxWidth="lg"
      >
        <ModalReporteGeneral
          infoEntidadData={dataDatosGenerales}
          dataReporteGraficos={dataReporteGraficos}
          chartImages={chartImage}
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
                  elevation={4}
                  style={{
                    textAlign: 'center',
                    backgroundColor: 'white',
                    transition: 'transform 0.3s ease-in-out',
                    height: '100%',
                  }}
                >
                  <TipoGraficoComponent
                    type={graficosPorVariable[chartName]}
                    data={chartData[chartName]}
                    title={chartName}
                    subTitle=""
                    onExport={(image) =>
                      setChartImage((prevImages) => ({
                        ...prevImages,
                        [chartName]: image,
                      }))
                    }
                    setChartImage={setChartImage}
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
