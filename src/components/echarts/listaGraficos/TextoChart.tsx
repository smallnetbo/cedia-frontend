import React from 'react'
import {
  Typography,
  Grid,
  Paper,
  styled,
  Box,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import Icon from '@mui/material/Icon'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

const TextoChart = () => {
  // Datos fijos
  const data = [
    {
      id: 1,
      nombre: 'Subsector 1',
      variables: [
        {
          id: 1,
          nombre: 'Variable 1',
          items: [
            {
              id: 1,
              nombre: 'Item 1',
              icono: '4g_plus_mobiledata',
              color: '#3c630f',
              datoRegistro: { nombre: 'dato1', valor: 'valor1' },
            },
            {
              id: 2,
              nombre: 'Item 2',
              icono: '4g_plus_mobiledata',
              color: '#3c630f',
              datoRegistro: { nombre: 'dato2', valor: 'valor2' },
            },
          ],
        },
        {
          id: 2,
          nombre: 'Variable 2',
          items: [
            {
              id: 3,
              nombre: 'Item 3',
              icono: '4g_plus_mobiledata',
              color: '#3c630f',
              datoRegistro: { nombre: 'dato3', valor: 'valor3' },
            },
          ],
        },
      ],
    },
  ]

  return (
    <Item elevation={4}>
      <Grid container direction="column" spacing={1}>
        {data.map((subSector) => (
          <Grid item xs={12} key={subSector.id}>
            <Box
              sx={{
                marginBottom: '5px',
                borderBottom: '2px solid #50C0B2',
              }}
            >
              <Typography
                variant="h5"
                style={{
                  backgroundColor: '#50C0B2',
                  padding: '5px',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                {subSector.nombre}
              </Typography>
            </Box>
            {subSector.variables.map((variable) => (
              <Grid item xs={12} sx={{ marginBottom: '2px' }} key={variable.id}>
                {variable.items.map((item) => (
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      marginBottom: '1px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '25px',
                      padding: '3px',
                    }}
                    key={item.id}
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      <Icon>{item.icono}</Icon>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                        >
                          {item.datoRegistro?.nombre}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{ fontSize: '0.9rem', color: '#616161' }}
                        >
                          {item.datoRegistro?.valor}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </Item>
  )
}

export default TextoChart
