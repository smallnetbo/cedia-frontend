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

export const NavbarGeneral = () => {
  const router = useRouter()

  const theme = useTheme()
  // const sm = useMediaQuery(theme.breakpoints.only('sm'))
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Box display="flex" alignItems="center">
            <Grid
              container
              alignItems="center"
              flexDirection="row"
              justifyContent="flex-start"
              onClick={() => {
                router.replace('/login')
              }}
              sx={{ cursor: 'pointer' }}
            >
              <Image
                src={`${Constantes.sitePath}/ministerio_logo.png`}
                alt={''}
                width="180"
                height="180"
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
                width="150"
                height="150"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
              <Box sx={{ px: 0.5 }} />
            </Grid>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  )
}
