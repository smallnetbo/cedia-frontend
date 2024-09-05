'use client'
import React, { useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import { motion } from 'framer-motion'
import IconButton from '@mui/material/IconButton'
import CircleIcon from '@mui/icons-material/Circle'
import { styled } from '@mui/system'
import { useRouter } from 'next/navigation'
import { ICONS } from '../types/menu'

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
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;

  @media (min-width: 960px) {
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 0;
    padding-left: 20px;
    flex: 1;
  }

  @media (max-width: 960px) {
    display: none;
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
  align-items: flex-start;
  margin-top: 20px;
  margin-left: 16px;
  max-height: 100px;
  overflow: hidden;
  transition: opacity 0.5s ease-in-out;
  @media (max-width: 600px) {
    margin-left: 12px;
  }
`

const StyledTitle = styled('span')`
  font-size: 18px;
  font-weight: bold;

  margin-bottom: 4px;

  @media (max-width: 600px) {
    font-size: 16px;
  }
`

const StyledSubtitle = styled('span')`
  font-size: 12px;
  color: #ffffff;
  line-height: 1.5;
`

const StyledIconButton = styled(IconButton)`
  && {
    font-size: 40px;
    margin: 0.5px;
    display: flex;
    align-items: center;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
`

const PaperContainer = styled('div')`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;

  @media (min-width: 960px) {
    margin-right: 20px;
    flex: 1;
  }

  @media (max-width: 600px) {
    width: 100%;
    padding: 0px;
  }
`

const PaperTitle = styled('h2')`
  font-size: 18px;
  font-weight: bold;
  padding: 10px;
  background-color: rgba(154, 154, 154, 0.2);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;

  @media (max-width: 600px) {
    font-size: 14px;
    padding: 8px;
  }
`

const PaperContent = styled('div')`
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 15px;
  text-align: justify;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 600px) {
    font-size: 14px;
    padding: 10px;
  }
`

const ButtonContainer = styled('div')`
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: flex-end;
  }
`

const StyledButton = styled(Button)`
  width: 100%;
  max-width: 100%;

  @media (min-width: 600px) {
    width: 100%;
  }
`
const BackgroundImage = styled('div')<{ show: boolean }>`
  position: absolute;
  top: -120px;
  left: 0;
  width: 90%;
  height: 120%;
  background-size: contain;
  background-position: center top;
  background-repeat: no-repeat;
  opacity: ${(props) => (props.show ? 0.4 : 0)};
  transition: opacity 0.5s ease-in-out;
`

const MenuPrincipal = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [loadingState, setLoadingState] = useState({
    datosGenerales: false,
    fichasSectoriales: false,
  })
  const router = useRouter()

  const handleMouseEnter = (index: any) => {
    setHoveredIndex(index)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  const handleNavigation = async (path: any, buttonKey: string) => {
    setLoadingState((prevState) => ({ ...prevState, [buttonKey]: true }))
    await router.push(path)
    setLoadingState((prevState) => ({ ...prevState, [buttonKey]: false }))
  }

  return (
    <Container>
      <BackgroundImage
        show={hoveredIndex !== null}
        style={{
          backgroundImage:
            hoveredIndex !== null
              ? ICONS[hoveredIndex].backgroundImage
              : 'none',
        }}
      />
      <IconContainer>
        <StyledMenu>
          {ICONS.map(({ icon: Icon, color, title, subtitle }, index) => (
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
          transition={{ duration: 0.5, delay: ICONS.length * 0.2 }}
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
          <ButtonContainer>
            <StyledButton
              variant="contained"
              size="large"
              color="primary"
              onClick={() =>
                handleNavigation('/datosGenerales', 'datosGenerales')
              }
              disabled={loadingState.datosGenerales}
              sx={{ color: 'white' }}
              startIcon={
                loadingState.datosGenerales ? (
                  <CircularProgress size={24} />
                ) : null
              }
            >
              INICIAR
            </StyledButton>

            <StyledButton
              variant="contained"
              size="large"
              color="inherit"
              onClick={() =>
                handleNavigation('/fichasSectoriales', 'fichasSectoriales')
              }
              disabled={loadingState.fichasSectoriales}
              startIcon={
                loadingState.fichasSectoriales ? (
                  <CircularProgress size={24} />
                ) : null
              }
            >
              FICHAS SECTORIALES
            </StyledButton>
          </ButtonContainer>
        </motion.div>
      </PaperContainer>
    </Container>
  )
}

export default MenuPrincipal
