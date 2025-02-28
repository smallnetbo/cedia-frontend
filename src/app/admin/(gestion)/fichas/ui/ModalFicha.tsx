import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import { CrearEditarFichaType, FichaCRUDType } from '../types/fichaCRUDTypes'
import {
  FormInputDropdown,
  FormInputText,
  FormInputDate,
} from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'

export interface ModalEntidadType {
  ficha?: FichaCRUDType | undefined | null
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalFicha = ({
  ficha,
  accionCorrecta,
  accionCancelar,
}: ModalEntidadType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control } = useForm<CrearEditarFichaType>({
    defaultValues: {
      id: ficha?.id,
      codigoSector: ficha?.codigoSector,
      nombre: ficha?.nombre,
      nombreCorto: ficha?.nombreCorto,
      tipoSector: ficha?.tipoSector,
      colorPrimario: ficha?.colorPrimario,
      colorSecundario: ficha?.colorSecundario,
      fechaInicio: ficha?.fechaInicio,
      fechaFin: ficha?.fechaFin,
    },
  })

  const [mostrarAlertaInfoCargaArchivo, setMostrarAlertaInfoCargaArchivo] =
    useState(false)

  const guardarActualizarFicha = async (data: CrearEditarFichaType) => {
    await guardarActualizarFichaPeticion(data)
  }

  const guardarActualizarFichaPeticion = async (
    ficha: CrearEditarFichaType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/sector${ficha.id ? `/${ficha.id}` : ''}`,
        method: !!ficha.id ? 'patch' : 'post',
        body: {
          ...ficha,
        },
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar ficha: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }

  const aceptarAlertaInfoCargaArchivo = () => {
    setMostrarAlertaInfoCargaArchivo(false)
  }

  const tipoFicha = [
    { valor: 'CIUDADANO', nombre: 'CIUDADANO' },
    { valor: 'FISCAL', nombre: 'FISCAL' },
    { valor: 'GENERAL', nombre: 'GENERAL' },
    { valor: 'GENERO', nombre: 'GENERO' },
  ]

  return (
    <>
      <AlertDialog
        isOpen={mostrarAlertaInfoCargaArchivo}
        titulo={'Informacion del formato para el archivo'}
        texto={'Texto'}
      >
        <Button variant={'contained'} onClick={aceptarAlertaInfoCargaArchivo}>
          Aceptar
        </Button>
      </AlertDialog>

      <form onSubmit={handleSubmit(guardarActualizarFicha)}>
        <DialogContent dividers>
          <Grid container direction={'column'} justifyContent="space-evenly">
            <Box height={'5px'} />
            <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
              <Grid item xs={12} sm={12} md={8}>
                <FormInputText
                  id={'codigoSector'}
                  control={control}
                  name="codigoSector"
                  label="Codigo Sector"
                />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <FormInputText
                  id={'colorPrimario'}
                  control={control}
                  name="colorPrimario"
                  label="Color Primario"
                />
              </Grid>

              <Grid item xs={12} sm={12} md={12}>
                <FormInputText
                  id={'nombre'}
                  control={control}
                  name="nombre"
                  label="Nombre"
                  clearable={true}
                  rules={{ required: 'Este campo es requerido' }}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={8}>
                <FormInputText
                  id={'nombreCorto'}
                  control={control}
                  name="nombreCorto"
                  label="Nombre Corto"
                />
              </Grid>

              <Grid item xs={12} sm={12} md={4}>
                <FormInputText
                  id={'colorSecundario'}
                  control={control}
                  name="colorSecundario"
                  label="Color Secundario"
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6}>
                <FormInputDropdown
                  id={'tipoSector'}
                  name="tipoSector"
                  control={control}
                  label="Tipo Ficha"
                  disabled={loadingModal}
                  options={tipoFicha.map((tpf) => ({
                    key: tpf.valor,
                    value: tpf.valor,
                    label: tpf.nombre,
                  }))}
                  rules={{ required: 'Este campo es requerido' }}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6}>
                <FormInputDate
                  id={'fechaInicio'}
                  control={control}
                  name="fechaInicio"
                  label="Fecha Inicio"
                  rules={{ required: 'Este campo es requerido' }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormInputDate
                  id={'fechaFin'}
                  control={control}
                  name="fechaFin"
                  label="Fecha Fin"
                  rules={{ required: 'Este campo es requerido' }}
                />
              </Grid>
            </Grid>
            <Box height={'20px'} />
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            my: 1,
            mx: 2,
            justifyContent: {
              lg: 'flex-end',
              md: 'flex-end',
              xs: 'center',
              sm: 'center',
            },
          }}
        >
          <Button
            variant={'outlined'}
            disabled={loadingModal}
            onClick={accionCancelar}
          >
            Cancelar
          </Button>
          <Button variant={'contained'} disabled={loadingModal} type={'submit'}>
            Guardar
          </Button>
        </DialogActions>
      </form>
    </>
  )
}
