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
  styled,
  Switch,
  Typography,
} from '@mui/material'
import { SubSector, ChartData } from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { delay } from '@/utils'
import { transformDataForChart } from '../../dataUtils/transformDataForChart'
import TipoGraficoComponent from '@/components/echarts/TipoGraficoComponent'
import {
  filterDatoGeneralReporte,
  filterDatoGeneralVista,
} from '../../dataUtils/filtros/filterDatosGenerales'
import { generarDataReporteGraficos } from '../../dataUtils/reportes/generateDataReporteGraficos'
import ModalReporteGeneralMapa from '../../reporte/ui/modalReportes/modalReporteGeneralMapa'
import CloseIcon from '@mui/icons-material/Close'
import { Fullscreen } from '@mui/icons-material'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
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
    [key: string]: { name: string; data: ChartData[] }[]
  }>({})
  const [activeCharts, setActiveCharts] = useState<string[]>([])
  const [chartImage, setChartImage] = useState<{ [key: string]: string }>({})
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [modalChartOpen, setModalChartOpen] = useState(false)

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
    const initialState: { [key: string]: boolean } = {}
    let count = 0
    filteredInfoSectorData.forEach((sector) => {
      const filteredVariables = filtrarVariablesRepetidas(sector.variables)
      filteredVariables.forEach((variable) => {
        if (count < 4) {
          initialState[variable.nombre] = true
          count++
        } else {
          initialState[variable.nombre] = false
        }
      })
    })
    setSwitchStates(initialState)
  }, [infoSectorData])

  useEffect(() => {
    const newData: { [key: string]: { name: string; data: ChartData[] }[] } = {}

    filteredInfoSectorData.forEach((sector) => {
      const filteredVariables = filtrarVariablesRepetidas(sector.variables)
      filteredVariables.forEach((variable) => {
        if (switchStates[variable.nombre]) {
          newData[variable.nombre] = transformDataForChart(
            filteredInfoSectorData,
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
  }, [switchStates, infoSectorData])

  const toggleSwitch = (itemName: string) => {
    const newSwitchStates = { ...switchStates }
    newSwitchStates[itemName] = !newSwitchStates[itemName]
    const activeCount = Object.values(newSwitchStates).filter(Boolean).length

    if (activeCount <= 4) {
      setSwitchStates(newSwitchStates)
    }

    if (newSwitchStates[itemName]) {
      setChartImage((prevState) => ({ ...prevState, [itemName]: '' }))
    } else {
      setChartImage((prevState) => {
        const { [itemName]: omit, ...rest } = prevState
        return rest
      })
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
            Seleccione hasta 4 variables para su visualización
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
            {activeCharts.map((chartName) => (
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
                key={chartName}
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
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default SectorComponent
