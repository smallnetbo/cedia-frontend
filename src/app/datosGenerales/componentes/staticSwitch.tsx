import React from 'react'
import Grid from '@mui/material/Grid'
import {
  FormControlLabel,
  Paper,
  styled,
  Switch,
  Typography,
} from '@mui/material'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

interface StaticSwitchListComponentProps {
  switchStates: { [key: string]: boolean }
  toggleSwitch: (itemName: string, entityId: number) => void
}

const staticSwitches = [
  { name: 'Variable 1', entityId: 901 },
  { name: 'Variable 2', entityId: 902 },
  { name: 'Variable 3', entityId: 3 },
  { name: 'Variable 4', entityId: 4 },
]

const StaticSwitchListComponent = ({
  switchStates,
  toggleSwitch,
}: StaticSwitchListComponentProps) => {
  const activeSwitchesCount = Object.values(switchStates).filter(
    (state) => state
  ).length

  return (
    <Item elevation={4} style={{ maxWidth: '100%', maxHeight: '650px' }}>
      {staticSwitches.map((item) => (
        <Grid key={item.name}>
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Typography variant="caption">{item.name}</Typography>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'right' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={switchStates[item.name] || false}
                    onChange={() => toggleSwitch(item.name, item.entityId)}
                    disabled={
                      activeSwitchesCount >= 4 && !switchStates[item.name]
                    }
                  />
                }
                label=""
              />
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Item>
  )
}

export default StaticSwitchListComponent
