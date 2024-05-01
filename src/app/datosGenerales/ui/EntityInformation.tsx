import React from 'react'
import {
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Grid,
  Paper,
  Box,
  ListItemIcon,
} from '@mui/material'
import { SubSector, Variable } from '../types/datosGeneralesType'
import { Icono } from '@/components/Icono'

interface InformacionInterface {
  infoEntidadData: SubSector[]
}
const EntityInformation = ({ infoEntidadData }: InformacionInterface) => {
  return (
    <Box height={650} overflow="auto">
      <Paper elevation={3} style={{ padding: '8px', maxWidth: '100%' }}>
        <Grid container direction="column">
          {infoEntidadData.map((item) => (
            <Grid item xs={12} key="">
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

              <Grid container spacing={2} sx={{ backgroundColor: 'inherit' }}>
                {item.variables.map((subItem: Variable) => (
                  <Grid item xs={12} sm={6} key={subItem.id}>
                    <List sx={{ width: '100%' }}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{ marginBottom: '1px' }}
                      >
                        <ListItemIcon sx={{ minWidth: '45px' }}>
                          <Icono color={'inherit'} fontSize={'large'}>
                            {subItem.icono}
                          </Icono>
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                            >
                              {subItem.nombre}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              sx={{ fontSize: '0.8rem' }}
                            >
                              {subItem.datosVariables[0].valor}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  )
}

export default EntityInformation
