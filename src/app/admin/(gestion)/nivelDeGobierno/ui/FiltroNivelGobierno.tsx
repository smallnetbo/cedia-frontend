import { FormInputText } from '@/components/form'
import { Box, Grid } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'

export interface FiltroType {
  nombre: string
}

export interface FiltroModalNivelGobiernoType {
  filtroNombre: string
  accionCorrecta: (filtros: FiltroType) => void
  accionCerrar: () => void
}

export const FiltroNivelGobierno = ({
  filtroNombre,
  accionCorrecta,
}: FiltroModalNivelGobiernoType) => {
  const { control, watch } = useForm<FiltroType>({
    defaultValues: {
      nombre: filtroNombre,
    },
  })

  const filtroNivelGobiernoWatch: string = watch('nombre')

  const debounced = useDebouncedCallback(
    // function
    (filtros: FiltroType) => {
      accionCorrecta(filtros)
    },
    // delay in ms
    1000
  )

  const actualizacionFiltros = (filtros: FiltroType) => {
    debounced(filtros)
  }

  useEffect(() => {
    actualizacionFiltros({
      nombre: filtroNivelGobiernoWatch,
    })
  }, [filtroNivelGobiernoWatch])

  return (
    <Box sx={{ pl: 1, pr: 1, pt: 1 }}>
      <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
        <Grid item xs={12} sm={12} md={4}>
          <FormInputText
            id={'nombre'}
            name={'nombre'}
            control={control}
            label={'Nombre'}
            bgcolor={'background.paper'}
            clearable
          />
        </Grid>
      </Grid>
    </Box>
  )
}
