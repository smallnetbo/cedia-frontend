import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Grid from '@mui/material/Grid'
import {
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
} from '@mui/material'
import { SubSector } from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import CloseIcon from '@mui/icons-material/Close'
import { Fullscreen } from '@mui/icons-material'
import { delay } from '@/utils'
import {
  filterDatoGeneralReporte,
  filterDatoGeneralVista,
} from '../../dataUtils/filtros/filterDatosGenerales'
import { generarDataReporteGraficos } from '../../dataUtils/reportes/generateDataReporteGraficos'
import TipoGraficoComponent from '@/components/echarts/TipoGraficoComponent'
import ModalReporteGeneralMapa from '../../reporte/ui/modalReportes/modalReporteGeneralMapa'
import { transformDataForChart } from '../../dataUtils/transformDataForChart'

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

  const [modalPdf, setModalPdf] = useState(false)
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [modalChartOpen, setModalChartOpen] = useState(false)

  useEffect(() => {
    const initialSwitchStates = infoSectorData.reduce(
      (acc, sector) => {
        sector.variables.forEach((variable) => {
          acc[variable.nombre] = false
        })
        return acc
      },
      {} as { [key: string]: boolean }
    )
    setSwitchStates(initialSwitchStates)
  }, [infoSectorData])

  const toggleSwitch = useCallback((itemId: string) => {
    setSwitchStates((prevStates) => ({
      ...prevStates,
      [itemId]: !prevStates[itemId],
    }))
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

  const transformedData = useMemo(() => {
    return activeVariables
      .map((variable) =>
        transformDataForChart(filteredInfoSectorData, variable)
      )
      .flat()
  }, [filteredInfoSectorData, activeVariables])
  const combinedTransformedData = useMemo(() => {
    return transformedData.flat()
  }, [transformedData])

  const dataReporteGraficos = useMemo(
    () => generarDataReporteGraficos(filteredInfoSectorData, switchStates),
    [filteredInfoSectorData, switchStates]
  )

  const handlePaperClick = (chartData: string) => {
    setSelectedChart(chartData)
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
          infoEntidadData={filteredDatosGeneralesReporte}
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
                type="Dispersión"
                data={combinedTransformedData}
                title={activeCharts.join(' - ')}
                subTitle=""
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Grid container alignItems="center">
        <Grid item xs={6} md={6}>
          <Typography variant="body1">
            Seleccione 2 variables para su visualización
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
          <Paper
            elevation={4}
            style={{
              maxWidth: '100%',
              //maxHeight: '650px',
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
                {item.variables.map((subItem) => (
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
                            checked={switchStates[subItem.id] || false}
                            onChange={() => toggleSwitch(subItem.id)}
                            disabled={
                              activeVariables.length >= 2 &&
                              !switchStates[subItem.id]
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
              position: 'relative',
            }}
          >
            <IconButton
              aria-label="fullscreen"
              onClick={() => handlePaperClick(activeCharts.join(' - '))}
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
                zIndex: 10,
              }}
            >
              <Fullscreen />
            </IconButton>
            {transformedData.length > 0 ? (
              <TipoGraficoComponent
                type="Dispersión"
                data={combinedTransformedData}
                title=""
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
