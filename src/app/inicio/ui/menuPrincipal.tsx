import React, { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import CircleIcon from '@mui/icons-material/Circle'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import PublicIcon from '@mui/icons-material/Public'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { styled } from '@mui/system'
import { Button } from '@mui/material'

// Estilos para el contenedor del menú
const StyledMenu = styled('div')`
  position: absolute;
  top: 50%;
  left: 100px; /* Ajuste de la posición a la izquierda */
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 999; /* Asegura que el menú esté por encima de otros elementos */
`
// Estilos para el contenedor de Botones
const StyledButton = styled('div')`
  position: absolute;
  top: 70%;
  left: 70%; /* Ajuste de la posición a la izquierda */
  transform: translateY(-50%);
  display: flex;
  gap: 10px;
  align-items: flex-start;
  z-index: 999; /* Asegura que el menú esté por encima de otros elementos */
`

// Estilos para el contenedor de texto
const TextContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  opacity: ${({ hovered }) =>
    hovered ? '1' : '0'}; /* Mostrar el texto cuando se pasa el ratón */
  transition: opacity 0.2s ease; /* Transición para mostrar el texto */
  margin-top: ${({ hovered }) =>
    hovered ? '16px' : '8px'}; /* Ajuste del margen superior */
  margin-left: ${({ hovered }) => (hovered ? '58px' : '8px')};
  max-height: ${({ hovered }) =>
    hovered ? '100px' : '0'}; /* Altura máxima para mostrar el texto */
  overflow: hidden; /* Ocultar el texto que excede la altura máxima */
  transition: all 0.3s ease; /* Transición para la altura y el margen superior */
`

// Estilos para el texto del título
const StyledTitle = styled('span')`
  font-size: 20px; /* Tamaño del texto */
  font-weight: bold; /* Texto en negrita */
`

// Estilos para el texto del subtítulo
const StyledSubtitle = styled('span')`
  font-size: 14px; /* Tamaño del texto */
  color: #666; /* Color del texto del subtítulo */
`

// Estilos para los iconos del menú
const StyledIconButton = styled(IconButton)`
  && {
    font-size: ${({ hovered }) =>
      hovered ? '48px' : '38px'}; /* Tamaño base del icono */
    margin: 0.5px; /* Margen entre los iconos */
    display: flex;
    align-items: center; /* Centrar ícono y texto verticalmente */
    transition:
      transform 0.2s ease,
      font-size 0.2s ease; /* Transición más suave */

    &:hover {
      transform: scale(1.5); /* Reducción del factor de escala */
    }
  }
`

// Componente MenuPrincipal
const MenuPrincipal = () => {
  const [hovered, setHovered] = useState(false)

  const handleMouseEnter = () => {
    setHovered(true)
  }

  const handleMouseLeave = () => {
    setHovered(false)
  }

  // Iconos y textos correspondientes
  const icons = [
    {
      icon: AccountCircleIcon,
      color: '#a6ce3e',
      title: 'Account',
      subtitle: 'Circle icon',
    },
    {
      icon: TravelExploreIcon,
      color: '#a6ce3e',
      title: 'Explore',
      subtitle: 'Travel icon',
    },
    {
      icon: ListAltIcon,
      color: '#0ec9ae',
      title: 'List',
      subtitle: 'List icon',
    },
    {
      icon: AutoStoriesIcon,
      color: '#0ec9ae',
      title: 'Stories',
      subtitle: 'Stories icon',
    },
    {
      icon: PublicIcon,
      color: '#f7931e',
      title: 'Public',
      subtitle: 'Public icon',
    },
    {
      icon: AssessmentIcon,
      color: '#f7931e',
      title: 'Assessment',
      subtitle: 'Assessment icon',
    },
  ]

  return (
    <div>
      <StyledMenu>
        {icons.map(({ icon: Icon, color, title, subtitle }, index) => (
          <StyledIconButton
            key={index}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            hovered={hovered}
          >
            {hovered ? (
              <Icon sx={{ color: color }} />
            ) : (
              <CircleIcon sx={{ color: color }} />
            )}
            <TextContainer hovered={hovered}>
              <StyledTitle>{title}</StyledTitle>
              <StyledSubtitle>{subtitle}</StyledSubtitle>
            </TextContainer>
          </StyledIconButton>
        ))}
      </StyledMenu>
      <StyledButton>
        <Button
          variant="contained"
          size="large"
          color="primary"
          sx={{ width: '120px', color: 'white' }}
        >
          INICIAR
        </Button>
        <Button
          variant="contained"
          size="large"
          color="inherit"
          sx={{ width: '200px', color: 'black' }}
        >
          FICHAS SECTORIALES
        </Button>
      </StyledButton>
    </div>
  )
}

export default MenuPrincipal
