import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Grid from '@mui/material/Grid'
import {
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material'
import { SubSector, ChartData } from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { delay } from '@/utils'
import {
  filterDatoGeneralReporte,
  filterDatoGeneralVista,
} from '../../dataUtils/filtros/filterDatosGenerales'
import { generarDataReporteGraficos } from '../../dataUtils/reportes/generateDataReporteGraficos'
import TipoGraficoComponent from '@/components/echarts/TipoGraficoComponent'
import ModalReporteGeneralMapa from '../../reporte/ui/modalReportes/modalReporteGeneralMapa'
import ModalReporteCruceVariable from '../../reporte/ui/modalReportes/ModalReporteCruceVariable'

interface CombinedData {
  sector: string
  variable: string
  datos: ChartData[]
}

interface InformacionInterface {
  infoSectorData: SubSector[]
}

const CruceVariableComponent = ({ infoSectorData }: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const filteredInfoSectorData = useMemo(
    () => filterDatoGeneralVista(infoSectorData),
    [infoSectorData]
  )
  const filteredDatosGeneralesReporte = useMemo(
    () => filterDatoGeneralReporte(infoSectorData),
    [infoSectorData]
  )

  const [activeCharts, setActiveCharts] = useState<string[]>([])
  const [chartImage, setChartImage] = useState<{ [key: string]: string }>({})
  console.log('🚀🚀🚀 : chartImage', chartImage)

  const [modalPdf, setModalPdf] = useState(false)

  const toggleSwitch = useCallback((itemName: string) => {
    setSwitchStates((prevStates) => {
      const newSwitchStates = {
        ...prevStates,
        [itemName]: !prevStates[itemName],
      }
      const activeVariables = Object.keys(newSwitchStates).filter(
        (key) => newSwitchStates[key]
      )
      if (activeVariables.length > 2) {
        newSwitchStates[itemName] = false
      }
      return newSwitchStates
    })
  }, [])

  const activeVariables = useMemo(
    () =>
      Object.keys(switchStates).filter((variable) => switchStates[variable]),
    [switchStates]
  )

  useEffect(() => {
    const newActiveCharts = activeVariables.slice(0, 2)
    setActiveCharts(newActiveCharts)

    setChartImage((prevImages) => {
      const newImages = { ...prevImages }
      Object.keys(prevImages).forEach((key) => {
        if (!newActiveCharts.includes(key)) {
          delete newImages[key]
        }
      })
      return newImages
    })
  }, [activeVariables])

  const verPdfModal = async () => {
    setModalPdf(true)
  }

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

  const combinedData = useMemo<CombinedData[]>(() => {
    return filteredInfoSectorData.reduce<CombinedData[]>((acc, sector) => {
      sector.variables.forEach((variable) => {
        if (activeVariables.includes(variable.nombre)) {
          const chartDataArray: ChartData[] = []

          variable.entidadVariables.forEach((entidad) => {
            const registro = entidad.datoRegistro

            variable.items.forEach((item) => {
              const value = registro[item.nombre]

              if (value !== undefined) {
                chartDataArray.push({
                  nombre: item.nombre,
                  valor: value,
                  color: item.color,
                  icono: item.icono,
                })
              }
            })
          })

          if (chartDataArray.length > 0) {
            acc.push({
              sector: sector.nombre,
              variable: variable.nombre,
              datos: chartDataArray,
            })
          }
        }
      })
      return acc
    }, [])
  }, [filteredInfoSectorData, activeVariables])

  const dataReporteGraficos = useMemo(
    () => generarDataReporteGraficos(filteredInfoSectorData, switchStates),
    [filteredInfoSectorData, switchStates]
  )

  return (
    <>
      <CustomDialog
        isOpen={modalPdf}
        handleClose={cerrarModalPdf}
        title="VISTA PREVIA PDF"
        maxWidth="lg"
      >
        <ModalReporteCruceVariable
          infoEntidadData={filteredDatosGeneralesReporte}
          dataReporteGraficos={dataReporteGraficos}
          chartImages={chartImage}
        />
      </CustomDialog>

      <Grid container alignItems="center">
        <Grid item xs={6} md={6}>
          <Typography variant="body1">
            Seleccione hasta 2 variables para su visualización
          </Typography>
        </Grid>
        <Grid item xs={6} md={6} style={{ textAlign: 'right' }}>
          <Button
            disabled={activeCharts.length === 0}
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
          <Paper elevation={4} style={{ maxWidth: '100%', maxHeight: '650px' }}>
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
                              activeVariables.length >= 2 &&
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
          <Paper
            sx={{
              padding: '20px',
              textAlign: 'center',
              color: 'black',
              height: '600px',
              overflow: 'auto',
            }}
          >
            {combinedData.length > 0 ? (
              <TipoGraficoComponent
                type="ScatterChart"
                data={combinedData}
                title={activeCharts.join(' & ')}
                subTitle=""
                onExport={(image) => {
                  const combinedName = activeCharts.join(' & ')
                  setChartImage((prevImages) => ({
                    ...prevImages,
                    [combinedName]: image,
                  }))
                }}
              />
            ) : (
              <Typography variant="h6">
                Active un valor para visualizar gráfico
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default CruceVariableComponent
