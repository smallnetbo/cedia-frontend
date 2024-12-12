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
  flex-wrap: wrap;
  justify-content: space-evenly;
  gap: 16px;
  padding: 8px;
  z-index: 999;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
`

// Estilos para los iconos del menú
const StyledIconButton = styled(IconButton)`
  && {
    font-size: 3.5vw;
    margin: 4px;
    display: flex;
    align-items: center;
    transition:
      transform 0.2s ease,
      font-size 0.2s ease;
  }
`

const TextContainer = styled('div')<{ hovered?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4px;
  opacity: ${({ hovered }) => (hovered ? '1' : '0')};
  transition:
    opacity 0.3s ease,
    margin-top 0.3s ease;
  margin-top: ${({ hovered }) => (hovered ? '12px' : '4px')};
  max-height: ${({ hovered }) => (hovered ? '60px' : '0')};
  overflow: hidden;
  transition: all 0.6s ease;
  text-align: center;
`

// Estilos para el texto del título
const StyledTitle = styled('span')`
  font-size: 1rem;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`

// Estilos para el texto del subtítulo
const StyledSubtitle = styled('span')`
  font-size: 0.8rem;
  color: #ffffff;
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`

const MenuIcons = () => {
  const [hovered, setHovered] = useState(false)
  const controls = useAnimation()

  const handleMouseEnter = () => {
    setHovered(true)
    controls.start({
      y: [0, -10, -20, -30, -20, -10, 0],
      transition: { duration: 0.4, ease: 'easeInOut' },
    })
  }

  const handleMouseLeave = () => {
    setHovered(false)
    controls.start({ y: 0, transition: { duration: 0.4, ease: 'easeInOut' } })
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
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1 1 30%',
            maxWidth: '250px',
          }}
        >
          <StyledIconButton>
            {hovered ? (
              <Icon sx={{ color: color }} />
            ) : (
              <CircleIcon sx={{ color: color }} />
            )}
          </StyledIconButton>
          <TextContainer hovered={hovered}>
            <StyledTitle>{title}</StyledTitle>
            <StyledSubtitle>{subtitle}</StyledSubtitle>
          </TextContainer>
        </motion.div>
      ))}
    </StyledMenu>
  )
}

export default MenuIcons
