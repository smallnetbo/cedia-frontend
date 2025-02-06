/* eslint-disable require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  styled,
} from '@mui/material'
import dynamic from 'next/dynamic'

import { Gobiernos } from '@/types/map/entidad.interface'
import { SubSector } from '../../types/datosGeneralesType'
import { formattedDataGeo } from '../../dataUtils/transformDataGeo'
import {
  filterDatoGeneralReporte,
  filterDatoGeneralVista,
} from '../../dataUtils/filtros/filterDatosGenerales'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { delay } from '@/utils'
import ModalReporteGeoreferencia, {
  EntidadesData,
} from '../../reporte/ui/modalReportes/ModalReporteGeoreferencia'
import { filterBySelectedEntidades } from '../../dataUtils/filtros/filterBySelectedEntidades'

const MapGeoreferencia = dynamic(
  () => import('@/components/map/mapaGeoreferencia'),
  {
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 650,
        }}
      >
        <CircularProgress />
      </Box>
    ),
    ssr: false,
  }
)

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

interface InformacionInterface {
  infoSectorData: SubSector[]
  selectedGobierno: Gobiernos
  selectedSector: string | undefined
}

const GeoreferenciaComponent = ({
  infoSectorData,
  selectedGobierno,
  selectedSector,
}: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [selectedEntidades, setSelectedEntidades] = useState<EntidadesData[]>(
    []
  )
  const [modalPdf, setModalPdf] = useState(false)
  const [mapImage, setMapImage] = useState<string | null>(null)

  const filteredInfoSectorData = filterDatoGeneralVista(infoSectorData)
  const dataDatosGenerales = filterDatoGeneralReporte(infoSectorData)

  const newData = formattedDataGeo(filteredInfoSectorData)

  const toggleSwitch = (
    agrupadorName: string,
    subItems: any[],
    color: string
  ) => {
    const newSwitchStates = { ...switchStates }
    newSwitchStates[agrupadorName] = !newSwitchStates[agrupadorName]

    if (newSwitchStates[agrupadorName]) {
      const updatedSelectedEntidades = subItems.map((subItem) => ({
        codigoEntidad: subItem.entidad.codigoEntidad,
        nombre: subItem.entidad.nombre,
        chartData: subItem.entidad.chartData,
        color: color,
      }))
      setSelectedEntidades((prevState) => {
        const newEntidades = updatedSelectedEntidades.filter(
          (newEntidad) =>
            !prevState.some(
              (entidad) => entidad.codigoEntidad === newEntidad.codigoEntidad
            )
        )
        return [...prevState, ...newEntidades]
      })
    } else {
      setSelectedEntidades((prevState) =>
        prevState.filter(
          (entidad) =>
            !subItems.some(
              (subItem) =>
                entidad.codigoEntidad === subItem.entidad.codigoEntidad
            )
        )
      )
    }

    setSwitchStates(newSwitchStates)
  }

  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  useEffect(() => {
    if (activeSwitchesCount === 0) {
      setSelectedEntidades([])
    }
  }, [activeSwitchesCount])

  const filteredDataByEntidades = filterBySelectedEntidades(
    filteredInfoSectorData,
    selectedEntidades.map((entidad) => Number(entidad.codigoEntidad))
  )

  const verPdfModal = async () => {
    setModalPdf(true)
  }

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  useEffect(() => {
    setSwitchStates({})
    setSelectedEntidades([])
  }, [selectedSector])

  return (
    <>
      <CustomDialog
        isOpen={modalPdf}
        handleClose={cerrarModalPdf}
        title="VISTA PREVIA PDF"
        maxWidth="lg"
      >
        <ModalReporteGeoreferencia
          infoEntidadData={filteredDataByEntidades}
          selectedEntidades={selectedEntidades}
          titulo={selectedSector}
          subTitulo={selectedGobierno}
          capturedImage={mapImage}
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
            disabled={selectedEntidades.length === 0}
            onClick={verPdfModal}
            startIcon={
              <span className="material-icons" style={{ fontSize: '34px' }}>
                local_printshop
              </span>
            }
          >
            Imprimir
          </Button>
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
            {newData.map((item, index) => (
              <Grid key={`${item.nameSubsector}-${index}`}>
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
                  {item.nameSubsector}
                </Typography>
                {item.data.map((subItem, subIndex) => (
                  <Grid
                    container
                    alignItems="center"
                    key={`${subItem.nameAgrupador}-${subIndex}`}
                  >
                    <Grid item xs={6}>
                      <Typography variant="caption">
                        {subItem.nameAgrupador || 'Sin Agrupador'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'right' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={
                              switchStates[subItem.nameAgrupador] || false
                            }
                            onChange={() =>
                              toggleSwitch(
                                subItem.nameAgrupador,
                                subItem.data,
                                getRandomColor()
                              )
                            }
                            disabled={
                              activeSwitchesCount >= 2 &&
                              !switchStates[subItem.nameAgrupador]
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
          <Paper
            elevation={15}
            sx={{
              borderRadius: '15px',
              position: 'relative',
              height: '430px',
              zIndex: 0,
              '@media (min-width: 600px)': { height: '650px' },
            }}
          >
            <MapGeoreferencia
              typeVisualize={selectedGobierno.id}
              selectedEntidades={selectedEntidades}
              onCapture={(imageData) => setMapImage(imageData)}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default GeoreferenciaComponent
