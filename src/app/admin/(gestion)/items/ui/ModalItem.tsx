import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import { CrearEditarItemsType, GuardarItemsType } from '../types/itemsCRUDTypes'
import {
  FormInputDropdown,
  FormInputText,
  optionType,
  FormInputTextWithIcon,
} from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { CustomSwitch } from '@/components/botones/CustomSwitch'
import { ItemsType } from '../../subsector/types/subSectorCRUDTypes'
import SketchPicker from '@/components/Sketch/Sketch'
import { FormInputAutocomplete } from '@/components/form/FormInputAutocomplete'
import { Icono } from '@/components/Icono'
import Popover from '@mui/material/Popover'
import { TipoDatoType } from '../types/tipoDatoTypes'
import DynamicIcon from '@/components/IconRenderer/IconAutocomplete'
export type CustomOptionType<K> = K & { key: string }

export interface ModalItemType {
  item?: ItemsType | undefined | null
  idVariable?: string
  tipoDato: TipoDatoType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalItem = ({
  item,
  idVariable,
  tipoDato,
  accionCorrecta,
  accionCancelar,
}: ModalItemType) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const [activaSwitch, seActivaSwitch] = useState<boolean>(
    item?.esAgrupador || false
  )
  const [currentColor, setCurrentColor] = useState(item?.color ?? '#00AE98')
  const [anchorElColor, setAnchorElColor] = useState<HTMLButtonElement | null>(
    null
  )
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()
  const [todosIconos, setTodosIconos] = useState<CustomOptionType<any>[]>([])
  const [iconosFiltrados, setIconosFiltrados] = useState<
    CustomOptionType<any>[]
  >([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showAlert, setShowAlert] = useState(false)
  const [mensajeAlert, setMensajeAlert] = useState<string>('')
  const [nombreTipoDato, setNombreTipoDato] = useState<string>()

  const { handleSubmit, control, setValue, watch } =
    useForm<CrearEditarItemsType>({
      defaultValues: {
        id: item?.id,
        nombre: item?.nombre,
        nombreCorto: item?.nombreCorto,
        color: item?.color || '',
        icono: item?.icono
          ? {
              value: item?.icono,
              label: item?.icono,
              key: item?.icono,
            }
          : undefined,
        posicion: item?.posicion,
        esAgrupador: item?.esAgrupador,
        idTipoDato: item?.idTipoDato,
        idVariable: idVariable, //item?.variables.id,
      },
    })

  const guardarActualizarItem = async (data: CrearEditarItemsType) => {
    data.esAgrupador = activaSwitch
    const words =
      data.nombreCorto
        ?.trim()
        .split(/\s+/)
        .filter((word) => word.length > 0) || []
    if (words.length > 1) {
      setMensajeAlert('El campo Nombre Corto solo debe contener una palabra.')
      setShowAlert(true)
    } else {
      await guardarActualizarItemPeticion({
        id: data.id,
        nombre: data.nombre,
        nombreCorto: data.nombreCorto?.trim() ?? '',
        color: data.color,
        icono: data.icono?.value,
        posicion: data.posicion,
        esAgrupador: data.esAgrupador,
        idVariable: data.idVariable,
        idTipoDato: data.idTipoDato,
      })
    }
  }

  const guardarActualizarItemPeticion = async (item: GuardarItemsType) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/items${item.id ? `/${item.id}` : ''}`,
        method: !!item.id ? 'patch' : 'post',
        body: {
          ...item,
        },
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar item: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }

  const marcadorEsAgrupador = () => {
    if (activaSwitch) seActivaSwitch(false)
    else seActivaSwitch(true)
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
    setLoading(false)
  }

  const handleInputChangeIcon = (event: any, value: any, reason: any) => {
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

  const handleIconClickColor = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElColor(event.currentTarget)
  }
  const handleClosePaletaColor = () => {
    setAnchorElColor(null)
  }
  const handleChangeCompleteColor = (color: any) => {
    setCurrentColor(color)
    setValue('color', color.hex)
  }
  const openPaletaColor = Boolean(anchorElColor)
  const idPopColor = openPaletaColor ? 'color-popover' : undefined

  const handleUpperCase = (event: any) => {
    const { name, value } = event.target
    setValue(name, value.toUpperCase(), { shouldValidate: true })
  }

  const aceptarAlerta = async () => {
    setShowAlert(false)
  }

  return (
    <>
      <AlertDialog isOpen={showAlert} titulo={'Alerta'} texto={mensajeAlert}>
        <Button variant={'contained'} onClick={aceptarAlerta}>
          Aceptar
        </Button>
      </AlertDialog>

      <form onSubmit={handleSubmit(guardarActualizarItem)}>
        <DialogContent dividers>
          <Grid container direction={'column'} justifyContent="space-evenly">
            <Box height={'5px'} />
            <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
              <Grid item xs={12} sm={12} md={12}>
                <FormInputText
                  id={'nombre'}
                  control={control}
                  name="nombre"
                  label="Nombre"
                  rules={{ required: 'Este campo es requerido' }}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={12}>
                <FormInputText
                  id={'nombreCorto'}
                  control={control}
                  name="nombreCorto"
                  label="Nombre Corto"
                  esMayuscula={true}
                  rules={{ required: 'Este campo es requerido' }}
                  onChange={handleUpperCase}
                />
                <label style={{ fontSize: '13px', marginLeft: 9 }}>
                  El campo Nombre Corto debe coincidir con la columna del excel
                </label>
              </Grid>

              <Grid item xs={12} sm={12} md={6}>
                <FormInputTextWithIcon
                  id="color"
                  control={control}
                  name="color"
                  label="Color"
                  icon={'palette'}
                  onIconClick={handleIconClickColor}
                />
                <Popover
                  id={idPopColor}
                  open={openPaletaColor}
                  anchorEl={anchorElColor}
                  onClose={handleClosePaletaColor}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <SketchPicker
                    color={currentColor}
                    onChangeComplete={handleChangeCompleteColor}
                  />
                </Popover>
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

              <Grid item xs={12} sm={12} md={6}>
                <br></br>
                <CustomSwitch
                  id={'esAgrupador'}
                  titulo={activaSwitch ? 'Es Agrupador' : 'No es agrupador'}
                  accion={() => {
                    marcadorEsAgrupador()
                  }}
                  desactivado={false}
                  color={'success'}
                  marcado={activaSwitch}
                  name={'esAgrupador'}
                />
                <label htmlFor="agrupador">Es Agrupador</label>
              </Grid>

              <Grid item xs={12} sm={12} md={6}>
                <FormInputDropdown
                  id={'idTipoDato'}
                  name="idTipoDato"
                  control={control}
                  label="Tipo de Dato"
                  disabled={loadingModal}
                  options={tipoDato.map((tipo) => ({
                    key: tipo.id,
                    value: tipo.id,
                    label: tipo.descripcion,
                  }))}
                  rules={{ required: 'Este campo es requerido' }}
                  onChange={(event) => {
                    const selectedValue = event.target.value
                    const selectedOption = tipoDato?.find(
                      (tipoDato) => tipoDato.id === selectedValue
                    )
                    if (selectedOption) {
                      setNombreTipoDato(selectedOption.descripcion)
                    }
                  }}
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
