import React from 'react'
import { Button, ButtonGroup, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'

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
  const theme = useTheme()
  const buttonNames: string[] = [
    'datosGenerales',
    'datosSectoriales',
    'comparativaGGAA',
    'cruceDeVariables',
    'georeferenciaDeVariables',
  ]

  return (
    <ButtonGroup
      variant="contained"
      fullWidth
      size="large"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('md')]: {
          flexDirection: 'row',
        },
      }}
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
            borderTopLeftRadius: selectedButton === buttonName ? '4px' : 0,
            borderBottomLeftRadius: selectedButton === buttonName ? '4px' : 0,
            borderRight:
              selectedButton === buttonName ? 'none' : '1px solid #ccc',
            boxShadow:
              selectedButton === buttonName
                ? '0px 5px 5px rgba(0,0,0,0.1)'
                : 'none',
            fontSize: '1rem',
            height: '60px',
            minWidth: '150px',
            width: '100%',
            color: selectedButton === buttonName ? 'white' : 'black',
            fontWeight: selectedButton === buttonName ? 'bold' : 'normal',
            textTransform:
              selectedButton === buttonName ? 'uppercase' : 'capitalize',
            [theme.breakpoints.up('md')]: {
              borderTopLeftRadius: selectedButton === buttonName ? '4px' : '0',
              borderBottomLeftRadius:
                selectedButton === buttonName ? '4px' : '0',
              borderTopRightRadius: selectedButton === buttonName ? '4px' : '0',
              borderBottomRightRadius:
                selectedButton === buttonName ? '4px' : '0',
            },
          }}
        >
          {formatButtonText(buttonName)}
        </Button>
      ))}
    </ButtonGroup>
  )
}

export default TabButtons
