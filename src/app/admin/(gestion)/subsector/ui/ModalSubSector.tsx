import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  SubSectorCRUDType,
  CrearEditarSubSectorType,
  SectorType,
  GuardarSubSectorType,
} from '../types/subSectorCRUDTypes'
import { FormInputDropdown, FormInputText, optionType} from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState,useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import { FormInputAutocomplete } from '@/components/form/FormInputAutocomplete'
import { Icono } from '@/components/Icono'
import FormInputAutocompleteWithIcon from '@/components/form/FormInputAutocompleteWithIconPalette';
import { CustomSwitch } from '@/components/botones/CustomSwitch'

export interface ModalSubSectorType {
  subSector?: SubSectorCRUDType | undefined | null
  sector: SectorType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}


export const VistaModalSubSector = ({
  subSector,
  sector,
  accionCorrecta,
  accionCancelar,
}: ModalSubSectorType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const storedData = localStorage?.getItem('fichaStorage');
  const initialFicha = storedData ? JSON.parse(storedData) : null;
  const [opciones, setOpciones] = useState<Array<optionType>>([])
  console.log('Desde Modal subsector',initialFicha)
  const [activaSwitchVisible, seActivaSwitchVisible] = useState<boolean>(subSector?.tipoDatoGeneral || true)
  
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control,watch } = useForm<CrearEditarSubSectorType>({
    defaultValues: {
      id: subSector?.id,
      nombre: subSector?.nombre,
      nombreCorto:subSector?.nombreCorto,
      codigoSubSector:subSector?.codigoSubSector,
      icono: subSector?.icono
      ? {
          value: subSector?.icono,
          label: subSector?.icono,
          key: subSector?.icono,
        }
      : undefined,
      tipoDatoGeneral:subSector?.tipoDatoGeneral,
      idSector: initialFicha?.id //subSector?.sector.id,
    },
  })


  const guardarActualizarSubSector = async (data: CrearEditarSubSectorType) => {
    data.tipoDatoGeneral=activaSwitchVisible
    await guardarActualizarSubSectorPeticion({
      id: data.id,
      nombre: data.nombre,
      nombreCorto: data.nombreCorto,
      codigoSubSector: data.codigoSubSector,
      icono: data.icono?.value,
      tipoDatoGeneral:data.tipoDatoGeneral,
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
      console.log('despues del reg subsector',respuesta)
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

 
  const marcadorEsVisible = () => {
    if (activaSwitchVisible)
    seActivaSwitchVisible(false)
    else
    seActivaSwitchVisible(true)
  }
  console.log('Iconos--->',opciones)
   
  return (
    <>
    
    <form onSubmit={handleSubmit(guardarActualizarSubSector)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Box height={'5px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>

          {/* <Grid item xs={12} sm={12} md={12}>
              <FormInputDropdown
                id={'idSector'}
                name="idSector"
                control={control}
                label="Sector"
                disabled={loadingModal}
                options={sector.map((sec) => ({
                  key: sec.id,
                  value: sec.id,
                  label: sec.nombre,
                }))}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid> */}


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
                rules={{ required: 'Este campo es requerido',
                         maxLength:{
                          value:5,
                          message:'Este campo acepta como máximo 5 caracteres'
                         } }}
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

         {/* <FormInputAutocompleteWithIcon
              id="icono"
              control={control}
              name="icono"
              label="Icono Nuevo"
              options={opciones}
              rules={{ required: 'Este campo es requerido' }}
         /> */}
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              <br></br>
                <CustomSwitch
                    id={'tipoDatoGeneral'}
                    titulo={activaSwitchVisible ? 'Es Visible' : 'No es Visible'}
                     accion={() => {
                         marcadorEsVisible()
                     }}
                    desactivado={false}
                    color={'success'}
                    marcado={activaSwitchVisible}
                    name={'tipoDatoGeneral'}
                />
                <label htmlFor="Es Visible">Es Visible</label>
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
