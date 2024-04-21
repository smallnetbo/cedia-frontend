import React, { useEffect, useState } from 'react'
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
} from '@mui/material'

const EntityInformation = () => {
  // Estado para almacenar la información obtenida de la base de datos
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      // Supongamos que obtienes los datos de la base de datos y los guardas en una variable llamada newData
      const newData = [
        {
          id: 1,
          title: 'Datos Generales',
          items: [
            { id: 1, nombre: 'Población 2012', valor: '261.201' },
            { id: 2, nombre: 'Proyección 2022', valor: '360.544' },
            { id: 3, nombre: 'Departamento', valor: 'Chuquisaca' },
            { id: 4, nombre: 'Superficie', valor: '51.524 Km2' },
            { id: 5, nombre: 'Leyes enviadas al SEA', valor: '139' },
            { id: 6, nombre: 'Valoración', valor: '38%' },
            { id: 7, nombre: 'Fecha de creación', valor: '23/01/1826' },
            { id: 8, nombre: 'Categoria', valor: 'D' },
            { id: 9, nombre: 'Carta orgánica', valor: 'No tiene' },
          ],
        },
        {
          id: 2,
          title: 'Composición de Gobierno',
          items: [
            { id: 10, nombre: 'Alcalde', valor: '261.201' },
            { id: 11, nombre: 'Votación', valor: '38%' },
            { id: 12, nombre: 'Partido Político', valor: 'MAS-IPSP' },
          ],
        },
      ]
      setData(newData)
    }

    fetchData()
  }, [])

  return (
    <Box height={650} overflow="auto">
      <Paper elevation={3} style={{ padding: '8px', maxWidth: '100%' }}>
        <Grid container direction="column">
          {data.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Typography
                variant="h6"
                style={{
                  backgroundColor: '#50C0B2',
                  padding: '8px',
                  color: 'white',
                }}
              >
                {item.title}
              </Typography>
              <Grid container spacing={2} sx={{ backgroundColor: 'inherit' }}>
                {item.items.map((subItem) => (
                  <Grid item xs={12} sm={6} key={subItem.id}>
                    <List sx={{ width: '100%', marginBottom: '-30px' }}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{ marginBottom: '1px' }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            alt={`Avatar ${subItem.id}`}
                            src={`/static/images/avatar/${subItem.id}.jpg`}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={subItem.nombre}
                          secondary={subItem.valor}
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
