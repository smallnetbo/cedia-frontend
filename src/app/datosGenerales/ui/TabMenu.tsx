'use client'
import React, { useState } from 'react'
import { Button, Box, Grid } from '@mui/material'
import SelectFiltros from './SelectFiltros'

const TabMenu = () => {
  const [selectedButton, setSelectedButton] = useState<string>('datosGenerales')

  const buttonComponents: ButtonComponents = {
    datosGenerales: <SelectFiltros />,
    datosSectoriales: null,
    comparativa: null,
    cruceDeVariables: null,
    georeferenciaDeVariables: null,
    // georeferenciaVariables: <RegistrationForm />, // Por defecto, el formulario de registro está asignado a este botón
  }

  const handleClick = (button: string) => {
    setSelectedButton(button)
  }

  const capitalizeFirstLetter = (str: any) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const formatButtonText = (buttonName: string) => {
    const words = buttonName.split(/(?=[A-Z])/)
    return words.map((word: any) => capitalizeFirstLetter(word)).join(' ')
  }

  return (
    <Grid container spacing={2} sx={{ marginTop: '2px' }}>
      <Grid item xs={12}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="flex-start"
          alignItems="center"
          width="100%"
        >
          {Object.keys(buttonComponents).map((buttonName) => (
            <Button
              key={buttonName}
              variant={selectedButton === buttonName ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleClick(buttonName)}
              sx={{
                borderRadius: 0,
                flex: '1', // Para asegurar que los botones tengan el mismo tamaño
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                borderRight: { xs: '1px solid #ccc', sm: '1px solid #ccc' }, // Solo agregar borde en pantallas mayores a xs
                boxShadow:
                  selectedButton === buttonName
                    ? '0px 5px 5px rgba(0,0,0,0.1)'
                    : 'none',
                fontSize: '1.2rem',
                height: '60px',
                minWidth: '150px',
                width: { xs: '100%', sm: 'auto' }, // Ancho completo en dispositivos móviles, automático en pantallas más grandes

                color: selectedButton === buttonName ? 'white' : 'black',
                fontWeight: selectedButton === buttonName ? 'bold' : 'normal',
                textTransform:
                  selectedButton === buttonName ? 'uppercase' : 'capitalize',
              }}
            >
              {formatButtonText(buttonName)}
            </Button>
          ))}
        </Box>
      </Grid>
      {/* Mostrar el componente seleccionado */}
      <Grid item xs={12}>
        <Box mt={1}>{buttonComponents[selectedButton]}</Box>
      </Grid>

      {/* Nuevo Grid */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          {/* Primer Grid item, ocupa más de la mitad de la pantalla en dispositivos grandes */}
          <Grid item xs={12} sm={8}>
            <Box sx={{ height: '200px', bgcolor: 'primary.main' }} />
          </Grid>
          {/* Segundo Grid item, ocupa el resto de la pantalla en dispositivos grandes */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ height: '200px', bgcolor: 'secondary.main' }} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default TabMenu
