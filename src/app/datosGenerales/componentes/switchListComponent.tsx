import React from 'react'
import Grid from '@mui/material/Grid'
import {
  FormControlLabel,
  Paper,
  styled,
  Switch,
  Typography,
} from '@mui/material'
import { SubSector, Variable } from '../types/datosGeneralesType'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

interface SwitchListComponentProps {
  data: SubSector[]
  switchStates: { [key: string]: boolean }
  toggleSwitch: (itemName: string) => void
  activeSwitchesCount: number
}

const SwitchListComponent = ({
  data,
  switchStates,
  toggleSwitch,
  activeSwitchesCount,
}: SwitchListComponentProps) => {
  return (
    <Item elevation={4} style={{ maxWidth: '100%', maxHeight: '650px' }}>
      {data.map((item) => (
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
                <Typography variant="caption">{subItem.nombre}</Typography>
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={switchStates[subItem.nombre] || false}
                      onChange={() => toggleSwitch(subItem.nombre)}
                      disabled={
                        activeSwitchesCount >= 4 &&
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
  )
}

export default SwitchListComponent
