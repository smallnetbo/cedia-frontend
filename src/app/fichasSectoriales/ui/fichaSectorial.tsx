'use client'
import React, { useEffect, useState } from 'react'
import { Constantes } from '@/config/Constantes'
import { Servicios } from '@/services'
import { imprimir } from '@/utils/imprimir'
import { useAlerts } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { EntidadFicha, Ficha } from '../types/fichaType'
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Grid,
  CircularProgress,
  TextField,
  Autocomplete,
} from '@mui/material'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import ModalReporteFicha from './modalReporteFicha'

const FichasSectoriales = () => {
  const { Alerta } = useAlerts()
  const [modalPdf, setModalPdf] = useState(false)
  const [loadingData, setLoadingData] = useState<boolean>(false)
  const [errorData, setErrorData] = useState<any>()
  const [listaFicha, setListaFicha] = useState<Ficha[]>([])
  const [listaEntidad, setListaEntidad] = useState<EntidadFicha[]>([])
  const [infoEntidadData, setInfoEntidadData] = useState<SubSector | null>(null)

  const [selectedFicha, setSelectedFicha] = useState<string>('')
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
      imprimir(`Error al obtener la informacion`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
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
      imprimir(`Error al obtener la informacion`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
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
      imprimir(`Error al obtener la informacion`, e)
      setErrorData(e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    listarFicha()
    listarEntidad()
  }, [])

  const handleFichaChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedFicha(event.target.value as string)
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
    <div
      style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
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
          accionCorrecta={() => {
            cerrarModalPdf().finally()
          }}
          accionCancelar={cerrarModalPdf}
        />
      </CustomDialog>
      {loadingData ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="ficha-label">Seleccione una ficha</InputLabel>
              <Select
                labelId="ficha-label"
                value={selectedFicha}
                onChange={handleFichaChange}
                label="Seleccione una ficha"
              >
                {listaFicha.map((ficha) => (
                  <MenuItem key={ficha.id} value={ficha.id}>
                    {ficha.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              disablePortal
              id="entidad"
              options={listaEntidad}
              getOptionLabel={(option) =>
                `${option.codigoEntidad} - ${option.nombre}`
              }
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              value={selectedEntidad}
              onChange={handleEntidadChange}
              renderInput={(params) => (
                <TextField {...params} label="Seleccione una entidad" />
              )}
              noOptionsText="No encontrado"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
              fullWidth
            >
              Buscar
            </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={verPdfModal}
              fullWidth
            >
              ver pdf
            </Button>
          </Grid>
        </Grid>
      )}
    </div>
  )
}

export default FichasSectoriales
