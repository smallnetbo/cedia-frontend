import React, { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'

import {
  FormControlLabel,
  Paper,
  styled,
  Switch,
  Typography,
} from '@mui/material'

import ChartPie from '@/components/echarts/pie'
import {
  SubSector,
  Variable,
  DatoRegistro,
} from '../../types/datosGeneralesType'
import ChartBar from '@/components/echarts/bar'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))
interface InformacionInterface {
  infoSectorData: SubSector[]
}
const SectorComponent = ({ infoSectorData }: InformacionInterface) => {
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )

  useEffect(() => {
    // Inicializar el estado del switch por defecto
    const initialState: { [key: string]: boolean } = {}
    infoSectorData.forEach((sector) => {
      sector.variables.forEach((variable) => {
        initialState[variable.nombre] = true
      })
    })
    setSwitchStates(initialState)
  }, [infoSectorData])

  const [chartData, setChartData] = useState<
    { name: string; data: { datoRegistro: DatoRegistro }[] }[]
  >([])

  const toggleSwitch = (itemName: string) => {
    setSwitchStates((prevState) => {
      const newState = {
        ...prevState,
        [itemName]: !prevState[itemName],
      }
      return newState
    })
  }

  const transformDataForChart = (data: SubSector[]) => {
    const formattedChartData: {
      name: string
      data: { datoRegistro: DatoRegistro }[]
    }[] = []

    const groupedData: { [year: string]: { [resource: string]: number } } = {}

    // Agrupar los datos por año y recurso
    data.forEach((subSector) => {
      subSector.variables.forEach((variable) => {
        variable.entidadVariables.forEach((entidadVariable) => {
          const { datoRegistro } = entidadVariable
          const { año, recurso, ejecucion } = datoRegistro
          if (!groupedData[año]) {
            groupedData[año] = {}
          }
          if (!groupedData[año][recurso]) {
            groupedData[año][recurso] = 0
          }
          groupedData[año][recurso] += parseFloat(ejecucion)
        })
      })
    })

    // Convertir los datos agrupados en el formato necesario para el gráfico
    Object.entries(groupedData).forEach(([year, resources]) => {
      const formattedData: { datoRegistro: DatoRegistro }[] = []
      Object.entries(resources).forEach(([resource, execution]) => {
        formattedData.push({
          datoRegistro: {
            año: year,
            recurso: resource,
            ejecucion: execution.toFixed(2), // Redondear a dos decimales
          },
        })
      })

      formattedChartData.push({
        name: year,
        data: formattedData,
      })
    })

    return formattedChartData
  }

  useEffect(() => {
    const filteredData = infoSectorData.map((sector) => ({
      ...sector,
      variables: sector.variables.filter(
        (variable) => switchStates[variable.nombre]
      ),
    }))

    const newData = transformDataForChart(filteredData)
    setChartData(newData)
  }, [switchStates, infoSectorData])

  return (
    <>
      <Typography variant={'caption'}>
        Seleccione hasta 4 variables para su visualización
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        {/* Primer grid con altura definida y scroll */}

        <Grid item xs={12} md={12} lg={4} xl={3} overflow="auto" height={650}>
          <Item elevation={4} style={{ maxWidth: '100%' }}>
            {infoSectorData.map((Item) => (
              <Grid key={Item.id}>
                <Typography
                  variant="h6"
                  style={{
                    backgroundColor: '#50C0B2',
                    padding: '8px',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  {Item.nombre}
                </Typography>
                {Item.variables.map((subItem: Variable) => (
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

        {/* Segundo grid */}
        <Grid item xs={12} md={12} lg={8} xl={9} overflow="auto" height={650}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '320px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                <ChartBar data={chartData} title="Recursos" subTitle="" />
              </Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '320px' }}>
              <Item elevation={8} style={{ height: '100%' }}></Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '320px' }}>
              <Item elevation={8} style={{ height: '100%' }}></Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '320px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                xs=4
              </Item>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default SectorComponent
