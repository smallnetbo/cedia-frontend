'use client'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
} from '@mui/material'
import SelectFiltros from './SelectFiltros'
import dynamic from 'next/dynamic'
import { gobiernos, Gobiernos } from '@/types/map/entidad.interface'

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

  const [selectedGobierno, setSelectedGobierno] = useState<Gobiernos>(
    gobiernos[0]
  )
  console.log('select ' + selectedGobierno.id)
  console.log('optener ' + setSelectedGobierno)
  const top100Films = [
    { label: 'The Shawshank Redemption', year: 1994 },
    { label: 'The Godfather', year: 1972 },
    { label: 'The Godfather: Part II', year: 1974 },
    { label: 'The Dark Knight', year: 2008 },
    { label: '12 Angry Men', year: 1957 },
    { label: "Schindler's List", year: 1993 },
    { label: 'Pulp Fiction', year: 1994 },
  ]

  return (
    <Grid container sx={{ marginTop: '2px' }}>
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
        <Box
          mt={1}
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={2}
        >
          <FormControl sx={{ m: 2, minWidth: 180 }} size="small">
            <InputLabel id="demo-simple-select-label">Age</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Age"
              value={selectedGobierno.id}
              onChange={(event) => {
                const selectedId = event.target.value
                const selectedGobierno = gobiernos.find(
                  (gobierno) => gobierno.id === selectedId
                )
                setSelectedGobierno(selectedGobierno)
              }}
            >
              {gobiernos.map((gobierno) => (
                <MenuItem key={gobierno.id} value={gobierno.id}>
                  {gobierno.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            disablePortal
            id="combo-box-demo-2"
            options={top100Films}
            sx={{ minWidth: 180, m: 1 }}
            size="small"
            renderInput={(params) => <TextField {...params} label="Movie 2" />}
          />
        </Box>
      </Grid>

      <Grid item xs={12} sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <DynamicMap />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ height: '650px', bgcolor: 'secondary.main' }}>
              Contenido de la segunda columna
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default TabMenu
