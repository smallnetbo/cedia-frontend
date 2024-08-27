import React from 'react'
import {
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Paper,
} from '@mui/material'
import { SubSector } from '../../types/datosGeneralesType'

interface SwitchesComponentProps {
  infoSectorData: SubSector[]
  switchStates: { [key: string]: boolean }
  activeSwitchesCount: number
  toggleSwitch: (itemName: string) => void
}

const SwitchesComponent: React.FC<SwitchesComponentProps> = ({
  infoSectorData,
  switchStates,
  activeSwitchesCount,
  toggleSwitch,
}) => {
  return (
    <Paper
      elevation={4}
      style={{ maxWidth: '100%', padding: '8px', textAlign: 'center' }}
    >
      {infoSectorData.map((item) => (
        <Grid key={item.id}>
          <Typography
            variant="h6"
            style={{
              backgroundColor: '#50C0B2',
              padding: '8px',
              color: 'white',
              textAlign: 'center',
              width: '100%',
              fontSize: '16px',
            }}
          >
            {item.nombre}
          </Typography>
          {item.variables.map((subItem) => (
            <Grid container alignItems="center" key={subItem.id}>
              <Grid item xs={6}>
                <Typography variant="caption" style={{ fontSize: '14px' }}>
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
                        activeSwitchesCount >= 2 &&
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
    </Paper>
  )
}

export default SwitchesComponent
