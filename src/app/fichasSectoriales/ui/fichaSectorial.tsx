'use client'

import React, { useEffect, useState } from 'react'
import { Constantes } from '@/config/Constantes'
import { Servicios } from '@/services'
import { imprimir } from '@/utils/imprimir'
import { useAlerts } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { EntidadFicha, Ficha, NivelGobierno } from '../types/fichaType'
import {
  Button,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Box,
  SelectChangeEvent,
  Paper,
} from '@mui/material'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import ModalReporteFicha from './modalReporteFicha'
import FichaSelect from './FichaSelect'
import EntidadSelect from './EntidadSelect'
import SearchIcon from '@mui/icons-material/Search'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { motion } from 'framer-motion'
import NivelGobiernoSelect from './NivelGobiernoSelect'

const FichasSectoriales = () => {
  const { Alerta } = useAlerts()
  const [modalPdf, setModalPdf] = useState(false)
  const [loadingData, setLoadingData] = useState<boolean>(false)
  const [errorData, setErrorData] = useState<any>()
  const [listaFicha, setListaFicha] = useState<Ficha[]>([])
  const [listaEntidad, setListaEntidad] = useState<EntidadFicha[]>([])
  const [listaNivelGobierno, setListaNivelGobierno] = useState<NivelGobierno[]>(
    []
  )
  const [infoEntidadData, setInfoEntidadData] = useState<SubSector | null>(null)
  const [listaEntidadFilter, setListaEntidadFilter] = useState<EntidadFicha[]>(
    []
  )

  const [selectedFicha, setSelectedFicha] = useState<string>('')
  const [selectedNivelGobierno, setSelectedNivelGobierno] = useState<string>('')

  const [selectedEntidad, setSelectedEntidad] = useState<EntidadFicha | null>(
    null
  )
  const [codigoEntidad, setCodigoEntidad] = useState<number>(0)

  const listarFicha = async () => {
    try {
      setLoadingData(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/sector`,
      })
      setListaFicha(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la información`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingData(false)
    }
  }

  const listarNivelGobierno = async () => {
    try {
      setLoadingData(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/nivel-gobierno`,
      })
      setListaNivelGobierno(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la información`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingData(false)
    }
  }

  const listarEntidad = async () => {
    try {
      setLoadingData(true)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/entidad/entidades-mapa`,
      })
      setListaEntidad(respuesta.datos)
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la información`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingData(false)
    }
  }

  const updateInfoEntidad = async (
    primeraEntidad: string,
    tipoSector: string
  ) => {
    try {
      setLoadingData(true)

      let url = `${Constantes.baseUrl}/sector/datos-generales`

      if (primeraEntidad && tipoSector) {
        url += `?codigoEntidad=${primeraEntidad}&tipoSector=${tipoSector}`
      }

      const respuesta = await Servicios.get({ url })

      if (
        !respuesta.datos ||
        (Array.isArray(respuesta.datos) && respuesta.datos.length === 0)
      ) {
        setInfoEntidadData(null)
        Alerta({
          mensaje: 'No hay registros para la entidad seleccionada.',
          variant: 'warning',
        })
      } else {
        setInfoEntidadData(respuesta.datos)
      }
      setErrorData(null)
    } catch (e) {
      imprimir(`Error al obtener la información`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    listarFicha()
    listarNivelGobierno()
    listarEntidad()
  }, [])

  const handleFichaChange = (event: SelectChangeEvent<string>) => {
    setSelectedFicha(event.target.value as string)
  }

  const handleNivelGobiernoChange = (event: SelectChangeEvent<string>) => {
    const selectedValue = event.target.value as string
    setSelectedNivelGobierno(selectedValue)

    const entidadFilter = listaEntidad.filter(
      (entidad) => entidad.nivelGobierno.id === selectedValue
    )
    setListaEntidadFilter(entidadFilter)
  }

  const handleEntidadChange = (
    event: React.ChangeEvent<{}>,
    value: EntidadFicha | null
  ) => {
    setSelectedEntidad(value)
    if (value) {
      setCodigoEntidad(parseInt(value.codigoEntidad))
    }
  }

  const handleButtonClick = () => {
    updateInfoEntidad(codigoEntidad.toString(), selectedFicha)
  }

  const verPdfModal = async () => {
    setModalPdf(true)
  }

  const cerrarModalPdf = async () => {
    setModalPdf(false)
    await delay(500)
  }

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CustomDialog
        isOpen={modalPdf}
        handleClose={cerrarModalPdf}
        title="VISTA PREVIA PDF"
        maxWidth="lg"
      >
        <ModalReporteFicha
          listaReporte={infoEntidadData}
          selectedEntidad={selectedEntidad}
          accionCorrecta={cerrarModalPdf}
          accionCancelar={cerrarModalPdf}
        />
      </CustomDialog>
      {loadingData ? (
        <CircularProgress />
      ) : (
        <Paper
          elevation={4}
          sx={{
            width: '80%',
            padding: '20px',
            borderRadius: '16px',
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                textAlign: 'center',
                marginBottom: '20px',
                color: 'text.primary',
              }}
              component={motion.div}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Fichas Sectoriales
            </Typography>
            <Grid
              container
              spacing={3}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={12} sm={6} md={4}>
                <FichaSelect
                  selectedFicha={selectedFicha}
                  listaFicha={listaFicha}
                  handleFichaChange={handleFichaChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <NivelGobiernoSelect
                  selectedNivelGobierno={selectedNivelGobierno}
                  listaNivelGobierno={listaNivelGobierno}
                  handleNivelGobiernoChange={handleNivelGobiernoChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <EntidadSelect
                  listaEntidad={listaEntidadFilter}
                  selectedEntidad={selectedEntidad}
                  handleEntidadChange={handleEntidadChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleButtonClick}
                  fullWidth
                  startIcon={<SearchIcon />}
                  sx={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Buscar
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={verPdfModal}
                  fullWidth
                  startIcon={<PictureAsPdfIcon />}
                  sx={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    },
                  }}
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ver PDF
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Paper>
      )}
    </Box>
  )
}

export default FichasSectoriales
