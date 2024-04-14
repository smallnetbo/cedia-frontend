'use client'
import React, { useState } from 'react'
import { Button, Box, Grid } from '@mui/material'
import SelectFiltros from './SelectFiltros'
import dynamic from 'next/dynamic'

const DynamicMap = dynamic(() => import('@/components/map/index'), {
  ssr: false,
})

const TabMenu = () => {
  const [selectedButton, setSelectedButton] = useState<string>('datosGenerales')

  const buttonComponents: ButtonComponents = {
    datosGenerales: <SelectFiltros />,
    datosSectoriales: null,
    comparativa: null,
    cruceDeVariables: null,
    georeferenciaDeVariables: null,
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
                flex: '1',
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
                width: { xs: '100%', sm: 'auto' },

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

      <Grid item xs={12}>
        <Box mt={1}>{buttonComponents[selectedButton]}</Box>
      </Grid>

      <Grid item xs={12} sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <DynamicMap />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ height: '600px', bgcolor: 'secondary.main' }}>
              Contenido de la segunda columna
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default TabMenu
