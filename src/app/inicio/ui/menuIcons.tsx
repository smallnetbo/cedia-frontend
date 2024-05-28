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
import { motion, useAnimation } from 'framer-motion'

// Estilos para el contenedor del menú
const StyledMenu = styled('div')`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 999;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
`

// Estilos para los iconos del menú
const StyledIconButton = styled(IconButton)`
  && {
    font-size: 38px; /* Tamaño base del icono */
    margin: 5px; /* Margen entre los iconos */
    display: flex;
    align-items: center; /* Centrar ícono y texto verticalmente */
    transition:
      transform 0.2s ease,
      font-size 0.2s ease; /* Transición más suave */
  }
`

const TextContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  opacity: ${({ hovered }) =>
    hovered ? '1' : '0'}; /* Mostrar el texto cuando se pasa el ratón */
  transition: opacity 0.2s ease; /* Transición para mostrar el texto */
  margin-top: ${({ hovered }) =>
    hovered ? '20px' : '8px'}; /* Ajuste del margen superior */
  margin-left: ${({ hovered }) => (hovered ? '58px' : '8px')};
  max-height: ${({ hovered }) =>
    hovered ? '100px' : '0'}; /* Altura máxima para mostrar el texto */
  overflow: hidden; /* Ocultar el texto que excede la altura máxima */
  transition: all 0.6s ease; /* Transición para la altura y el margen superior */
`

// Estilos para el texto del título
const StyledTitle = styled('span')`
  font-size: 16px; /* Tamaño del texto */
  font-weight: bold; /* Texto en negrita */
`

// Estilos para el texto del subtítulo
const StyledSubtitle = styled('span')`
  font-size: 12px; /* Tamaño del texto */
  color: #ffffff;
`

const MenuIcons = () => {
  const [hovered, setHovered] = useState(false)
  const controls = useAnimation()

  const handleMouseEnter = () => {
    setHovered(true)
    controls.start({
      y: (index) => [0, -20, -40, -60, -40, -20, 0][index],
      transition: { duration: 0.5, ease: 'easeInOut' },
    })
  }

  const handleMouseLeave = () => {
    setHovered(false)
    controls.start({ y: 0, transition: { duration: 0.5, ease: 'easeInOut' } })
  }

  const icons = [
    {
      icon: AccountCircleIcon,
      color: '#a6ce3e',
      title: 'Niveles de Gobierno',
      subtitle:
        'Departamental / Municipal / Indigena Originario Capesino / Regional',
    },
    {
      icon: TravelExploreIcon,
      color: '#a6ce3e',
      title: 'Datos Generales y Sectoriales',
      subtitle: 'Electoral (2015-2021) / Fiscal / Género / Política de cuidado',
    },
    {
      icon: ListAltIcon,
      color: '#0ec9ae',
      title: 'Comparativas entre Gobiernos Autónomos',
      subtitle: 'Según: GAD / Categoria Municipal y GAM/ GAIOC / GAR',
    },
    {
      icon: AutoStoriesIcon,
      color: '#0ec9ae',
      title: 'Cruce de Variables Sectoriales',
      subtitle:
        'Según: GAD / Grupos de Municipios por Dptos / Grupo de municipios por Categoria Municipal / GAIOC',
    },
    {
      icon: PublicIcon,
      color: '#f7931e',
      title: 'Georeferenciación de Variables Sectoriales',
      subtitle: 'Según Nivel de Gobierno',
    },
    {
      icon: AssessmentIcon,
      color: '#f7931e',
      title: 'Índices e Indicadores',
      subtitle: 'Evaluación del ejercicio efectivo de competencias',
    },
  ]

  return (
    <StyledMenu>
      {icons.map(({ icon: Icon, color, title, subtitle }, index) => (
        <motion.div
          key={index}
          custom={index}
          animate={controls}
          initial={{ y: 0 }}
          whileHover={{ scale: 1.2 }} // Efecto de escala al pasar el ratón
          whileTap={{ scale: 0.9 }} // Efecto de escala al hacer clic
        >
          <StyledIconButton
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            hovered={hovered ? 'true' : undefined}
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
        </motion.div>
      ))}
    </StyledMenu>
  )
}

export default MenuIcons
