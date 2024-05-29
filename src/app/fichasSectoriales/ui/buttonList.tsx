// src/components/DynamicButtonList.js

import React from 'react'
import { Button, Box, Typography, Grid, Paper } from '@mui/material'
import { styled } from '@mui/system'
import { motion } from 'framer-motion'
import { Ficha } from '../types/fichaType'

const StyledButton = styled(Button)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'scale(1.50)',
  },
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  transition: 'transform 0.3s, box-shadow 0.3s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
  },
}))

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

interface ListFichaProps {
  listaFicha: Ficha[]
}

const DynamicButtonList: React.FC<ListFichaProps> = ({ listaFicha }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        padding: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: 800,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Lista de Fichas Disponibles
        </Typography>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Grid container spacing={2} justifyContent="center">
            {listaFicha.map((ficha, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StyledPaper elevation={3}>
                    <Typography variant="h6" gutterBottom>
                      {ficha.nombre}
                    </Typography>
                    <StyledButton
                      disabled
                      startIcon={
                        <span
                          className="material-icons"
                          style={{ fontSize: '35px' }}
                        >
                          download_for_offline
                        </span>
                      }
                    ></StyledButton>
                  </StyledPaper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
    </Box>
  )
}

export default DynamicButtonList
