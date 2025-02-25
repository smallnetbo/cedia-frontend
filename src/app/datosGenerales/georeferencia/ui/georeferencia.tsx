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
  SelectedEntidad,
} from '../../reporte/ui/modalReportes/ModalReporteGeoreferencia'
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

  const [switchEntidadesMap, setSwitchEntidadesMap] = useState<{
    [key: string]: {
      nameAgrupador: string
      entidades: SelectedEntidad[]
    }
  }>({})

  const [modalPdf, setModalPdf] = useState(false)
  const [mapImage, setMapImage] = useState<string | null>(null)

  const filteredInfoSectorData = filterDatoGeneralVista(infoSectorData)
  const dataDatosGenerales = filterDatoGeneralReporte(infoSectorData)

  const newData = formattedDataGeo(filteredInfoSectorData)

  const toggleSwitch = (
    nameAgrupador: string,
    idAgrupador: string,
    subItems: any[],
    color: string
  ) => {
    setSwitchStates((prev) => ({
      ...prev,
      [idAgrupador]: !prev[idAgrupador],
    }))

    setSwitchEntidadesMap((prevMap) => {
      if (!switchStates[idAgrupador]) {
        const newEntidades = subItems.map((subItem) => ({
          codigoEntidad: subItem.entidad.codigoEntidad,
          nombre: subItem.entidad.nombre,
          chartData: subItem.entidad.chartData,
          color: color,
        }))

        return {
          ...prevMap,
          [idAgrupador]: {
            nameAgrupador,
            entidades: newEntidades,
          },
        }
      } else {
        const newMap = { ...prevMap }
        delete newMap[idAgrupador]

        return newMap
      }
    })
  }

  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  useEffect(() => {
    if (activeSwitchesCount === 0) {
      setSwitchEntidadesMap({})
    }
  }, [activeSwitchesCount])

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
    setSwitchEntidadesMap({})
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
          switchEntidadesMap={switchEntidadesMap}
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
            disabled={Object.values(switchEntidadesMap).every(
              (entities) => entities.entidades.length === 0
            )}
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
                            checked={switchStates[subItem.idAgrupador] || false}
                            onChange={() =>
                              toggleSwitch(
                                subItem.nameAgrupador,
                                subItem.idAgrupador,
                                subItem.data,
                                getRandomColor()
                              )
                            }
                            disabled={
                              activeSwitchesCount >= 2 &&
                              !switchStates[subItem.idAgrupador]
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
              switchEntidadesMap={switchEntidadesMap}
              onCapture={(imageData) => setMapImage(imageData)}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default GeoreferenciaComponent
