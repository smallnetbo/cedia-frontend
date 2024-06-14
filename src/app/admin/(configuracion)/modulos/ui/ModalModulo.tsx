import { Box, Button, DialogActions, DialogContent, Grid } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ModalModuloType } from '@/app/admin/(configuracion)/modulos/types/ModalModuloType'
import {
  FormInputDropdown,
  FormInputText,
  optionType,
} from 'src/components/form'
import { useAlerts, useSession } from '@/hooks'
import {
  CrearEditarModulosType,
  GuardarModulosType,
} from '@/app/admin/(configuracion)/modulos/types/CrearEditarModulosType'
import { Constantes } from '@/config/Constantes'
import { InterpreteMensajes } from '@/utils'
import { imprimir } from '@/utils/imprimir'
import { FormInputAutocomplete } from '@/components/form/FormInputAutocomplete'
import { Icono } from '@/components/Icono'
import ProgresoLineal from '@/components/progreso/ProgresoLineal'
export type CustomOptionType<K> = K & { key: string }

export const VistaModalModulo = ({
  modulo,
  accionCorrecta,
  accionCancelar,
  modulos,
}: ModalModuloType) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

  //const [opciones, setOpciones] = useState<Array<optionType>>([])

  // Hook para mostrar alertas
  const { Alerta } = useAlerts()

  // Proveedor de la sesión
  const { sesionPeticion } = useSession()

  const [todosIconos, setTodosIconos] = useState<CustomOptionType<any>[]>([]);
  const [iconosFiltrados, setIconosFiltrados] = useState<CustomOptionType<any>[]>([]);
  //const [loading, setLoading] = useState<boolean>(true);

  const { handleSubmit, control, watch } = useForm<CrearEditarModulosType>({
    defaultValues: {
      id: modulo?.id,
      label: modulo?.label,
      url: modulo?.url,
      nombre: modulo?.nombre,
      propiedades: {
        orden: modulo?.propiedades?.orden,
        descripcion: modulo?.propiedades?.descripcion,
        icono: modulo?.propiedades?.icono
          ? {
              value: modulo?.propiedades?.icono,
              label: modulo?.propiedades?.icono,
              key: modulo?.propiedades?.icono,
            }
          : undefined,
      },
      estado: modulo?.estado,
      idModulo: modulo?.modulo?.id,
      esSeccion: modulo?.esSeccion,
    },
  })

  const checked = watch('esSeccion')
  const iconoWatch = watch('propiedades.icono')

  const guardarActualizarModulo = async (data: CrearEditarModulosType) => {
    await guardarActualizarModuloPeticion({
      idModulo: data.idModulo,
      label: data.label,
      url: data.url,
      estado: data.estado,
      nombre: data.nombre,
      id: data.id,
      propiedades: {
        icono: data.propiedades.icono?.value,
        orden: data.propiedades.orden,
        descripcion: data.propiedades.descripcion,
      },
    })
  }

  const guardarActualizarModuloPeticion = async (
    modulo: GuardarModulosType
  ) => {
    try {
      setLoadingModal(true)
      //await delay(1000)
      const respuesta = await sesionPeticion({
        url: `${Constantes.baseUrl}/autorizacion/modulos${
          modulo.id ? `/${modulo.id}` : ''
        }`,
        method: !!modulo.id ? 'patch' : 'post',
        body: {
          ...modulo,
          propiedades: {
            ...modulo.propiedades,
            ...{ orden: Number(modulo.propiedades.orden) },
          },
        },
      })
      Alerta({
        mensaje: InterpreteMensajes(respuesta),
        variant: 'success',
      })
      accionCorrecta()
    } catch (e) {
      imprimir(`Error al crear o actualizar módulo`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      setLoadingModal(false)
    }
  }

  const mostrarIconos = async () => {
    const iconos = await import('material-icons/_data/versions.json')
    const opcionesIconos = Object.keys(iconos).map((value) => ({
      key: value,
      label: value,
      value: value,
    }))
    setTodosIconos(opcionesIconos);
    setIconosFiltrados(opcionesIconos.slice(0, 10));
    //setLoading(false);
  }
  const handleInputChangeIcon = (event :any, value: any, /*reason: any*/) => {
    if (value) {
      const resultadosFiltrados = todosIconos.filter((icono) =>
        icono.label.toLowerCase().includes(value.toLowerCase())
      );
      setIconosFiltrados(resultadosFiltrados.slice(0, 10))
    } else {
      setIconosFiltrados(todosIconos.slice(0, 10))
    }
  }

  useEffect(() => {
    mostrarIconos().finally(() => {})
  }, [])

  return (
    <form onSubmit={handleSubmit(guardarActualizarModulo)}>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          {checked ? (
            <></>
          ) : (
            <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
              <Grid item xs={12} sm={12} md={6}>
                <FormInputDropdown
                  id={'idModulo'}
                  name="idModulo"
                  control={control}
                  label="Sección"
                  disabled={loadingModal}
                  options={modulos.map((lm) => ({
                    key: lm.id,
                    value: lm.id,
                    label: lm.label,
                  }))}
                  onChange={(event) => {
                    imprimir(event.target.value)
                    //setValue('accion', [])
                  }}
                  rules={{ required: 'Este campo es requerido' }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormInputAutocomplete
                  id={'icono'}
                  control={control}
                  name="propiedades.icono"
                  label="Icono"
                  disabled={loadingModal || checked}
                  rules={
                    !checked ? { required: 'Este campo es requerido' } : {}
                  }
                  freeSolo
                  newValues
                  forcePopupIcon
                  options={iconosFiltrados}
                  onInputChange={handleInputChangeIcon}
                  InputProps={{
                    startAdornment: iconoWatch?.value && (
                      <Icono sx={{ ml: 1 }} color={'inherit'}>
                        {iconoWatch?.value}
                      </Icono>
                    ),
                  }}
                  getOptionLabel={(option) => option.label}
                  renderOption={(option) => (
                    <>
                      <Icono>{option.label}</Icono>
                      <Box sx={{ ml: 2 }}>{option.label}</Box>
                    </>
                  )}
                />
              </Grid>
            </Grid>
          )}
          <Box height={'15px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'nombre'}
                control={control}
                name="nombre"
                label="Nombre"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'label'}
                control={control}
                name="label"
                label="Label"
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
              />
            </Grid>
          </Grid>
          <Box height={'15px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'url'}
                control={control}
                name="url"
                label="URL"
                disabled={loadingModal}
                rules={{
                  required: {
                    value: true,
                    message: 'Este campo es requerido',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <FormInputText
                id={'orden'}
                control={control}
                type={'number'}
                inputProps={{ type: 'number' }}
                name="propiedades.orden"
                label="Orden"
                disabled={loadingModal}
                rules={{
                  required: 'Este campo es requerido',
                }}
              />
            </Grid>
          </Grid>
          <Box height={'15px'} />
          <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
            <Box height={'20px'} />
            <Grid item xs={12} sm={12} md={12}>
              <FormInputText
                id={'descripcion'}
                control={control}
                name="propiedades.descripcion"
                label="Descripción"
                multiline
                rows={2}
                disabled={loadingModal}
                rules={{ required: 'Este campo es requerido' }}
                onChange={(event) => {
                  const value = event.target.value
                  return Number(value)
                }}
              />
            </Grid>
          </Grid>
          <Box height={'20px'} />
          <ProgresoLineal mostrar={loadingModal} />
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
