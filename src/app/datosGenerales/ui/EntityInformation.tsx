import React from 'react'
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Grid,
  Paper,
  Box,
  ListItemIcon,
} from '@mui/material'
import { SubSector } from '../types/datosGeneralesType'
import { Icono } from '@/components/Icono'

interface Variable {
  id: string
  nombre: string
  nombreCorto: string
  posicion: string
  items: Item[]
}

interface Item {
  id: string
  nombre: string
  color: string
  icono: string
  esAgrupador: boolean
  datoRegistro?: DatoRegistro
}

interface DatoRegistro {
  año: string
  recurso: string
  ejecucion: string
}

interface Entidad {
  id: string
  nombre: string
  icono: string
  variables: Variable[]
}

interface InformacionInterface {
  infoEntidadData: SubSector[]
}
const EntityInformation = ({ infoEntidadData }: InformacionInterface) => {
  const newData: Entidad[] = infoEntidadData.map((element) => {
    const newVariables = element.variables.map((variable) => {
      const updatedItems = variable.items.map((item) => {
        const matchingEntidad = variable.entidadVariables.find(
          (entidad) => entidad.datoRegistro.recurso === item.nombre
        )
        return matchingEntidad
          ? { ...item, datoRegistro: matchingEntidad.datoRegistro }
          : item
      })

      const { graficos, entidadVariables, ...cleanedVariable } = variable
      return { ...cleanedVariable, items: updatedItems }
    })
    return {
      id: element.id,
      nombre: element.nombre,
      icono: element.icono,
      variables: newVariables,
    }
  })

  return (
    <Box height={650} overflow="auto">
      <Paper elevation={3} style={{ padding: '8px', maxWidth: '100%' }}>
        <Grid container direction="column">
          {newData.map((item) => (
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
                {item.variables.map((variable) => (
                  <Grid item xs={12} sm={6} key={variable.id}>
                    <List sx={{ width: '100%' }}>
                      {variable.items.map((items) => (
                        <ListItem
                          alignItems="flex-start"
                          sx={{ marginBottom: '1px' }}
                        >
                          <ListItemIcon sx={{ minWidth: '45px' }}>
                            <Icono color={'inherit'} fontSize={'large'}>
                              {items.icono}
                            </Icono>
                          </ListItemIcon>

                          <ListItemText
                            primary={
                              <Typography
                                variant="body1"
                                sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                              >
                                {items.nombre}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                sx={{ fontSize: '0.8rem' }}
                              >
                                {items.datoRegistro?.ejecucion}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
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
