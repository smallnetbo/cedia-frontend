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
import { Button, CircularProgress } from '@mui/material'
import { useRouter } from 'next/navigation'
import { Constantes } from '@/config/Constantes'
import { motion } from 'framer-motion'

// Estilos para el contenedor del menú
const StyledMenu = styled('div')`
  position: absolute;
  top: 40%;
  left: 10%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 999;
`

// Estilos para el contenedor principal
const Container = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-image: url(${Constantes.sitePath}/inicio/fondo.png);
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`

// Estilos para el contenedor de texto
const TextContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  margin-left: 8px;
  max-height: 100px;
  overflow: hidden;
`

// Estilos para el texto del título
const StyledTitle = styled('span')`
  font-size: 16px;
  font-weight: bold;
`

// Estilos para el texto del subtítulo
const StyledSubtitle = styled('span')`
  font-size: 12px;
  color: #ffffff;
`

// Estilos para los iconos del menú
const StyledIconButton = styled(IconButton)`
  && {
    font-size: 38px;
    margin: 0.5px;
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.5);
    }
  }
`

const PaperTitle = styled('h2')`
  font-size: 16px;
  font-weight: bold;
  padding: 5px 20px;
  margin: 0 auto;
  background-color: rgba(154, 154, 154, 0.2);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
`

const PaperContent = styled('div')`
  padding: 14px;
  margin: 0 auto;
  max-width: 600px;
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  text-align: justify;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
`

const BackgroundImage = styled('img')`
  top: 20;
  left: 50;
  width: 40%;
  height: 80%;
  object-fit: cover;
  z-index: 1;
  opacity: 0.3;
`

// Componente MenuPrincipal
const MenuPrincipal = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const handleMouseEnter = (index) => {
    setHoveredIndex(index)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  const [isLoading, setLoading] = useState(false)
  const router = useRouter()

  const handleNavigation = async (path) => {
    setLoading(true)
    await router.push(path)
    setLoading(false)
  }

  // Iconos y textos correspondientes
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
    <Container>
      <StyledMenu>
        {icons.map(({ icon: Icon, color, title, subtitle }, index) => (
          <motion.div
            key={index}
            initial={{ y: 100 }} // Empieza desde abajo
            animate={{ y: 0 }} // Animación para que suba
            transition={{ duration: 0.5, delay: index * 0.1 }} // Duración y retraso escalonado
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <StyledIconButton>
              <motion.div
                animate={{ scale: hoveredIndex === index ? 1.5 : 1 }} // Escala aumenta al hacer hover
                transition={{ duration: 0.2 }}
              >
                {hoveredIndex === index ? (
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
                <StyledTitle>{title}</StyledTitle>
                <StyledSubtitle>{subtitle}</StyledSubtitle>
              </TextContainer>
            </StyledIconButton>
          </motion.div>
        ))}
      </StyledMenu>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: icons.length * 0.2 }}
      >
        <div
          style={{
            textAlign: 'left',
            marginTop: '20%',
            marginLeft: '100%',
            width: '70%',
            maxWidth: '600px',
          }}
        >
          {/* Tu contenido */}
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
          {/* Botones */}
          <div
            style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}
          >
            <Button
              variant="contained"
              size="large"
              color="primary"
              sx={{ width: '200px', color: '#fff' }}
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
        </div>
      </motion.div>
    </Container>
  )
}

export default MenuPrincipal
