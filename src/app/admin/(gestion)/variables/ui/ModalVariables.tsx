import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  VariablesCRUDType,
  CrearEditarVariablesType,
  SubSectorType,
  GraficoType,
} from '../types/variablesCRUDTypes'
import {
  FormInputDropdown,
  FormInputText,
  FormInputTextWithIcon,
} from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import FormInputFile from '@/components/form/FormInputFile'
import * as XLSX from 'xlsx'
import { IconoTooltip } from '@/components/botones/IconoTooltip'

import { makeStyles } from '@mui/material'

import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
//import { SketchPicker } from 'react-color'
import SketchPicker from '@/components/Sketch/Sketch'

import {
  VariablesType,
  GraficosVarType,
} from '../../subsector/types/subSectorCRUDTypes'
import {
  TipoGraficoType,
  GraficoTypes,
} from '../../fichas/types/tipoGraficoTypes'
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
  console.log('🚀🚀🚀 : nombreTipoGrafico', nombreTipoGrafico)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control, setValue } = useForm<CrearEditarVariablesType>(
    {
      defaultValues: {
        id: variable?.id,
        nombre: variable?.nombre,
        nombreCorto: variable?.nombreCorto,
        posicion: variable?.posicion,
        idSubSector: idSubSectorData, // variable?.subsector.id,
        idGrafico: variable?.idGrafico,
        //Valores para grafico
        titulo: grafico?.titulo,
        colorFondoTitulo: grafico?.colorFondoTitulo || '',
        ancho: grafico?.ancho,
        idTipoGrafico: grafico?.idTipoGrafico,
      },
    }
  )

  const handleChangeComplete = (color: any) => {
    setCurrentColor(color)
    setValue('colorFondoTitulo', color.hex)
  }

  const guardarActualizarVariables = async (data: CrearEditarVariablesType) => {
    console.log('Esto esta en el front', data)
    const resultado = await guardarActualizarGraficoPeticion(data)
    if (resultado.datos.id) {
      data.idGrafico = resultado.datos.id
      console.log('Hay id del grafico', resultado.datos.id)
    }
    console.log('Resultado de guardar grafico', resultado.datos.id)
    await guardarActualizarVariablesPeticion(data)
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
    variable: CrearEditarVariablesType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/grafico${
          variable.idGrafico ? `/${variable.idGrafico}` : ''
        }`,
        method: !!variable.idGrafico ? 'patch' : 'post',
        body: {
          ...variable,
        },
      })

      accionCorrecta()
      return respuesta
    } catch (e) {
      imprimir(`Error al crear o actualizar grafico: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
      throw e // Lanza la excepcion
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
    //setCurrentColor(color.hex)
    //handleClosePaletaColorPrimario()

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
                {/* <Grid item xs={12} sm={12} md={4}>
                  <FormInputText
                    id={'posicion'}
                    control={control}
                    name="posicion"
                    label="Posición"
                    rules={{ required: 'Este campo es requerido' }}
                  />
                </Grid> */}

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
                  {/* <FormInputText
                    id={'colorFondoTitulo'}
                    control={control}
                    name="colorFondoTitulo"
                    label="Color"
                    rules={{ required: 'Este campo es requerido' }}
                  /> */}

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
