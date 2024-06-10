import React, { useState } from 'react'
import { Button, Box, Typography, Grid, Paper } from '@mui/material'
import { styled } from '@mui/system'
import { motion } from 'framer-motion'
import { Ficha } from '../types/fichaType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { delay, InterpreteMensajes } from '@/utils'
import { useAlerts } from '@/hooks'
import { Servicios } from '@/services'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { SubSector } from '../types/reporteType'
import ModalReporteFicha from './modalReporteFicha'
import { filtradoDatosGenerales } from '@/app/datosGenerales/dataUtils/filtradoDatosGenerales'
import { filtradoDatosGeneralesPorEntidad } from '../utils/filtradoDatosGeneralesPorEntidad'

const StyledButton = styled(Button)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  marginTop: 'auto',
}))

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  transition: 'transform 0.3s, box-shadow 0.3s',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
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
  const [modalPdf, setModalPdf] = useState(false)
  const [loadingData, setLoadingData] = useState<boolean>(false)
  const [errorData, setErrorData] = useState<any>()
  const [listaReporte, setListaReporte] = useState<SubSector[]>([])

  const { Alerta } = useAlerts()

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }
  const listarFicha = async (idSector: string) => {
    try {
      setLoadingData(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/sector/reporte/${idSector}`,
      })
      setListaReporte(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la informacion`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoadingData(false)
    }
  }

  const dataDatosGenerales = listaReporte.filter((sector) => {
    return sector.vistasVisualizadas.datosGenerales
  })
  const datoGeneral = filtradoDatosGeneralesPorEntidad(dataDatosGenerales)

  const handleButtonClick = async (idSector: string) => {
    await listarFicha(idSector)
    setModalPdf(true)
  }

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
      <CustomDialog
        isOpen={modalPdf}
        handleClose={cerrarModalPdf}
        title="VISTA PREVIA PDF"
        maxWidth="lg"
      >
        <ModalReporteFicha
          listaReporte={datoGeneral}
          accionCorrecta={() => {
            cerrarModalPdf().finally()
          }}
          accionCancelar={cerrarModalPdf}
        />
      </CustomDialog>
      <Box
        sx={{
          maxWidth: 1200,
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
          style={{ width: '100%' }}
        >
          <Grid container spacing={2} justifyContent="center">
            {listaFicha.map((ficha, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={index}
                sx={{ display: 'flex' }}
              >
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ width: '100%' }}
                >
                  <StyledPaper elevation={3}>
                    <Typography variant="h6" gutterBottom sx={{ flex: 1 }}>
                      {ficha.nombre}
                    </Typography>
                    <StyledButton
                      onClick={() => handleButtonClick(ficha.id)}
                      startIcon={
                        <span
                          className="material-icons"
                          style={{ fontSize: '35px' }}
                        >
                          download_for_offline
                        </span>
                      }
                    />
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
