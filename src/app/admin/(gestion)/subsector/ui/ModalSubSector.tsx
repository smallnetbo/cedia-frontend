import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  SubSectorCRUDType,
  CrearEditarSubSectorType,
  SectorType,
} from '../types/subSectorCRUDTypes'
import { FormInputDropdown, FormInputText } from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'


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
  console.log('Desde Modal subsector',initialFicha)
  
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control } = useForm<CrearEditarSubSectorType>({
    defaultValues: {
      id: subSector?.id,
      nombre: subSector?.nombre,
      nombreCorto:subSector?.nombreCorto,
      icono: subSector?.icono,
      idSector: initialFicha?.id //subSector?.sector.id,
    },
  })


  const guardarActualizarSubSector = async (data: CrearEditarSubSectorType) => {
    console.log('Esto esta en el front',data)
    await guardarActualizarSubSectorPeticion(data)
  }

  const guardarActualizarSubSectorPeticion = async (
    subSector: CrearEditarSubSectorType
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


            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'nombre'}
                control={control}
                name="nombre"
                label="Nombre"
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={8}>
              <FormInputText
                id={'nombreCorto'}
                control={control}
                name="nombreCorto"
                label="Nombre Corto"
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
              <FormInputText
                id={'icono'}
                control={control}
                name="icono"
                label="Icono"
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
