import {
  Box,
  Collapse,
  Divider,
  Drawer,
  Fade,
  List,
  ListItemButton,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material'
import { SxProps, useMediaQuery, useTheme } from '@mui/system'
import Toolbar from '@mui/material/Toolbar'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Icono } from '@/components/Icono'
import { ModuloType } from '@/app/login/types/loginTypes'
import CustomBadge from '@/components/CustomBadge'
import { versionNumber } from '@/utils'

export type SidebarModuloType = ModuloType & {
  showed?: boolean
  open?: boolean
}
export const CustomDrawer = ({
  open,
  onClose,
  modulos,
  setModulos,
  navigateTo,
  rutaActual,
  badgeVariant,
  checkContentBadge,
}: {
  variant?: 'permanent' | 'persistent' | 'temporary'
  open?: boolean | undefined
  onClose?: () => void
  sx?: SxProps<Theme>
  modulos: Array<SidebarModuloType>
  setModulos: (modulos: Array<SidebarModuloType>) => void
  navigateTo: (url: string) => void
  rutaActual: string
  badgeVariant: string
  checkContentBadge: (id: string) => ReactNode
}) => {
  const rutaActiva = (routeName: string, currentRoute: string) =>
    currentRoute.includes(routeName, 0)
  const theme: Theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))
  const tiempo = 500
  const boxRef = useRef<HTMLDivElement>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const handleHasOverflow = () => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const hasVerticalScroll =
          entry.target.scrollHeight > entry.target.clientHeight
        setHasOverflow(hasVerticalScroll)
      }
    })

    if (boxRef.current) {
      resizeObserver.observe(boxRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }

  useEffect(() => {
    handleHasOverflow()
  }, [modulos, open])

  useEffect(() => {
    handleHasOverflow()
  }, [])

  return (
    <Drawer
      variant={xs ? 'persistent' : 'permanent'}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      transitionDuration={tiempo}
    >
      <Toolbar />
      <Box
        ref={boxRef}
        sx={{
          overflowY: 'auto',
          overflowX: 'hidden',
          width: xs ? 'auto' : open ? 200 : hasOverflow ? 57 : 47,
          scrollbarWidth: 'thin',
          scrollbarColor: 'gray #fff',
          transition: theme.transitions.create('width', { duration: tiempo }),
        }}
      >
        {modulos.map((modulo, index) => (
          <div key={`div-${index}`}>
            <Box
              sx={{
                display: 'flex',
                m: 0,
                mx: 0.4,
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => {
                const tempModulos = structuredClone(modulos)
                tempModulos[index].open = !tempModulos[index].open
                setModulos(tempModulos)
              }}
              onMouseOver={() => {
                const tempModulos = structuredClone(modulos)
                tempModulos[index].showed = true
                setModulos(tempModulos)
              }}
              onMouseLeave={() => {
                const tempModulos = structuredClone(modulos)
                tempModulos[index].showed = false
                setModulos(tempModulos)
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    margin: '6px 6px',
                    width: '100%',
                  }}
                >
                  <Tooltip
                    title={modulo.propiedades.descripcion}
                    enterDelay={1000}
                    placement="left"
                  >
                    <Box>
                      <Icono
                        sx={{
                          color: 'darkcyan',
                        }}
                        fontSize="medium"
                      >
                        {modulo.propiedades.icono}
                      </Icono>
                    </Box>
                  </Tooltip>
                  <Fade in={xs ? true : open}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'bolder',
                      }}
                    >
                      {modulo.label}
                    </Typography>
                  </Fade>
                </Box>
                <Icono
                  fontSize="small"
                  color="action"
                  sx={{
                    mr: 1,
                  }}
                >
                  {modulo.open ? 'expand_less' : 'expand_more'}
                </Icono>
              </Box>
            </Box>
            <Divider sx={{ m: 1 }} />
            <Collapse in={modulo.open}>
              <List
                key={`submodulos-${index}`}
                component="ul"
                style={{ cursor: 'pointer' }}
                sx={{ pt: 0, pb: 0 }}
              >
                {modulo.subModulo.map((subModuloItem, indexSubModulo) => (
                  <ListItemButton
                    id={subModuloItem.url}
                    key={`submodulo-${index}-${indexSubModulo}`}
                    component="li"
                    about={subModuloItem.propiedades.descripcion}
                    selected={rutaActiva(subModuloItem.url, rutaActual)}
                    sx={{
                      px: 0,
                      mx: 0.5,
                      justifyContent: 'space-between',
                    }}
                    onClick={() => navigateTo(subModuloItem.url)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        borderRadius: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Tooltip
                        title={!open && subModuloItem.nombre}
                        placement="right"
                      >
                        <Box
                          display="flex"
                          sx={{
                            ml: 0.75,
                          }}
                        >
                          <Icono
                            color={
                              rutaActiva(subModuloItem.url, rutaActual)
                                ? 'primary'
                                : 'action'
                            }
                            fontSize="medium"
                          >
                            {subModuloItem.propiedades.icono}
                          </Icono>
                        </Box>
                      </Tooltip>

                      <Fade in={xs ? true : open} unmountOnExit>
                        <Tooltip
                          title={subModuloItem.propiedades.descripcion}
                          enterDelay={800}
                          placement="right"
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: rutaActiva(
                                subModuloItem.url,
                                rutaActual
                              )
                                ? '600'
                                : '500',
                            }}
                            color={
                              rutaActiva(subModuloItem.url, rutaActual)
                                ? 'primary'
                                : undefined
                            }
                          >
                            {subModuloItem.label}
                          </Typography>
                        </Tooltip>
                      </Fade>
                    </Box>

                    <Box sx={{ mr: 1 }}>
                      <CustomBadge
                        content={checkContentBadge(subModuloItem.url)}
                        variante={badgeVariant}
                        sx={{
                          fontSize: '10px',
                          padding: '11px 6px',
                          borderRadius: '60px',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </Box>
      {(open || xs) && (
        <Box
          sx={{ py: 1.5 }}
          display="flex"
          flex="1"
          justifyContent="space-around"
        >
          <Box sx={{ alignSelf: 'flex-end' }}>
            <Typography color="text.disabled" variant="body2">
              {`v${versionNumber()}`}
            </Typography>
          </Box>
        </Box>
      )}
    </Drawer>
  )
}
