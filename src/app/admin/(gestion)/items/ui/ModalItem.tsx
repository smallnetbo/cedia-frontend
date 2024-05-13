import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  //SubSectorCRUDType,
 // CrearEditarSubSectorType,
  ItemsCRUDType,
  CrearEditarItemsType,
  GuardarItemsType,
  VariablesType,
} from '../types/itemsCRUDTypes'
import { FormInputDropdown, FormInputText,optionType } from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState,useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { CustomSwitch } from '@/components/botones/CustomSwitch'
import { ItemsType } from '../../subsector/types/subSectorCRUDTypes'
import {SketchPicker} from 'react-color'
import { FormInputAutocomplete } from '@/components/form/FormInputAutocomplete'
import { Icono } from '@/components/Icono'


export interface ModalItemType {
  item?: ItemsType | undefined | null
  idVariable?:string
  //variables: VariablesType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}


export const VistaModalItem = ({
  item,
 // variables,
  idVariable,
  accionCorrecta,
  accionCancelar,
}: ModalItemType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const [activaSwitch, seActivaSwitch] = useState<boolean>(item?.esAgrupador || false)
  const [currentColor, setCurrentColor] = useState(item?.color ?? '#00AE98')
  const [opciones, setOpciones] = useState<Array<optionType>>([])
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control,setValue,watch } = useForm<CrearEditarItemsType>({
    defaultValues: {
      id: item?.id,
      nombre: item?.nombre,
      color:item?.color,
      icono: item?.icono
      ? {
          value: item?.icono,
          label: item?.icono,
          key: item?.icono,
        }
      : undefined,
      posicion: item?.posicion,
      esAgrupador: item?.esAgrupador,
      idVariable: idVariable, //item?.variables.id,
    },
  })

  const handleChangeComplete = (color:any) => {
    setCurrentColor(color)
    setValue('color', color.hex)
  }
  const guardarActualizarItem = async (data: CrearEditarItemsType) => {
    data.esAgrupador=activaSwitch
    console.log('Esto esta en el front',data)
    //await guardarActualizarItemPeticion(data)

    await guardarActualizarItemPeticion({
      id: data.id,
      nombre: data.nombre,
      color: data.color,
      icono: data.icono?.value,
      posicion: data.posicion,
      esAgrupador: data.esAgrupador,
      idVariable:data.idVariable,
      
    })
  }

  const guardarActualizarItemPeticion = async (
    item: GuardarItemsType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/items${
            item.id ? `/${item.id}` : ''
        }`,
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
    console.log('Es agrupador')
    if (activaSwitch)
    seActivaSwitch(false)
    else
    seActivaSwitch(true)
  }
  const iconoWatch = watch('icono')

  const mostrarIconos = async () => {
    const iconos = await import('material-icons/_data/versions.json')
    setOpciones(
      Object.keys(iconos).map((value) => ({
        key: value,
        label: value,
        value: value,
      }))
    )
  }

  useEffect(() => {
    mostrarIconos().finally(() => {})
  }, [])
 
  
  
   
  return (
    <>
    
    <form onSubmit={handleSubmit(guardarActualizarItem)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Box height={'5px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>

          {/* <Grid item xs={12} sm={12} md={12}>
              <FormInputDropdown
                id={'idVariable'}
                name="idVariable"
                control={control}
                label="Variable"
                disabled={loadingModal}
                options={variables.map((vari) => ({
                  key: vari.id,
                  value: vari.id,
                  label: vari.nombre,
                }))}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid> */}


            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'nombre'}
                control={control}
                name="nombre"
                label="Nombre"
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'color'}
                control={control}
                name="color"
                label="Color"
                rules={{ required: 'Este campo es requerido' }}
              />
              <SketchPicker
                color={currentColor}
                onChangeComplete={handleChangeComplete}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              {/* <FormInputText
                id={'icono'}
                control={control}
                name="icono"
                label="Icono"
                rules={{ required: 'Este campo es requerido' }}
              /> */}
              <FormInputAutocomplete
                  id={'icono'}
                  control={control}
                  name="icono"
                  label="Icono"
                  rules={
                    { required: 'Este campo es requerido' } 
                  }
                  freeSolo
                  newValues
                  forcePopupIcon
                  options={opciones}
                  InputProps={{
                    startAdornment: iconoWatch?.value && (
                      <Icono sx={{ ml: 1 }} color={'inherit'}>
                        {iconoWatch?.value}
                      </Icono>
                    ),
                  }}
                  getOptionLabel={(option) => option.label}
                  renderOption={(option) => <>{option.label}</>}
                />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'posicion'}
                control={control}
                name="posicion"
                label="Posición"
                rules={{ required: 'Este campo es requerido' }}
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
