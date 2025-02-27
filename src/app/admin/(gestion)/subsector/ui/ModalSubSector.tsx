import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  SubSectorCRUDType,
  CrearEditarSubSectorType,
  SectorType,
  GuardarSubSectorType,
} from '../types/subSectorCRUDTypes'
import { FormInputText } from '@/components/form'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { FormInputAutocomplete } from '@/components/form/FormInputAutocomplete'
import { CustomSwitch } from '@/components/botones/CustomSwitch'
import FormControl from '@mui/material/FormControl'
import DynamicIcon from '@/components/IconRenderer/IconAutocomplete'
export type CustomOptionType<K> = K & { key: string }

export interface ModalSubSectorType {
  subSector?: SubSectorCRUDType | undefined | null
  sector?: SectorType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalSubSector = ({
  subSector,
  accionCorrecta,
  accionCancelar,
}: ModalSubSectorType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const storedData = localStorage?.getItem('fichaStorage')
  const initialFicha = storedData ? JSON.parse(storedData) : null
  const [activaSwitchVisibleGeneral, seActivaSwitchVisibleGeneral] =
    useState<boolean>(subSector?.vistasVisualizadas.datosGenerales ?? false)
  const [activaSwitchVisibleSectorial, seActivaSwitchVisibleSectorial] =
    useState<boolean>(subSector?.vistasVisualizadas.datosSectoriales ?? false)
  const [activaSwitchVisibleComparativa, seActivaSwitchVisibleComparativa] =
    useState<boolean>(subSector?.vistasVisualizadas.comparativaGGAA ?? false)
  const [activaSwitchVisibleCruce, seActivaSwitchVisibleCruce] =
    useState<boolean>(subSector?.vistasVisualizadas.cruceDeVariables ?? false)
  const [activaSwitchVisibleGeorrefencia, seActivaSwitchVisibleGeorreferencia] =
    useState<boolean>(
      subSector?.vistasVisualizadas.georeferenciaDeVariables ?? false
    )

  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const [todosIconos, setTodosIconos] = useState<CustomOptionType<any>[]>([])
  const [, setIconosFiltrados] = useState<CustomOptionType<any>[]>([])

  const { handleSubmit, control, watch } = useForm<CrearEditarSubSectorType>({
    defaultValues: {
      id: subSector?.id,
      nombre: subSector?.nombre,
      nombreCorto: subSector?.nombreCorto,
      codigoSubSector: subSector?.codigoSubSector,
      icono: subSector?.icono
        ? {
            value: subSector?.icono,
            label: subSector?.icono,
            key: subSector?.icono,
          }
        : undefined,
      vistasVisualizadas: {
        datosGenerales: subSector?.vistasVisualizadas.datosGenerales,
        datosSectoriales: subSector?.vistasVisualizadas.datosSectoriales,
        comparativaGGAA: subSector?.vistasVisualizadas.comparativaGGAA,
        cruceDeVariables: subSector?.vistasVisualizadas.cruceDeVariables,
        georeferenciaDeVariables:
          subSector?.vistasVisualizadas.georeferenciaDeVariables,
      },
      idSector: initialFicha?.id,
    },
  })

  const guardarActualizarSubSector = async (data: CrearEditarSubSectorType) => {
    data.vistasVisualizadas.datosGenerales = activaSwitchVisibleGeneral
    data.vistasVisualizadas.datosSectoriales = activaSwitchVisibleSectorial
    data.vistasVisualizadas.comparativaGGAA = activaSwitchVisibleComparativa
    data.vistasVisualizadas.cruceDeVariables = activaSwitchVisibleCruce
    data.vistasVisualizadas.georeferenciaDeVariables =
      activaSwitchVisibleGeorrefencia

    await guardarActualizarSubSectorPeticion({
      id: data.id,
      nombre: data.nombre,
      nombreCorto: data.nombreCorto,
      codigoSubSector: data.codigoSubSector,
      vistasVisualizadas: {
        datosGenerales: data.vistasVisualizadas.datosGenerales,
        datosSectoriales: data.vistasVisualizadas.datosSectoriales,
        comparativaGGAA: data.vistasVisualizadas.comparativaGGAA,
        cruceDeVariables: data.vistasVisualizadas.cruceDeVariables,
        georeferenciaDeVariables:
          data.vistasVisualizadas.georeferenciaDeVariables,
      },
      icono: data.icono?.value,
      idSector: data.idSector,
    })
  }

  const guardarActualizarSubSectorPeticion = async (
    subSector: GuardarSubSectorType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/subsector${
          subSector.id ? `/${subSector.id}` : ''
        }`,
        method: !!subSector.id ? 'patch' : 'post',
        body: {
          ...subSector,
        },
      })

      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar sub sector: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }

  const iconoWatch = watch('icono')

  const mostrarIconos = async () => {
    const iconos = await import('@/iconosSvg/iconos.json')

    const opcionesIconos = Object.keys(iconos).map((value) => ({
      key: value,
      label: value,
      value: value,
    }))
    setTodosIconos(opcionesIconos)
    setIconosFiltrados(opcionesIconos.slice(0, 10))
  }

  const handleInputChangeIcon = (event: any, value: any) => {
    if (value) {
      const resultadosFiltrados = todosIconos.filter((icono) =>
        icono.label.toLowerCase().includes(value.toLowerCase())
      )
      setIconosFiltrados(resultadosFiltrados.slice(0, 10))
    } else {
      setIconosFiltrados(todosIconos.slice(0, 10))
    }
  }

  useEffect(() => {
    mostrarIconos().finally(() => {})
  }, [])

  const marcadorEsVisibleGeneral = () => {
    if (activaSwitchVisibleGeneral) seActivaSwitchVisibleGeneral(false)
    else seActivaSwitchVisibleGeneral(true)
  }

  const marcadorEsVisibleSectorial = () => {
    if (activaSwitchVisibleSectorial) seActivaSwitchVisibleSectorial(false)
    else seActivaSwitchVisibleSectorial(true)
  }

  const marcadorEsVisibleComparativa = () => {
    if (activaSwitchVisibleComparativa) seActivaSwitchVisibleComparativa(false)
    else seActivaSwitchVisibleComparativa(true)
  }

  const marcadorEsVisibleCruce = () => {
    if (activaSwitchVisibleCruce) seActivaSwitchVisibleCruce(false)
    else seActivaSwitchVisibleCruce(true)
  }

  const marcadorEsVisibleGeorreferencia = () => {
    if (activaSwitchVisibleGeorrefencia)
      seActivaSwitchVisibleGeorreferencia(false)
    else seActivaSwitchVisibleGeorreferencia(true)
  }

  return (
    <>
      <form onSubmit={handleSubmit(guardarActualizarSubSector)}>
        <DialogContent dividers>
          <Grid container direction={'column'} justifyContent="space-evenly">
            <Box height={'5px'} />
            <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
              <Grid item xs={12} sm={12} md={8}>
                <FormInputText
                  id={'nombre'}
                  control={control}
                  name="nombre"
                  label="Nombre"
                  rules={{ required: 'Este campo es requerido' }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <FormInputText
                  id={'codigoSubSector'}
                  control={control}
                  name="codigoSubSector"
                  label="Código"
                  rules={{
                    required: 'Este campo es requerido',
                    maxLength: {
                      value: 5,
                      message: 'Este campo acepta como máximo 5 caracteres',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6}>
                <FormInputText
                  id={'nombreCorto'}
                  control={control}
                  name="nombreCorto"
                  label="Nombre Corto"
                  rules={{ required: 'Este campo es requerido' }}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6}>
                <FormInputAutocomplete
                  id={'icono'}
                  control={control}
                  name="icono"
                  label="Icono"
                  rules={{ required: 'Este campo es requerido' }}
                  freeSolo
                  newValues
                  forcePopupIcon
                  options={todosIconos}
                  onInputChange={handleInputChangeIcon}
                  InputProps={{
                    startAdornment: iconoWatch?.value && (
                      <DynamicIcon iconName={iconoWatch.label} />
                    ),
                  }}
                  getOptionLabel={(option) => option.label}
                  renderOption={(option) => (
                    <>
                      <DynamicIcon iconName={option.label} />
                      <Box sx={{ ml: 2 }}>{option.label}</Box>
                    </>
                  )}
                />
              </Grid>

              <FormControl sx={{ marginLeft: 4, width: '100%' }} size="small">
                <label htmlFor="tutu">Visualizadas en las vistas:</label>
              </FormControl>

              <Grid item xs={12} sm={12} md={4}>
                <CustomSwitch
                  id={'vistasVisualizadas.datosGenerales'}
                  titulo={
                    activaSwitchVisibleGeneral
                      ? 'Es visible en vistas general'
                      : 'No es visible en vistas general'
                  }
                  accion={() => {
                    marcadorEsVisibleGeneral()
                  }}
                  desactivado={false}
                  color={'success'}
                  marcado={activaSwitchVisibleGeneral}
                  name={'vistasVisualizadas.datosGenerales'}
                />
                <label htmlFor="Es Visible">General</label>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <CustomSwitch
                  id={'vistasVisualizadas.datosSectoriales'}
                  titulo={
                    activaSwitchVisibleSectorial
                      ? 'Es visible en vistas sectorial'
                      : 'No es visible en vistas sectorial'
                  }
                  accion={() => {
                    marcadorEsVisibleSectorial()
                  }}
                  desactivado={false}
                  color={'success'}
                  marcado={activaSwitchVisibleSectorial}
                  name={'vistasVisualizadas.datosSectoriales'}
                />
                <label htmlFor="Es Visible">Sectorial</label>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <CustomSwitch
                  id={'vistasVisualizadas.comparativaGGAA'}
                  titulo={
                    activaSwitchVisibleComparativa
                      ? 'Es visible en vistas comparativa'
                      : 'No es visible en vistas comparativa'
                  }
                  accion={() => {
                    marcadorEsVisibleComparativa()
                  }}
                  desactivado={false}
                  color={'success'}
                  marcado={activaSwitchVisibleComparativa}
                  name={'vistasVisualizadas.comparativaGGAA'}
                />
                <label htmlFor="Es Visible">Comparativa</label>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <CustomSwitch
                  id={'vistasVisualizadas.cruceDeVariables'}
                  titulo={
                    activaSwitchVisibleCruce
                      ? 'Es visible en vistas cruce variable'
                      : 'No es visible en vistas cruce variable'
                  }
                  accion={() => {
                    marcadorEsVisibleCruce()
                  }}
                  desactivado={false}
                  color={'success'}
                  marcado={activaSwitchVisibleCruce}
                  name={'vistasVisualizadas.cruceDeVariables'}
                />
                <label htmlFor="Es Visible">Cruce de variable</label>
              </Grid>
              <Grid item xs={12} sm={12} md={5}>
                <CustomSwitch
                  id={'vistasVisualizadas.georeferenciaDeVariables'}
                  titulo={
                    activaSwitchVisibleGeorrefencia
                      ? 'Es visible en vistas Georreferenciación'
                      : 'No es visible en vistas Georreferenciación'
                  }
                  accion={() => {
                    marcadorEsVisibleGeorreferencia()
                  }}
                  desactivado={false}
                  color={'success'}
                  marcado={activaSwitchVisibleGeorrefencia}
                  name={'vistasVisualizadas.georeferenciaDeVariables'}
                />
                <label htmlFor="Es Visible">Georreferenciación</label>
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
