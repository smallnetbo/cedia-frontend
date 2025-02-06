/* eslint-disable require-await */
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
  Box,
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
import { transformDataForCruceVariable } from '../../dataUtils/transformDataForCruceVariable'

interface InformacionInterface {
  infoSectorData: SubSector[]
}

const CruceVariableComponent = ({ infoSectorData }: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [selectedTitles, setSelectedTitles] = useState<string[]>([])

  const [switchStatesVariable, setSwitchStatesVariable] = useState<{
    [key: string]: boolean
  }>({})
  const filteredInfoSectorData = useMemo(() => {
    const filteredData = filterDatoGeneralVista(infoSectorData)
    return filteredData
      .map((sector) => ({
        ...sector,
        variables: sector.variables
          .map((variable) => ({
            ...variable,
            items: variable.items.filter((item) => item.cruceVariable === true),
          }))
          .filter((variable) => variable.items.length > 0),
      }))
      .filter((sector) => sector.variables.length > 0)
  }, [infoSectorData])

  const filteredDatosGeneralesReporte = useMemo(
    () => filterDatoGeneralReporte(infoSectorData),
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
          acc[variable.nombre] = false
        })
        return acc
      },
      {} as { [key: string]: boolean }
    )
    setSwitchStates(initialSwitchStates)
  }, [infoSectorData])

  const toggleSwitch = useCallback(
    (itemId: string, idVariable: string) => {
      setSwitchStates((prevStates) => ({
        ...prevStates,
        [itemId]: !prevStates[itemId],
      }))

      setSwitchStatesVariable((prevStates) => ({
        ...prevStates,
        [idVariable]: !prevStates[idVariable],
      }))

      setSelectedTitles((prevTitles) => {
        const sector = infoSectorData.find((sector) =>
          sector.variables.some((variable) =>
            variable.items.some((item) => item.id === itemId)
          )
        )

        const variable = sector?.variables.find((v) =>
          v.items.some((item) => item.id === itemId)
        )

        const item = variable?.items.find((i) => i.id === itemId)

        if (sector && variable && item) {
          const newTitle = `${sector.nombre} / ${variable.nombre} / ${item.nombre}`

          if (prevTitles.includes(newTitle)) {
            return prevTitles.filter((title) => title !== newTitle)
          }

          return [...prevTitles, newTitle].slice(0, 2)
        }

        return prevTitles
      })
    },
    [infoSectorData]
  )

  const activeItemsList = useMemo(
    () => Object.keys(switchStates).filter((itemId) => switchStates[itemId]),
    [switchStates]
  )

  useEffect(() => {
    const newActiveItems = activeItemsList
      .slice(0, 2)
      .map((itemId) => {
        const variable = infoSectorData
          .flatMap((sector) => sector.variables)
          .find((variable) => variable.items.some((item) => item.id === itemId))
        return variable ? variable.id : ''
      })
      .filter((id) => id)

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
  }, [activeItemsList, infoSectorData])

  const verPdfModal = async () => {
    setModalPdf(true)
  }

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

  const transformedData = useMemo(() => {
    return activeItemsList
      .map((items) =>
        transformDataForCruceVariable(filteredInfoSectorData, items)
      )
      .flat()
  }, [filteredInfoSectorData, activeItemsList])

  const combinedTransformedData = useMemo(() => {
    return transformedData.flat()
  }, [transformedData])

  const dataReporteGraficos = useMemo(
    () =>
      generarDataReporteGraficos(filteredInfoSectorData, switchStatesVariable),
    [filteredInfoSectorData, switchStatesVariable]
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
          isCruceVariable={true}
          tituloReporte={selectedTitles.join(' vs ')}
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

      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Sección de Switches */}
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
            sx={{
              maxWidth: '100%',
              textAlign: 'center',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'white',
            }}
          >
            {filteredInfoSectorData.length === 0 ? (
              <Box
                sx={{
                  padding: '24px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: '#333', fontWeight: 600, mt: 1 }}
                >
                  No hay datos disponibles
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mt: 1 }}>
                  Activa al menos un ítem para visualizar contenido.
                </Typography>
              </Box>
            ) : (
              filteredInfoSectorData.map((sector) => (
                <Box key={sector.id} sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      backgroundColor: '#50C0B2',
                      padding: '8px',
                      color: 'white',
                      textAlign: 'center',
                      width: '100%',
                      borderRadius: '8px',
                    }}
                  >
                    {sector.nombre}
                  </Typography>
                  {sector.variables.map((variable) => (
                    <Box
                      key={variable.id}
                      sx={{
                        mt: 1,
                        p: 2,
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9',
                        boxShadow: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 500,
                          textAlign: 'center',
                          color: '#333',
                        }}
                      >
                        {variable.nombre}
                      </Typography>
                      {variable.items.map((item) => (
                        <Grid
                          container
                          alignItems="center"
                          key={item.id}
                          sx={{ p: 1 }}
                        >
                          <Grid item xs={6}>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: '14px', color: '#444' }}
                            >
                              {item.nombre}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={switchStates[item.id] || false}
                                  onChange={() =>
                                    toggleSwitch(item.id, variable.id)
                                  }
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
                    </Box>
                  ))}
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Sección de Gráficos */}
        <Grid item xs={12} md={12} lg={8} xl={9}>
          <Paper
            elevation={4}
            sx={{
              padding: 3,
              textAlign: 'center',
              color: 'black',
              height: '600px',
              overflow: 'auto',
              position: 'relative',
              borderRadius: '12px',
              backgroundColor: 'white',
            }}
          >
            <IconButton
              aria-label="fullscreen"
              disabled={activeItems.length === 0}
              onClick={() => handlePaperClick(activeItems.join(' - '))}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                zIndex: 10,
                backgroundColor: '#eee',
                '&:hover': { backgroundColor: '#ddd' },
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
              <Box
                sx={{
                  padding: '24px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: '#333', fontWeight: 600, mt: 1 }}
                >
                  No hay datos para mostrar
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mt: 1 }}>
                  Activa al menos un ítem para visualizar el gráfico.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default CruceVariableComponent
