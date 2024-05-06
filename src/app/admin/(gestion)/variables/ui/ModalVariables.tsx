import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  VariablesCRUDType,
  CrearEditarVariablesType,
  SubSectorType,
  GraficoType,
} from '../types/variablesCRUDTypes'
import { FormInputDropdown, FormInputText } from '@/components/form'
import { AlertDialog } from '@/components/modales/AlertDialog'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'
import FormInputFile from '@/components/form/FormInputFile'
import * as XLSX from 'xlsx';
import { IconoTooltip } from '@/components/botones/IconoTooltip'

import { makeStyles } from '@mui/material'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export interface ModalVariablesType {
  variable?: VariablesCRUDType | undefined | null
  subsector: SubSectorType[]
  graficos: GraficoType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}


export const VistaModalVaribles = ({
  variable,
  subsector,
  graficos,
  accionCorrecta,
  accionCancelar,
}: ModalVariablesType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control } = useForm<CrearEditarVariablesType>({
    defaultValues: {
      id: variable?.id,
      nombre: variable?.nombre,
      nombreCorto:variable?.nombreCorto,
      posicion: variable?.posicion,
      idSubSector: variable?.subsector.id,
      idGrafico: variable?.graficos.id,
    },
  })


  const guardarActualizarVariables = async (data: CrearEditarVariablesType) => {
    console.log('Esto esta en el front',data)
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


 
  
  
   
  return (
    <>
    
    <form onSubmit={handleSubmit(guardarActualizarVariables)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Box height={'5px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>

          <Grid item xs={12} sm={12} md={6}>
              <FormInputDropdown
                id={'idSubSector'}
                name="idSubSector"
                control={control}
                label="Sub Sector"
                disabled={loadingModal}
                options={subsector.map((sub) => ({
                  key: sub.id,
                  value: sub.id,
                  label: sub.nombre,
                }))}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>

             <Grid item xs={12} sm={12} md={6}>
              <FormInputDropdown
                id={'idGrafico'}
                name="idGrafico"
                control={control}
                label="grafico"
                disabled={loadingModal}
                options={graficos.map((graf) => ({
                  key: graf.id,
                  value: graf.id,
                  label: graf.titulo,
                }))}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid> 


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
                id={'posicion'}
                control={control}
                name="posicion"
                label="Posición"
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
