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

  const [activeItems, setActiveItems] = useState<string[]>([])
  const [chartImage, setChartImage] = useState<{ [key: string]: string }>({})

  const [modalPdf, setModalPdf] = useState(false)
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const [modalChartOpen, setModalChartOpen] = useState(false)

  useEffect(() => {
    const initialSwitchStates = infoSectorData.reduce(
      (acc, sector) => {
        sector.variables.forEach((variable) => {
          variable.items.forEach((item) => {
            acc[item.id] = false
          })
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

  const activeItemsList = useMemo(
    () => Object.keys(switchStates).filter((itemId) => switchStates[itemId]),
    [switchStates]
  )

  useEffect(() => {
    const newActiveItems = activeItemsList.slice(0, 2)
    setActiveItems(newActiveItems)

    setChartImage((prevImages) => {
      const newImages = { ...prevImages }
      Object.keys(prevImages).forEach((key) => {
        if (!newActiveItems.includes(key)) {
          delete newImages[key]
        }
      })
      return newImages
    })
  }, [activeItemsList])

  const verPdfModal = async () => {
    setModalPdf(true)
  }

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

  const transformedData = useMemo(() => {
    return transformDataForChart(filteredInfoSectorData, activeItems)
  }, [filteredInfoSectorData, activeItems])

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
        {/* <ModalReporteGeneralMapa
          infoEntidadData={filteredDatosGeneralesReporte}
          dataReporteGraficos={dataReporteGraficos}
          chartImages={chartImage}
        /> */}
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
                title=""
                subTitle=""
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Grid container alignItems="center">
        <Grid item xs={6} md={6}>
          <Typography variant="body1">
            Seleccione 2 items para su visualización
          </Typography>
        </Grid>
        <Grid item xs={6} md={6} style={{ textAlign: 'right' }}>
          <Button
            disabled={activeItems.length === 0}
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
              textAlign: 'center',
            }}
          >
            {filteredInfoSectorData.map((sector) => (
              <Grid key={sector.id}>
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
                  {sector.nombre}
                </Typography>
                {sector.variables.map((variable) => (
                  <Grid key={variable.id}>
                    <Typography
                      variant="subtitle1"
                      style={{
                        backgroundColor: '#f0f0f0',
                        padding: '4px',
                        textAlign: 'center',
                        width: '100%',
                        fontSize: '14px',
                      }}
                    >
                      {variable.nombre}
                    </Typography>
                    {variable.items.map((item) => (
                      <Grid container alignItems="center" key={item.id}>
                        <Grid item xs={6}>
                          <Typography
                            variant="caption"
                            style={{ fontSize: '14px' }}
                          >
                            {item.nombre}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} style={{ textAlign: 'right' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={switchStates[item.id] || false}
                                onChange={() => toggleSwitch(item.id)}
                                disabled={
                                  activeItems.length >= 2 &&
                                  !switchStates[item.id]
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
              onClick={() => handlePaperClick(activeItems.join(' - '))}
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
                  const combinedName = activeItems.join(' & ')
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
