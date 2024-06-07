import React, { useState, useEffect, useMemo, useRef } from 'react'
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
import { ChartData, SubSector, Variable } from '../../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import ModalReporteGeneral from '../../reporte/ui/modalReporteGeneral'
import { delay } from '@/utils'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

interface CombinedData {
  sector: string
  variable: string
  datos: ChartData[]
}

type GraficosPorVariable = {
  [variable: string]: string
}

interface InformacionInterface {
  infoSectorData: SubSector[]
}

const CruceVariableComponent = ({ infoSectorData }: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [activeCharts, setActiveCharts] = useState<string[]>([])

  const [chartImage, setChartImage] = useState<{
    [key: string]: string | null
  }>({})
  const [modalPdf, setModalPdf] = useState(false)

  const toggleSwitch = (itemName: string) => {
    const newSwitchStates = { ...switchStates }
    newSwitchStates[itemName] = !newSwitchStates[itemName]
    const activeCount = Object.values(newSwitchStates).filter(Boolean).length

    if (activeCount <= 2) {
      setSwitchStates(newSwitchStates)
    }
  }
  const activeVariables = useMemo(
    () =>
      Object.entries(switchStates)
        .filter(([_, active]) => active)
        .map(([variable]) => variable),
    [switchStates]
  )

  const verPdfModal = async () => {
    setModalPdf(true)
  }

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

  const combinedData = useMemo<CombinedData[]>(() => {
    return infoSectorData.reduce<CombinedData[]>((acc, sector) => {
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
                  valor: Number(value),
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
  }, [infoSectorData, activeVariables])
  useEffect(() => {
    const newActiveCharts = Object.keys(switchStates).filter(
      (itemName) => switchStates[itemName]
    )
    setActiveCharts(newActiveCharts.slice(0, 2))
  }, [switchStates])
  return (
    <>
      <CustomDialog
        isOpen={modalPdf}
        handleClose={cerrarModalPdf}
        title="VISTA PREVIA PDF"
        maxWidth="lg"
      >
        <ModalReporteGeneral
          //infoEntidadData={infoSectorData}
          // dataReporteGraficos={dataReporteGraficos}
          // chartImages={capturedImages}
          accionCorrecta={() => {
            cerrarModalPdf().finally()
          }}
          accionCancelar={cerrarModalPdf}
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
            disabled
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
            {infoSectorData.map((item) => (
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
                    <Grid item xs={6} key={subItem.id}>
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
          </Item>
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
              <ChartComponent
                type="scatter"
                data={combinedData}
                title={activeCharts}
                subTitle=""
                onExport={(image) =>
                  setChartImage((prevImages) => ({
                    ...prevImages,
                    ['activeCharts']: image,
                  }))
                }
                setChartImage={setChartImage}
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
