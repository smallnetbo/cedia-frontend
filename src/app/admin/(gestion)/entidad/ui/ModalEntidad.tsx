import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  CrearEditarEntidadType,
  EntidadCRUDType,
} from '../types/entidadCRUDTypes'
import { FormInputText } from '@/components/form'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export interface ModalEntidadType {
  entidad?: EntidadCRUDType | undefined | null
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalEntidad = ({
  entidad,
  accionCorrecta,
  accionCancelar,
}: ModalEntidadType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { handleSubmit, control } = useForm<CrearEditarEntidadType>({
    defaultValues: {
      id: entidad?.id,
      nombre: entidad?.nombre,
      categoria: entidad?.categoria,
    },
  })
  return (
    <form>
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
                //disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'categoria'}
                control={control}
                name="categoria"
                label="Categoria"
                //disabled={loadingModal}
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
  )
}
