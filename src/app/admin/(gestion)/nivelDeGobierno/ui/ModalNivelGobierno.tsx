import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  CrearEditarNivelGobiernoType,
  NivelGobiernoCRUDType,
} from '../types/nivelGobiernoCRUDTypes'
import { FormInputText } from '@/components/form'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export interface ModalNivelGobiernoType {
  nivelGobierno?: NivelGobiernoCRUDType | undefined | null
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalNivelGobierno = ({
  nivelGobierno,
  accionCorrecta,
  accionCancelar,
}: ModalNivelGobiernoType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { handleSubmit, control } = useForm<CrearEditarNivelGobiernoType>({
    defaultValues: {
      id: nivelGobierno?.id,
      nombre: nivelGobierno?.nombre,
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
