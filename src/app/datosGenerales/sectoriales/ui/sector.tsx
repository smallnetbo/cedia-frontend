import React from 'react'
import Grid from '@mui/material/Grid'

import {
  FormControlLabel,
  Paper,
  styled,
  Switch,
  Typography,
} from '@mui/material'

import ChartPie from '@/components/echarts/pie'
import { SubSector, Variable } from '../../types/datosGeneralesType'
import ChartBar from '@/components/echarts/bar'
import ChartLine from '@/components/echarts/line'

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
  // Obtener datos del primer SubSector
  const primerSubSector = infoSectorData[0]
  // Obtener datos de las variables del primer SubSector
  const primerSubSectorVariables = primerSubSector?.variables || []
  // Crear chartData solo con los datos del primer SubSector
  const chartData = primerSubSectorVariables.map((variable) => ({
    value: parseFloat(variable.datosVariables[0].valor), // Convertir a número
    name: variable.nombre,
  }))

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
                  <Grid container alignItems="center">
                    <Grid item xs={6} key={subItem.id}>
                      <Typography variant="caption">
                        {subItem.nombre}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'right' }}>
                      <FormControlLabel
                        control={<Switch />}
                        label=""
                        // Ajusta las propiedades del Switch según tus necesidades
                        checked={true}
                        // onChange={(e) => handleSwitchChange(e, Item.id)}
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
              <Item elevation={8} style={{ height: '100%' }}>
                <ChartPie data={chartData} title="Recursos" subTitle="" />
              </Item>
            </Grid>
            <Grid item xs={12} md={6} lg={6} style={{ minHeight: '320px' }}>
              <Item elevation={8} style={{ height: '100%' }}>
                <ChartLine data={chartData} title="Recursos" subTitle="" />
              </Item>
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
