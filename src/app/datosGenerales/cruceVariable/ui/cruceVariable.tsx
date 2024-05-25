import React, { useState, useEffect, useMemo } from 'react'
import Grid from '@mui/material/Grid'
import { Typography, Paper, Switch, FormControlLabel } from '@mui/material'
import { styled } from '@mui/system'
import ChartComponent from '@/components/echarts/chartComponent'
import { SubSector, Variable } from '../../types/datosGeneralesType'

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

const CruceVariableComponent = ({ infoSectorData }: InformacionInterface) => {
  const filteredInfoSectorData = useMemo(
    () => infoSectorData.filter((sector) => !sector.tipoDatoGeneral),
    [infoSectorData]
  )
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  )

  const toggleSwitch = (itemName: string) => {
    setSwitchStates((prevState) => ({
      ...prevState,
      [itemName]: !prevState[itemName],
    }))
  }

  const activeVariables = useMemo(
    () =>
      Object.entries(switchStates)
        .filter(([_, active]) => active)
        .map(([variable]) => variable),
    [switchStates]
  )

  const combinedData = useMemo(
    () =>
      filteredInfoSectorData.reduce((acc, sector) => {
        sector.variables.forEach((variable) => {
          if (activeVariables.includes(variable.nombre)) {
            acc.push({
              sector: sector.nombre,
              variable: variable.nombre,
              datos: variable.entidadVariables.map((entidad) => ({
                año: entidad.datoRegistro.año,
                ejecucion: entidad.datoRegistro.ejecucion,
              })),
            })
          }
        })
        return acc
      }, []),
    [filteredInfoSectorData, activeVariables]
  )
  return (
    <>
      <Typography variant="caption">
        Seleccione las variables para su visualización
      </Typography>
      <Grid container spacing={2} style={{ height: '100%' }}>
        <Grid
          item
          xs={12}
          md={12}
          lg={4}
          xl={3}
          sx={{ height: 650, overflow: 'auto' }}
        >
          <Item elevation={4} style={{ maxWidth: '100%', maxHeight: '650px' }}>
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
                {item.variables.map((subItem: Variable) => (
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
              height: '650px',
              overflow: 'auto',
            }}
          >
            {combinedData.length > 0 ? (
              <ChartComponent
                type="scatter" // Tipo de gráfico
                data={combinedData} // Datos del gráfico
                title="Gráfico de Dispersión" // Título del gráfico
                subTitle="" // Subtítulo del gráfico
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
