import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import {
  CategoriaType,
  CrearEditarEntidadType,
  EntidadCRUDType,
  NivelGobiernoType,
  TipoEntidadType,
} from '../types/entidadCRUDTypes'
import { FormInputDropdown, FormInputText } from '@/components/form'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAlerts, useSession } from '@/hooks'
import { delay, InterpreteMensajes } from '@/utils'
import { Constantes } from '@/config/Constantes'
import { imprimir } from '@/utils/imprimir'

export interface ModalEntidadType {
  entidad?: EntidadCRUDType | undefined | null
  categoria: CategoriaType[]
  nivelGobierno: NivelGobiernoType[]
  tipoEntidad: TipoEntidadType[]
  accionCorrecta: () => void
  accionCancelar: () => void
}

export const VistaModalEntidad = ({
  entidad,
  categoria,
  nivelGobierno,
  tipoEntidad,
  accionCorrecta,
  accionCancelar,
}: ModalEntidadType) => {
  // Flag que índica que hay un proceso en ventana modal cargando visualmente
  const [loadingModal, setLoadingModal] = useState<boolean>(false)
  const { Alerta } = useAlerts()
  const { sesionPeticion } = useSession()

  const { handleSubmit, control } = useForm<CrearEditarEntidadType>({
    defaultValues: {
      id: entidad?.id,
      codigoEntidad: entidad?.codigoEntidad,
      codigoDepartamento: entidad?.codigoDepartamento,
      nombre: entidad?.nombre,
      coordenadasGeograficas: entidad?.coordenadasGeograficas,
      nombreGam: entidad?.nombreGam,
      idCategoria: entidad?.categoria.id,
      idNivelGobierno: entidad?.nivelGobierno.id,
      idTipoEntidad: entidad?.tipoEntidad.id,
    },
  })

  const guardarActualizarEntidad = async (data: CrearEditarEntidadType) => {
    await guardarActualizarEntidadPeticion(data)
  }

  const guardarActualizarEntidadPeticion = async (
    entidad: CrearEditarEntidadType
  ) => {
    try {
      setLoadingModal(true)
      await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/entidad${
          entidad.id ? `/${entidad.id}` : ''
        }`,
        method: !!entidad.id ? 'patch' : 'post',
        body: {
          ...entidad,
        },
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar entidad: `, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }
  return (
    <form onSubmit={handleSubmit(guardarActualizarEntidad)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <Box height={'5px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'codigoEntidad'}
                control={control}
                name="codigoEntidad"
                label="Codigo Entidad"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'codigoDepartamento'}
                control={control}
                name="codigoDepartamento"
                label="Codigo Departamento"
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

            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'coordenadasGeograficas'}
                control={control}
                name="coordenadasGeograficas"
                label="Coordenadas Geográficas"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'nombreGam'}
                control={control}
                name="nombreGam"
                label="Nombre Gobierno Autónomo Municipal"
              />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
              <FormInputDropdown
                id={'idCategoria'}
                name="idCategoria"
                control={control}
                label="Categoria"
                disabled={loadingModal}
                options={categoria.map((cat) => ({
                  key: cat.id,
                  value: cat.id,
                  label: cat.nombre,
                }))}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
              <FormInputDropdown
                id={'idNivelGobierno'}
                name="idNivelGobierno"
                control={control}
                label="Nivel de Gobierno"
                disabled={loadingModal}
                options={nivelGobierno.map((nivel) => ({
                  key: nivel.id,
                  value: nivel.id,
                  label: nivel.nombre,
                }))}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
              <FormInputDropdown
                id={'idTipoEntidad'}
                name="idTipoEntidad"
                control={control}
                label="Tipo de Entidad"
                disabled={loadingModal}
                options={tipoEntidad.map((tipo) => ({
                  key: tipo.id,
                  value: tipo.id,
                  label: tipo.nombre,
                }))}
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
