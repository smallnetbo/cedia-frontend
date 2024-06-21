'use client'
import React, { useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'
import IconButton from '@mui/material/IconButton'
import CircleIcon from '@mui/icons-material/Circle'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import PublicIcon from '@mui/icons-material/Public'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { styled } from '@mui/system'
import { useRouter } from 'next/navigation'
import { Constantes } from '@/config/Constantes'

const Container = styled('div')`
  position: relative;
  height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 20px;

  @media (min-width: 960px) {
    flex-direction: row;
    justify-content: space-between;
  }
`

const IconContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center; /* Alinear los iconos al centro verticalmente */
  justify-content: flex-start; /* Alinear los iconos al inicio horizontalmente */
  margin-bottom: 20px;

  @media (min-width: 960px) {
    justify-content: flex-start; /* Alineación adicional para pantallas más grandes */
    align-items: flex-start; /* Alineación adicional para pantallas más grandes */
    margin-bottom: 0;
    padding-left: 20px; /* Espacio adicional a la izquierda para alejar los iconos del borde */
    flex: 1;
  }

  @media (max-width: 960px) {
    display: none;
  }
`

const PaperContainer = styled('div')`
  width: 100%;
  margin: 0 auto;

  @media (min-width: 960px) {
    margin-right: 20px; /* Espacio adicional a la derecha para alejar el PaperContainer del borde */
    flex: 1;
  }
`

const StyledMenu = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 1;
`

const TextContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  margin-left: 8px;
  max-height: 100px;
  overflow: hidden;
`

const StyledTitle = styled('span')`
  font-size: 16px;
  font-weight: bold;
`

const StyledSubtitle = styled('span')`
  font-size: 12px;
  color: #ffffff;
`

const StyledIconButton = styled(IconButton)`
  && {
    font-size: 38px;
    margin: 0.5px;
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1);
    }
  }
`

const PaperTitle = styled('h2')`
  font-size: 16px;
  font-weight: bold;
  padding: 5px 20px;
  background-color: rgba(154, 154, 154, 0.2);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
`

const PaperContent = styled('div')`
  padding: 14px;
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  text-align: justify;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
`
const BackgroundImage = styled('div')<{ show: boolean }>`
  position: absolute;
  top: -120px;
  left: 0;
  width: 90%;
  height: 120%;
  background-size: contain; /* Ajuste para mantener la calidad de la imagen */
  background-position: center top; /* Centrar la imagen */
  background-repeat: no-repeat;
  opacity: ${(props) => (props.show ? 0.4 : 0)};
  transition: opacity 0.5s ease-in-out;
`

const MenuPrincipal = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const router = useRouter()

  const handleMouseEnter = (index: any) => {
    setHoveredIndex(index)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  const handleNavigation = async (path: any) => {
    setLoading(true)
    await router.push(path)
    setLoading(false)
  }

  const icons = [
    {
      icon: AccountCircleIcon,
      color: '#a6ce3e',
      title: 'Niveles de Gobierno',
      subtitle:
        'Departamental / Municipal / Indigena Originario Capesino / Regional',
      backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-verde.png)`,
    },
    {
      icon: TravelExploreIcon,
      color: '#a6ce3e',
      title: 'Datos Generales y Sectoriales',
      subtitle: 'Electoral (2015-2021) / Fiscal / Género / Política de cuidado',
      backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-verde.png)`,
    },
    {
      icon: ListAltIcon,
      color: '#0ec9ae',
      title: 'Comparativas entre Gobiernos Autónomos',
      subtitle: 'Según: GAD / Categoria Municipal y GAM/ GAIOC / GAR',
      backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-turquesa.png)`,
    },
    {
      icon: AutoStoriesIcon,
      color: '#0ec9ae',
      title: 'Cruce de Variables Sectoriales',
      subtitle:
        'Según: GAD / Grupos de Municipios por Dptos / Grupo de municipios por Categoria Municipal / GAIOC',
      backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-turquesa.png)`,
    },
    {
      icon: PublicIcon,
      color: '#f7931e',
      title: 'Georeferenciación de Variables Sectoriales',
      subtitle: 'Según Nivel de Gobierno',
      backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-naranja.png)`,
    },
    {
      icon: AssessmentIcon,
      color: '#f7931e',
      title: 'Índices e Indicadores',
      subtitle: 'Evaluación del ejercicio efectivo de competencias',
      backgroundImage: `url(${Constantes.sitePath}/inicio/mapa-naranja.png)`,
    },
  ]

  return (
    <Container>
      <BackgroundImage
        show={hoveredIndex !== null}
        style={{
          backgroundImage:
            hoveredIndex !== null
              ? icons[hoveredIndex].backgroundImage
              : 'none',
        }}
      />
      <IconContainer>
        <StyledMenu>
          {icons.map(({ icon: Icon, color, title, subtitle }, index) => (
            <motion.div
              key={index}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <StyledIconButton>
                <motion.div
                  animate={{ scale: hoveredIndex === index ? 1.5 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {hoveredIndex ? (
                    <Icon sx={{ color: color }} />
                  ) : (
                    <CircleIcon sx={{ color: color }} />
                  )}
                </motion.div>
                <TextContainer
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredIndex !== null ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <StyledTitle sx={{ color: color }}>{title}</StyledTitle>
                  <StyledSubtitle>{subtitle}</StyledSubtitle>
                </TextContainer>
              </StyledIconButton>
            </motion.div>
          ))}
        </StyledMenu>
      </IconContainer>
      <PaperContainer>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: icons.length * 0.2 }}
        >
          <div style={{ marginBottom: '10px', width: '100%' }}>
            <PaperTitle>
              LEY N° 031, Art. 129: (...) <br />
              Atribuciones del SEA, en el ámbito de la información:
            </PaperTitle>
            <PaperContent>
              <p>
                1. Procesar, sistematizar y evaluar periódicamente el desarrollo
                y evolución del proceso automático y la situación de las
                entidades territoriales autónomas, haciendo conocer sus
                resultados del Consejo Nacional de Autonomías
              </p>
              <p>
                2. Poner a disposición de la población toda la información
                relacionada a las entidades territoriales, para lo cual todas
                las entidades públicas deberán proporcionar los datos que sean
                requeridos por el Servicio Estatal de Autonomías. La información
                pública del Servicio Estatal de Autonomías será considerada como
                oficial
              </p>
            </PaperContent>
          </div>
          <div style={{ marginTop: '10px', width: '100%', textAlign: 'right' }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{ width: '200px', color: '#fff', marginRight: '10px' }}
              onClick={() => handleNavigation('/datosGenerales')}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'INICIAR'
              )}
            </Button>
            <Button
              variant="contained"
              size="large"
              color="inherit"
              sx={{ width: '200px', color: 'black' }}
              onClick={() => handleNavigation('/fichasSectoriales')}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'FICHAS SECTORIALES'
              )}
            </Button>
          </div>
        </motion.div>
      </PaperContainer>
    </Container>
  )
}

export default MenuPrincipal
