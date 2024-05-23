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
import { useRouter } from 'next/navigation'
import { Constantes } from '@/config/Constantes'

// Estilos para el contenedor del menú
const StyledMenu = styled('div')`
  position: absolute;
  top: 40%;
  left: 200px; /* Ajuste de la posición a la izquierda */
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 999; /* Asegura que el menú esté por encima de otros elementos */
`
// Estilos para el contenedor de Botones
const StyledButton = styled('div')`
  position: absolute;
  top: 65%;
  left: 80%; /* Ajuste de la posición a la izquierda */
  transform: translateY(-50%);
  display: flex;
  gap: 10px;
  align-items: flex-start;
  z-index: 999; /* Asegura que el menú esté por encima de otros elementos */
`

// Estilos para el contenedor principal
const Container = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; /* Ocupa todo el ancho de la pantalla */
  height: 100vh; /* Ocupa todo el alto de la pantalla */
  background-image: url(${Constantes.sitePath}/inicio/fondo.png);
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
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

const PaperTitle = styled('h2')`
  font-size: 16px;
  font-weight: bold;
  padding: 10px 20px;
  margin: 0 auto;
  background-color: rgba(0, 0, 0, 0.3); /* Fondo negro con opacidad */
  color: rgba(255, 255, 255, 0.7); /* Color del texto con opacidad */
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
`

const PaperContent = styled('div')`
  padding: 14px;
  margin: 0 auto;
  max-width: 600px;
  background-color: rgba(0, 0, 0, 0.3); /* Fondo negro con opacidad */
  color: rgba(255, 255, 255, 0.7); /* Color del texto con opacidad */
  border-radius: 5px;
  text-align: justify;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1); /* Agregar sombra */
`

const BackgroundImage = styled('img')`
  top: 20;
  left: 50;
  width: 40%;
  height: 80%;
  object-fit: cover;
  z-index: 1; /* Para que la imagen esté detrás de otros elementos */
  opacity: 0.3; /* Ajusta el valor de opacidad según sea necesario */
`
// Componente MenuPrincipal
const MenuPrincipal = () => {
  const [hovered, setHovered] = useState(false)
  const router = useRouter()

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
      <BackgroundImage
        src={`${Constantes.sitePath}/inicio/mapa-naranja.png`}
        alt="Background Image"
      />
      <StyledMenu>
        {icons.map(({ icon: Icon, color, title, subtitle }, index) => (
          <StyledIconButton
            key={index}
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
        ))}
      </StyledMenu>
      <div style={{ textAlign: 'center' }}>
        <PaperTitle>
          LEY N° 031, Art. 129: (...) <br />
          Atribuciones del SEA, en el ámbito de la información:
        </PaperTitle>
        <PaperContent>
          <p>
            1. Procesar, sistematizar y evaluar periódicamente el desarrollo y
            evolución del proceso automático y la situación de las entidades
            territoriales autónomas, haciendo conocer sus resultados del Consejo
            Nacional de Autonomías
          </p>
          <p>
            2. Poner a disposición de la población toda la información
            relacionada a las entidades territoriales, para lo cual todas las
            entidades públicas deberán proporcionar los datos que sean
            requeridos por el Servicio Estatal de Autonomías. La información
            pública del Servicio Estatal de Autonomías será considerada como
            oficial
          </p>
        </PaperContent>
      </div>
      <StyledButton>
        <Button
          variant="contained"
          size="large"
          color="primary"
          sx={{ width: '120px', color: 'white' }}
          onClick={() => {
            router.replace('/datosGenerales')
          }}
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
    </Container>
  )
}

export default MenuPrincipal
