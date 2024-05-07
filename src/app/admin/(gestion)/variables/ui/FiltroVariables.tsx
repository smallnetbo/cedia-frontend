import { FormInputText } from '@/components/form'
import { Box, Grid } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'

export interface FiltroType {
  nombreCorto: string
}

export interface FiltroModalVariablesType {
  filtroNombreCorto: string
  accionCorrecta: (filtros: FiltroType) => void
  accionCerrar: () => void
}

export const FiltroVariables = ({
  filtroNombreCorto,
  accionCorrecta,
}: FiltroModalVariablesType) => {
  const { control, watch } = useForm<FiltroType>({
    defaultValues: {
       nombreCorto: filtroNombreCorto,
    },
  })

  const filtroVariablesWatch: string = watch('nombreCorto')

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
        nombreCorto: filtroVariablesWatch,
    })
  }, [filtroVariablesWatch])

  return (
    <Box sx={{ pl: 1, pr: 1, pt: 1 }}>
      <Grid container direction="row" spacing={{ xs: 2, sm: 1, md: 2 }}>
        <Grid item xs={12} sm={12} md={4}>
          <FormInputText
            id={'nombreCorto'}
            name={'nombreCorto'}
            control={control}
            label={'Nombre corto'}
            bgcolor={'background.paper'}
            clearable
          />
        </Grid>
      </Grid>
    </Box>
  )
}
