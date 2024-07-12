import React from 'react'
import { styled } from '@mui/system'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

// Estilos para el contenedor de Botones
const StyledButton = styled('div')`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  z-index: 999; /* Asegura que el menú esté por encima de otros elementos */
  margin-top: 500px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`

const ActionButtons = () => {
  const router = useRouter()

  return (
    <StyledButton>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
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
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Button
          variant="contained"
          size="large"
          color="inherit"
          sx={{ width: '200px', color: 'black' }}
        >
          FICHAS SECTORIALES
        </Button>
      </motion.div>
    </StyledButton>
  )
}

export default ActionButtons
