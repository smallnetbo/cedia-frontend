import React from 'react'
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Grid,
  Paper,
  ListItemIcon,
  styled,
} from '@mui/material'
import { SubSector } from '../types/datosGeneralesType'
import { Icono } from '@/components/Icono'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))
interface InformacionInterface {
  infoEntidadData: SubSector[]
}
const EntityInformation = React.memo(
  ({ infoEntidadData }: InformacionInterface) => {
    const newData = infoEntidadData
      .filter((element) => element.tipoDatoGeneral === true)
      .map((element) => ({
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

    return (
      <Grid>
        <Item
          elevation={4}
          style={{
            maxWidth: '100%',
            maxHeight: '650px',
            overflow: 'auto',
          }}
        >
          <Grid container direction="column">
            {newData.map((item) => (
              <Grid item xs={12} key={item.id}>
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
                  {item.variables.map((variable) =>
                    variable.items.map((items) => (
                      <Grid item xs={12} sm={6} key={items.id}>
                        <List sx={{ width: '100%' }}>
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
                        </List>
                      </Grid>
                    ))
                  )}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Item>
      </Grid>
    )
  }
)

export default EntityInformation
