import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  CrearEditarVariablesType,
  SubSectorType,
  GraficoType,
} from '../types/variablesCRUDTypes'
import {
  FormInputDropdown,
  FormInputText,
  FormInputTextWithIcon,
} from '@/components/form'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'

import Paper from '@mui/material/Paper'
import SketchPicker from '@/components/Sketch/Sketch'

import {
  VariablesType,
  GraficosVarType,
} from '../../subsector/types/subSectorCRUDTypes'
import { TipoGraficoType } from '../../fichas/types/tipoGraficoTypes'
import TipoGrafico from '@/components/echarts/listaGraficos/tipoGrafico'
import Popover from '@mui/material/Popover'

export interface ModalVariablesType {
  variable?: VariablesType | undefined | null
  grafico?: GraficosVarType | undefined | null
  idSubSectorData?: string
  subsector: SubSectorType[]
  graficos: GraficoType[]
  tipoGrafico: TipoGraficoType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalVaribles = ({
  variable,
  grafico,
  idSubSectorData,
  subsector,
  graficos,
  tipoGrafico,
  accionCorrecta,
  accionCancelar,
}: ModalVariablesType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const [currentColor, setCurrentColor] = useState(
    grafico?.colorFondoTitulo ?? '#00AE98'
  )
  const [anchorElColorFondoTitulo, setAnchorElColorFondoTitulo] =
    useState<HTMLButtonElement | null>(null)

  const [nombreTipoGrafico, setNombreTipoGrafico] = useState<string>()
  const [nombreGraficoPdf, setNombreGraficoPdf] = useState<string>()
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control, setValue } = useForm<CrearEditarVariablesType>(
    {
      defaultValues: {
        id: variable?.id,
        nombre: variable?.nombre,
        nombreCorto: variable?.nombreCorto,
        posicion: variable?.posicion,
        idSubSector: idSubSectorData,
        idGrafico: variable?.idGrafico,
        idGraficoPdf: variable?.idGraficoPdf,
        //Valores para grafico
        titulo: grafico?.titulo,
        colorFondoTitulo: grafico?.colorFondoTitulo || '',
        ancho: grafico?.ancho,
        idTipoGrafico: grafico?.idTipoGrafico,
        idTipoGraficoPdf: grafico?.idTipoGraficoPdf,
      },
    }
  )

  const guardarActualizarVariables = async (data: CrearEditarVariablesType) => {
    try {
      setLoadingModal(true)
      await delay(1000)

      let resultadoGrafico: any = null
      if (data.idTipoGrafico) {
        resultadoGrafico = await guardarActualizarGraficoPeticion(
          data,
          data.idGrafico,
          data.idTipoGrafico
        )
        if (resultadoGrafico.datos.id) {
          data.idGrafico = resultadoGrafico.datos.id
        }
      }

      let resultadoGraficoPdf: any = null
      if (data.idTipoGraficoPdf) {
        resultadoGraficoPdf = await guardarActualizarGraficoPeticion(
          data,
          data.idGraficoPdf,
          data.idTipoGraficoPdf
        )
        if (resultadoGraficoPdf.datos.id) {
          data.idGraficoPdf = resultadoGraficoPdf.datos.id
        }
      }

      await guardarActualizarVariablesPeticion(data)
    } catch (e) {
      imprimir(`Error al crear o actualizar variables: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }

  const guardarActualizarVariablesPeticion = async (
    variable: CrearEditarVariablesType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/variables${
          variable.id ? `/${variable.id}` : ''
        }`,
        method: !!variable.id ? 'patch' : 'post',
        body: {
          ...variable,
        },
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar variables: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }
  const guardarActualizarGraficoPeticion = async (
    variable: CrearEditarVariablesType,
    idGrafico: string | undefined,
    idTipoGrafico: string
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/grafico${idGrafico ? `/${idGrafico}` : ''}`,
        method: idGrafico ? 'patch' : 'post',
        body: {
          titulo: variable.titulo,
          colorFondoTitulo: variable.colorFondoTitulo,
          ancho: variable.ancho,
          idTipoGrafico: idTipoGrafico,
        },
      })

      return respuesta
    } catch (e) {
      imprimir(`Error al crear o actualizar gráfico: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e // Lanzar excepción
    } finally {
      setLoadingModal(false)
    }
  }
  const anchografico = [
    { valor: '50', nombre: '50 %' },
    { valor: '100', nombre: '100 %' },
  ]

  const handleIconClickColorFondoTitulo = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorElColorFondoTitulo(event.currentTarget)
  }
  const handleClosePaletaColorFondoTitulo = () => {
    setAnchorElColorFondoTitulo(null)
  }
  const handleChangeCompleteColorFondoTitulo = (color: any) => {
    setCurrentColor(color)
    setValue('colorFondoTitulo', color.hex)
  }
  const openPaletaColorFondoTitulo = Boolean(anchorElColorFondoTitulo)
  const idPopColorFondoTitulo = openPaletaColorFondoTitulo
    ? 'color-popoverFondoTitulo'
    : undefined

  return (
    <>
      <form onSubmit={handleSubmit(guardarActualizarVariables)}>
        <DialogContent dividers>
          {/* Prueba para el formulario */}
          <Grid container direction="row" justifyContent="space-evenly">
            {/* Espacio entre las dos columnas */}
            <Box height={'5px'} />

            {/* Primera columna */}
            <Grid item xs={12} sm={6} md={6} lg={5}>
              <Grid
                container
                direction="column"
                spacing={{ xs: 2, sm: 1, md: 2 }}
              >
                {/* Input 1 */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{ flex: 1, height: '1px', backgroundColor: 'black' }}
                  />
                  <div>
                    <p style={{ textAlign: 'center' }}>Datos de la Variable</p>
                  </div>
                  <div
                    style={{ flex: 1, height: '1px', backgroundColor: 'black' }}
                  />
                </div>

                <Grid item xs={12} sm={12} md={12}>
                  <FormInputText
                    id={'nombre'}
                    control={control}
                    name="nombre"
                    label="Nombre"
                    rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid>

                {/* Input 2 */}
                <Grid item xs={12} sm={12} md={8}>
                  <FormInputText
                    id={'nombreCorto'}
                    control={control}
                    name="nombreCorto"
                    label="Nombre Corto"
                    rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{ flex: 1, height: '1px', backgroundColor: 'black' }}
                  />
                  <div>
                    <p style={{ textAlign: 'center' }}>Datos del Grafico</p>
                  </div>
                  <div
                    style={{ flex: 1, height: '1px', backgroundColor: 'black' }}
                  />
                </div>

                {/* Input 3 */}
                <Grid item xs={12} sm={12} md={6}>
                  <FormInputText
                    id={'titulo'}
                    control={control}
                    name="titulo"
                    label="Titulo"
                    rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid>

                {/* Input 4 */}
                <Grid item xs={12} sm={12} md={6}>
                  <FormInputTextWithIcon
                    id="colorFondoTitulo"
                    control={control}
                    name="colorFondoTitulo"
                    label="Color"
                    icon={'palette'}
                    onIconClick={handleIconClickColorFondoTitulo}
                  />
                  <Popover
                    id={idPopColorFondoTitulo}
                    open={openPaletaColorFondoTitulo}
                    anchorEl={anchorElColorFondoTitulo}
                    onClose={handleClosePaletaColorFondoTitulo}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                    <SketchPicker
                      color={currentColor}
                      onChangeComplete={handleChangeCompleteColorFondoTitulo}
                    />
                  </Popover>
                </Grid>

                {/* Input 5 */}
                <Grid item xs={12} sm={12} md={4}>
                  <FormInputDropdown
                    id={'ancho'}
                    name="ancho"
                    control={control}
                    label="Ancho de Grafico"
                    options={anchografico.map((ang) => ({
                      key: ang.valor,
                      value: ang.valor,
                      label: ang.nombre,
                    }))}
                    rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Segunda columna */}
            <Grid item xs={12} sm={6} md={6} lg={5}>
              <Grid
                container
                direction="column"
                spacing={{ xs: 2, sm: 1, md: 2 }}
              >
                {/* Input 6 */}
                <Grid item xs={12} sm={12} md={12}>
                  <FormInputDropdown
                    id={'idTipoGrafico'}
                    name="idTipoGrafico"
                    control={control}
                    label="Tipo Grafico"
                    disabled={loadingModal}
                    options={tipoGrafico.map((tpgraf) => ({
                      key: tpgraf.id,
                      value: tpgraf.id,
                      label: tpgraf.nombre,
                    }))}
                    rules={{ required: 'Este campo es requerido' }}
                    onChange={(event) => {
                      const selectedValue = event.target.value
                      const selectedOption = tipoGrafico?.find(
                        (tpgraf) => tpgraf.id === selectedValue
                      )
                      if (selectedOption) {
                        setNombreTipoGrafico(selectedOption.descripcion)
                      }
                    }}
                  />
                </Grid>
                {nombreTipoGrafico && (
                  <Grid item xs={12} sm={12} md={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        '& > :not(style)': {
                          m: 1,
                          width: '100%',
                          height: 250,
                        },
                      }}
                    >
                      <Paper elevation={10}>
                        <TipoGrafico tipoGrafico={nombreTipoGrafico} />
                      </Paper>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} sm={12} md={12}>
                  <FormInputDropdown
                    id={'idTipoGraficoPdf'}
                    name="idTipoGraficoPdf"
                    control={control}
                    label="Tipo Grafico Pdf"
                    disabled={loadingModal}
                    options={tipoGrafico.map((tpgraf) => ({
                      key: tpgraf.id,
                      value: tpgraf.id,
                      label: tpgraf.nombre,
                    }))}
                    onChange={(event) => {
                      const selectedValue = event.target.value
                      const selectedOption = tipoGrafico?.find(
                        (tpgraf) => tpgraf.id === selectedValue
                      )
                      if (selectedOption) {
                        setNombreGraficoPdf(selectedOption.descripcion)
                      }
                    }}
                  />
                </Grid>
                {nombreGraficoPdf && (
                  <Grid item xs={12} sm={12} md={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        '& > :not(style)': {
                          m: 1,
                          width: '100%',
                          height: 250,
                        },
                      }}
                    >
                      <Paper elevation={10}>
                        <TipoGrafico tipoGrafico={nombreGraficoPdf} />
                      </Paper>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Espacio entre las dos columnas */}
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
