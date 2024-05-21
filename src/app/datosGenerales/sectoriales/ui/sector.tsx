import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { Button, Typography } from '@mui/material'

import { SubSector, DatoRegistro } from '../../types/datosGeneralesType'

import SwitchListComponent from '../../componentes/switchListComponent'
import ChartListComponent from '../../componentes/chartListComponent'
import { CustomDialog } from '@/components/modales/CustomDialog'
import ModalPdf from '../../reporte/ui/modalPdf'
import { delay } from '@/utils'
import ModalReporteGeneral from '../../reporte/ui/modalReporteGeneral'

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
  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }
  const verPdfModal = () => {
    setModalPdf(true)
  }
  const filteredInfoSectorData = infoSectorData.filter(
    (sector) => sector.tipoDatoGeneral === false
  )

  const dataReporteGraficos = filteredInfoSectorData.map((element) => ({
    id: element.id,
    nombre: element.nombre,
    icono: element.icono,
    variables: element.variables.map((variable) => ({
      ...variable,
      items: variable.items.map((item) => ({
        ...item,
        datoRegistro: variable.entidadVariables.find(
          (entidad) => entidad.datoRegistro.recurso === item.nombre
        )?.datoRegistro,
      })),
    })),
  }))

  const [selectedItem, setSelectedItem] = useState(null)

  const [chartData, setChartData] = useState<
    { name: string; data: { datoRegistro: DatoRegistro }[] }[]
  >([])
  const [activeCharts, setActiveCharts] = useState<string[]>([])

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
  }, []) // No hay dependencias, se ejecutará solo una vez

  const toggleSwitch = (itemName: string) => {
    setSwitchStates((prevState) => ({
      ...prevState,
      [itemName]: !prevState[itemName],
    }))
  }

  //variable con su tipo de grafico
  const graficosPorVariable = filteredInfoSectorData.reduce(
    (acumulador: GraficosPorVariable, subSector) => {
      subSector.variables.forEach((variable) => {
        acumulador[variable.nombre] = variable.graficos.tipoGrafico.descripcion
      })
      return acumulador
    },
    {}
  )

  // Función para manejar el clic en un item
  const handleItemClick = (id) => {
    setSelectedItem(id === selectedItem ? null : id)
  }

  const transformDataForChart = (
    data: SubSector[],
    variableName: string
  ): { name: string; data: { datoRegistro: DatoRegistro }[] }[] => {
    const formattedChartData: {
      name: string
      data: { datoRegistro: DatoRegistro }[]
    }[] = []

    data.forEach((subSector) => {
      subSector.variables.forEach((variable) => {
        if (variable.nombre === variableName) {
          const agrupadores = variable.items.filter((item) => item.esAgrupador)
          const agrupadorNames = agrupadores.map(
            (agrupador) => agrupador.nombre
          )

          const groupedData: { [key: string]: { [resource: string]: number } } =
            {}

          variable.entidadVariables.forEach((entidadVariable) => {
            const { datoRegistro } = entidadVariable
            const { año, recurso, ejecucion } = datoRegistro

            // Determinar la clave de agrupación
            let key: string
            if (agrupadorNames.length > 0) {
              key = agrupadorNames.map((name) => datoRegistro[name]).join('-')
            } else {
              key = recurso // Si no hay agrupadores, la clave es el recurso
            }

            if (!groupedData[key]) {
              groupedData[key] = {}
            }

            if (!groupedData[key][recurso]) {
              groupedData[key][recurso] = 0
            }

            groupedData[key][recurso] += parseFloat(ejecucion)
          })

          // Convertir los datos agrupados en el formato para el gráfico
          Object.entries(groupedData).forEach(([key, resources]) => {
            const formattedData: { datoRegistro: DatoRegistro }[] = []
            Object.entries(resources).forEach(([resource, execution]) => {
              formattedData.push({
                datoRegistro: {
                  año: key,
                  recurso: resource,
                  ejecucion: execution.toFixed(2),
                },
              })
            })

            formattedChartData.push({
              name: key,
              data: formattedData,
            })
          })
        }
      })
    })

    return formattedChartData
  }

  useEffect(() => {
    const newData: { [key: string]: { datoRegistro: DatoRegistro }[] } = {}
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
  }, [switchStates]) // Solo se ejecuta cuando switchStates cambia

  useEffect(() => {
    const newActiveCharts = Object.keys(switchStates).filter(
      (itemName) => switchStates[itemName]
    )
    setActiveCharts(newActiveCharts.slice(0, 4))
  }, [switchStates])

  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  return (
    <>
      <>
        <Button
          onClick={verPdfModal}
          variant="outlined"
          startIcon={<span className="material-icons">visibility</span>}
        >
          Ver pdf
        </Button>
        <CustomDialog
          isOpen={modalPdf}
          handleClose={cerrarModalPdf}
          title="VISTA PREVIA PDF"
          maxWidth="lg"
        >
          <ModalReporteGeneral
            infoEntidadData={infoSectorData}
            dataReporteGraficos={dataReporteGraficos}
            accionCorrecta={() => {
              cerrarModalPdf().finally()
            }}
            accionCancelar={cerrarModalPdf}
          />
        </CustomDialog>
      </>
      <>
        <Typography variant={'caption'}>
          Seleccione hasta 4 variables para su visualización
        </Typography>
        <Grid container spacing={2} style={{ height: '100%' }}>
          <Grid item xs={12} md={12} lg={4} xl={3} overflow="auto">
            <SwitchListComponent
              data={filteredInfoSectorData}
              switchStates={switchStates}
              toggleSwitch={toggleSwitch}
              activeSwitchesCount={activeSwitchesCount}
            />
          </Grid>

          <Grid item xs={12} md={12} lg={8} xl={9}>
            <ChartListComponent
              charts={activeCharts}
              chartData={chartData}
              selectedItem={selectedItem}
              handleItemClick={handleItemClick}
              switchStates={switchStates}
              graficosPorVariable={graficosPorVariable}
            />
          </Grid>
        </Grid>
      </>
    </>
  )
}

export default SectorComponent
