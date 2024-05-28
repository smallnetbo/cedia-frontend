import React from 'react'
import { styled } from '@mui/system'
import { motion } from 'framer-motion'

// Estilos para el contenedor de texto
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

const InfoContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', marginBottom: '20px' }}
    >
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
          2. Poner a disposición de la población toda la información relacionada
          a las entidades territoriales, para lo cual todas las entidades
          públicas deberán proporcionar los datos que sean requeridos por el
          Servicio Estatal de Autonomías. La información pública del Servicio
          Estatal de Autonomías será considerada como oficial
        </p>
      </PaperContent>
    </motion.div>
  )
}

export default InfoContent
