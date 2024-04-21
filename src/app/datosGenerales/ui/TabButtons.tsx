import React from 'react'
import { Button, Box, Grid } from '@mui/material'

interface TabButtonsProps {
  selectedButton: string
  handleClick: (button: string) => void
  formatButtonText: (buttonName: string) => string
}

const TabButtons: React.FC<TabButtonsProps> = ({
  selectedButton,
  handleClick,
  formatButtonText,
}) => {
  const buttonNames: string[] = [
    'datosGenerales',
    'datosSectoriales',
    'comparativa',
    'cruceDeVariables',
    'georeferenciaDeVariables',
  ]

  return (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', sm: 'row' }}
      justifyContent="flex-start"
      alignItems="center"
      width="100%"
    >
      {buttonNames.map((buttonName) => (
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
            borderRight: { xs: '1px solid #ccc', sm: '1px solid #ccc' },
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
  )
}

export default TabButtons
