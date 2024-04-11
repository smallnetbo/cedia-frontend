import { Box, Button, Card, TextField } from '@mui/material'
import Typography from '@mui/material/Typography'
import ProgresoLineal from '@/components/progreso/ProgresoLineal'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { useFullScreenLoading } from '@/context/FullScreenLoadingProvider'
import { useState } from 'react'

const LoginContainer = () => {
  const router = useRouter()

  const { ingresar, progresoLogin } = useAuth()

  const { mostrarFullScreen, ocultarFullScreen } = useFullScreenLoading()

  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')

  const handleUsuarioChange = (event: any) => {
    setUsuario(event.target.value)
  }

  const handleContrasenaChange = (event: any) => {
    setContrasena(event.target.value)
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    await ingresar({ usuario, contrasena })
  }

  return (
    <Card
      sx={{
        borderRadius: 10,
        p: 6,
        px: 4,
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box
          display={'grid'}
          justifyContent={'center'}
          alignItems={'center'}
          sx={{ borderRadius: 12 }}
        >
          <Typography
            align={'left'}
            sx={{ fontWeight: '600', color: '#50C0B2' }}
          >
            Bienvenido
          </Typography>
          <Typography
            align={'left'}
            sx={{ fontWeight: '1000', fontSize: '25px' }}
          >
            Inicio de Sesión
          </Typography>
          <Box sx={{ mt: 2, mb: 2 }}></Box>

          <TextField
            id={'usuario'}
            name="usuario"
            label="Nombre de usuario"
            type="text"
            variant="standard"
            value={usuario}
            onChange={handleUsuarioChange}
            disabled={progresoLogin}
          />
          <Box sx={{ mt: 1, mb: 1 }}></Box>
          <TextField
            id={'contrasena'}
            name="contrasena"
            label="Contraseña"
            type="password"
            variant="standard"
            value={contrasena}
            onChange={handleContrasenaChange}
            disabled={progresoLogin}
          />
          <Box sx={{ mt: 0.5, mb: 0.5 }}>
            <ProgresoLineal mostrar={progresoLogin} />
          </Box>
          <Box sx={{ height: 30 }}></Box>
          <Button
            type="submit"
            variant="contained"
            disabled={progresoLogin}
            size="large"
          >
            <Typography sx={{ fontWeight: '600' }}>Inicio</Typography>
          </Button>
          <Box display="flex" flex="1" justifyContent="start"></Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" textAlign="center" fontSize={14}>
              ¿No tienes una cuenta?{' '}
              <Button
                variant="text"
                sx={{ p: 0, color: 'red' }}
                disabled={progresoLogin}
                onClick={async () => {
                  await router.push('registro')
                }}
              >
                Contacte al Administrador
              </Button>
            </Typography>
          </Box>
        </Box>
      </form>
    </Card>
  )
}
export default LoginContainer
