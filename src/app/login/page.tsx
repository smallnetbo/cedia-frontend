'use client'
import Box from '@mui/material/Box'
import { Constantes } from '@/config/Constantes'
import { useEffect } from 'react'
import { imprimir } from '@/utils/imprimir'
import { Grid, useTheme } from '@mui/material'
import LoginContainer from '@/app/login/ui/LoginContainer'
import { useAlerts } from '@/hooks'
import { useFullScreenLoading } from '@/context/FullScreenLoadingProvider'
import { delay, InterpreteMensajes } from '@/utils'
import { Servicios } from '@/services'

export default function LoginPage() {
  const { Alerta } = useAlerts()
  const { mostrarFullScreen, ocultarFullScreen } = useFullScreenLoading()

  const obtenerEstado = async () => {
    try {
      mostrarFullScreen()
      await delay(1000)
      const respuesta = await Servicios.get({
        url: `${Constantes.baseUrl}/estado`,
        body: {},
        headers: {
          accept: 'application/json',
        },
      })
      imprimir(`Se obtuvo el estado 🙌`, respuesta)
    } catch (e) {
      imprimir(`Error al obtener estado`, e)
      Alerta({ mensaje: `${InterpreteMensajes(e)}`, variant: 'error' })
    } finally {
      ocultarFullScreen()
    }
  }

  useEffect(() => {
    obtenerEstado().then(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container justifyContent="space-evenly" alignItems={'center'}>
      <Grid item xl={4} md={5} xs={12}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box
            display={'flex'}
            justifyContent={'space-around'}
            alignItems={'center'}
            color={'primary'}
            minHeight={'80vh'}
          >
            <LoginContainer />
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}
