'use client'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  Link,
  List,
  ListItem,
  Menu,
  MenuItem,
  Radio,
  ToggleButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import React, { useEffect, useState } from 'react'
import ThemeSwitcherButton from '../botones/ThemeSwitcherButton'
import { CustomDialog } from '../modales/CustomDialog'

import { delay, siteName, titleCase } from '@/utils'
import { useRouter } from 'next/navigation'

import { IconoTooltip } from '../botones/IconoTooltip'
import { AlertDialog } from '../modales/AlertDialog'
import { imprimir } from '@/utils/imprimir'

import { useSession } from '@/hooks'
import { RoleType } from '@/app/login/types/loginTypes'
import { useAuth } from '@/context/AuthProvider'
import { useFullScreenLoading } from '@/context/FullScreenLoadingProvider'
import { useThemeContext } from '@/themes/ThemeRegistry'
import { Icono } from '@/components/Icono'
import { useSidebar } from '@/context/SideBarProvider'
import Grid from '@mui/material/Grid'
import Image from 'next/image'
import { Constantes } from '@/config/Constantes'

export const NavbarUsers = () => {
  const [modalAyuda, setModalAyuda] = useState(false)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const [roles, setRoles] = useState<RoleType[]>([])

  const { cerrarSesion } = useSession()

  const { usuario, setRolUsuario, rolUsuario } = useAuth()

  const { sideMenuOpen, closeSideMenu, openSideMenu } = useSidebar()

  const { mostrarFullScreen, ocultarFullScreen } = useFullScreenLoading()

  const [mostrarAlertaCerrarSesion, setMostrarAlertaCerrarSesion] =
    useState(false)

  const router = useRouter()

  const { themeMode, toggleTheme } = useThemeContext()

  const cambiarRol = async (event: React.ChangeEvent<HTMLInputElement>) => {
    imprimir(`Valor al hacer el cambio: ${event.target.value}`)
    cerrarMenu()
    mostrarFullScreen(`Cambiando de rol..`)
    await delay(1000)
    router.replace('/admin/home')
    await setRolUsuario({ idRol: `${event.target.value}` })
    ocultarFullScreen()
  }

  const abrirModalAyuda = () => {
    setModalAyuda(true)
  }
  const cerrarModalAyuda = () => {
    setModalAyuda(false)
  }

  const desplegarMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const cerrarMenu = () => {
    setAnchorEl(null)
  }

  const cerrarMenuSesion = async () => {
    cerrarMenu()
    await cerrarSesion()
  }

  const interpretarRoles = () => {
    imprimir(`Cambio en roles 📜`, usuario?.roles)
    if (usuario?.roles && usuario?.roles.length > 0) {
      setRoles(usuario?.roles)
    }
  }

  const abrirPerfil = () => {
    cerrarMenu()
    router.push('/admin/perfil')
  }

  /// Interpretando roles desde estado
  useEffect(() => {
    interpretarRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])

  const theme = useTheme()
  // const sm = useMediaQuery(theme.breakpoints.only('sm'))
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  const accionMostrarAlertaCerrarSesion = () => {
    cerrarMenu()
    setMostrarAlertaCerrarSesion(true)
  }

  return (
    <>
      <AlertDialog
        isOpen={mostrarAlertaCerrarSesion}
        titulo={'Alerta'}
        texto={`¿Está seguro de cerrar sesión?`}
      >
        <Button
          variant={'outlined'}
          onClick={() => {
            setMostrarAlertaCerrarSesion(false)
          }}
        >
          Cancelar
        </Button>
        <Button
          variant={'contained'}
          onClick={async () => {
            setMostrarAlertaCerrarSesion(false)
            await cerrarMenuSesion()
          }}
        >
          Aceptar
        </Button>
      </AlertDialog>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Box display="flex" alignItems="center">
            <IconButton
              id={'menu-sidebar'}
              size="large"
              aria-label="Menu lateral"
              name={sideMenuOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
              edge="start"
              color={'inherit'}
              onClick={() => {
                if (sideMenuOpen) {
                  closeSideMenu()
                } else {
                  openSideMenu()
                }
              }}
              sx={{ mr: 0 }}
            >
              {sideMenuOpen ? (
                <Icono color={'action'}>menu_open</Icono>
              ) : (
                <Icono color={'action'}>menu</Icono>
              )}
            </IconButton>
            <Grid
              container
              alignItems="center"
              flexDirection="row"
              justifyContent="flex-start"
              onClick={() => {
                router.replace('/admin/home')
              }}
              sx={{ cursor: 'pointer' }}
            >
              <Image
                src={`${Constantes.sitePath}/logo_blanco.png`}
                alt={''}
                width="120"
                height="120"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
              <Box sx={{ px: 0.5 }} />
            </Grid>
          </Box>

          <Grid
            item
            xs
            container
            alignItems="center"
            justifyContent="center"
            sx={{ flexGrow: 1 }}
          >
            <Typography
              variant="h1"
              component="h1"
              color="#304E66"
              align="center"
              sx={{
                fontSize: {
                  xs: '14px',
                  sm: '18px',
                  md: '20px',
                  lg: '28px',
                  '2xl': '18px',
                },
                fontWeight: 'normal',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              Centro de{' '}
              <Typography
                variant="h1"
                component="span"
                color="#00AE98"
                sx={{
                  fontSize: {
                    xs: '16px',
                    sm: '20px',
                    md: '24px',
                    lg: '38px',
                    '2xl': '32px',
                  },
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Datos Autonómicos
              </Typography>
            </Typography>
          </Grid>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link color="inherit">
              {`${usuario?.persona.nombres} ${usuario?.persona.primerApellido ?? usuario?.persona.segundoApellido}`}
            </Link>
            <ToggleButton
              sx={{ px: 1.2, minWidth: 0, borderWidth: 0 }}
              size="small"
              onClick={desplegarMenu}
              color="primary"
              value={''}
              selected={!!anchorEl}
            >
              <Avatar
                src={`${Constantes.sitePath}/avatar.jpg`}
                sx={{
                  fontSize: '0.82rem',
                  width: 40,
                  height: 40,
                }}
              ></Avatar>
            </ToggleButton>
          </Box>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={cerrarMenu}
            autoFocus={false}
          >
            <MenuItem onClick={abrirPerfil} sx={{ mb: 1, mt: 0.5 }}>
              <Icono color={'inherit'} fontSize={'small'}>
                person
              </Icono>
              <Box width={'15px'} />
              <Box
                display={'flex'}
                flexDirection={'column'}
                alignItems={'start'}
              >
                <Typography
                  variant={'body2'}
                  color="text.primary"
                  fontWeight={'500'}
                >
                  {titleCase(usuario?.persona?.nombres ?? '')}{' '}
                  {titleCase(
                    usuario?.persona?.primerApellido ??
                      usuario?.persona?.segundoApellido ??
                      ''
                  )}
                </Typography>
                <Typography variant={'caption'} color="text.secondary">
                  {`${rolUsuario?.nombre}`}
                </Typography>
              </Box>
            </MenuItem>
            {roles.length > 1 && (
              <Box>
                <Divider />
                <MenuItem
                  sx={{
                    ml: 0,
                    pt: 1.5,
                    '&.MuiButtonBase-root:hover': {
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  <Icono color={'inherit'} fontSize={'small'}>
                    switch_account
                  </Icono>
                  <Box width={'15px'} />
                  <Typography variant={'body2'} fontWeight={'500'}>
                    Roles
                  </Typography>
                </MenuItem>
                <List key={`roles`} sx={{ p: 0, pl: 2 }}>
                  {roles.map((rol, indexRol) => (
                    <ListItem key={`rol-${indexRol}`}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          borderRadius: 1,
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Box width={'20px'} />
                        <FormControlLabel
                          value={rol.idRol}
                          control={
                            <Radio
                              checked={rolUsuario?.idRol == rol.idRol}
                              onChange={cambiarRol}
                              color={'success'}
                              size="small"
                              value={rol.idRol}
                              name="radio-buttons"
                            />
                          }
                          componentsProps={{ typography: { variant: 'body2' } }}
                          label={rol.nombre}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Divider />
            <MenuItem
              sx={{ px: 2.5, py: 1.5, mt: 1 }}
              onClick={accionMostrarAlertaCerrarSesion}
            >
              <Icono color={'error'} fontSize={'small'}>
                logout
              </Icono>
              <Box width={'15px'} />
              <Typography variant={'body2'} fontWeight={'600'} color={'error'}>
                Cerrar sesión
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </>
  )
}
