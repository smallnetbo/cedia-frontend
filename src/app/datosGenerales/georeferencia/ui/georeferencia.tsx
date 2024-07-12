import React, { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Paper,
  styled,
  Switch,
  Typography,
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
import { filterBySelectedEntidades } from '../../dataUtils/filtros/filterBySelectedEntidades'
import ModalReporteGeoreferencia from '../../reporte/ui/modalReportes/ModalReporteGeoreferencia'

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
  const [selectedEntidades, setSelectedEntidades] = useState<number[]>([])
  const [modalPdf, setModalPdf] = useState(false)

  const filteredInfoSectorData = filterDatoGeneralVista(infoSectorData)
  const dataDatosGenerales = filterDatoGeneralReporte(infoSectorData)

  const newData = formattedDataGeo(filteredInfoSectorData)

  const toggleSwitch = (agrupadorName: string, entidades: number[]) => {
    const newSwitchStates = { ...switchStates }
    newSwitchStates[agrupadorName] = !newSwitchStates[agrupadorName]

    if (newSwitchStates[agrupadorName]) {
      setSelectedEntidades((prevState) => [...prevState, ...entidades])
    } else {
      setSelectedEntidades((prevState) =>
        prevState.filter((id) => !entidades.includes(id))
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
    dataDatosGenerales,
    selectedEntidades
  )

  const verPdfModal = async () => {
    setModalPdf(true)
  }
  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

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
          titulo={selectedSector}
          subTitulo={selectedGobierno}
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
            disabled={!selectedEntidades || selectedEntidades.length === 0}
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
            {newData.map((item, index) => (
              <Grid key={index}>
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
                  <Grid container alignItems="center" key={subIndex}>
                    <Grid item xs={6}>
                      <Typography variant="caption">
                        {subItem.nameAgrupador}
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
                                subItem.data.map((ent) =>
                                  Number(ent.entidad.codigoEntidad)
                                )
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
              height: '450px',
              zIndex: 0,
              '@media (min-width: 600px)': {
                height: '670px',
              },
            }}
          >
            <MapGeoreferencia
              typeVisualize={selectedGobierno.id}
              selectedEntidades={selectedEntidades}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default GeoreferenciaComponent
