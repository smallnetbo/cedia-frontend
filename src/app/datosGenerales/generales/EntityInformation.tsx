import React, { useState } from 'react'
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Grid,
  Paper,
  ListItemIcon,
  styled,
  Box,
  Button,
} from '@mui/material'
import { SubSector } from '../types/datosGeneralesType'
import { Icono } from '@/components/Icono'
import { CustomDialog } from '@/components/modales/CustomDialog'
import ModalPdf from '../reporte/ui/modalPdf'
import { delay } from '@/utils'
import { Gobiernos } from '@/types/map/entidad.interface'
import html2canvas from 'html2canvas'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

interface InformacionInterface {
  infoEntidadData: SubSector[]
  selectedGobierno: Gobiernos
}
const EntityInformation = React.memo(
  ({ infoEntidadData, selectedGobierno }: InformacionInterface) => {
    const newData = infoEntidadData
      .filter((element) => element.tipoDatoGeneral === true)
      .map((element) => ({
        id: element.id,
        nombre: element.nombre,
        icono: element.icono,
        variables: element.variables.map((variable) => ({
          ...variable,
          items: variable.items.map((item) => ({
            ...item,
            datoRegistro: variable.entidadVariables.find(
              (entidad) => entidad.datoRegistro.recurso === item.nombre
            )?.datoRegistro,
          })),
        })),
      }))

    const [modalPdf, setModalPdf] = useState(false)

    const cerrarModalPdf = async () => {
      setModalPdf(false)
      await delay(500)
    }
    const verPdfModal = () => {
      setModalPdf(true)
    }

    //captura de pantalla al mapa
    const [mapImage, setMapImage] = useState<string | null>(null)

    //capturar imagen de mapa
    const capturarImagenMapa = () => {
      const leafletContainer = document.querySelector(
        '.leaflet-container'
      ) as HTMLElement

      if (leafletContainer) {
        html2canvas(leafletContainer, {}).then((canvas) => {
          const imgData = canvas.toDataURL()
          setMapImage(imgData) // Guarda la imagen como base64 en el estado
        })
      } else {
        console.error('No se encontró el contenedor del mapa')
      }
    }

    return (
      <Grid>
        <Box ml="auto" style={{ textAlign: 'right' }}>
          <Button
            onClick={() => {
              capturarImagenMapa()
              verPdfModal()
            }}
            startIcon={
              <span className="material-icons" style={{ fontSize: '34px' }}>
                local_printshop
              </span>
            }
          ></Button>
          <CustomDialog
            isOpen={modalPdf}
            handleClose={cerrarModalPdf}
            title="VISTA PREVIA PDF"
            maxWidth="lg"
          >
            <ModalPdf
              infoEntidadData={infoEntidadData}
              accionCorrecta={() => {
                cerrarModalPdf().finally()
              }}
              accionCancelar={cerrarModalPdf}
              mapImage={mapImage}
              tipoGobierno={selectedGobierno}
            />
          </CustomDialog>
        </Box>
        <Item
          elevation={4}
          style={{
            maxWidth: '100%',
            maxHeight: '650px',
            overflow: 'auto',
          }}
        >
          <Grid container direction="column">
            {newData.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Typography
                  variant="h6"
                  style={{
                    backgroundColor: '#50C0B2',
                    padding: '8px',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  {item.nombre}
                </Typography>

                <Grid container spacing={2} sx={{ backgroundColor: 'inherit' }}>
                  {item.variables.map((variable) =>
                    variable.items.map((items) => (
                      <Grid item xs={12} sm={6} key={items.id}>
                        <List sx={{ width: '100%' }}>
                          <ListItem
                            alignItems="flex-start"
                            sx={{ marginBottom: '1px' }}
                          >
                            <ListItemIcon sx={{ minWidth: '45px' }}>
                              <Icono color={'inherit'} fontSize={'large'}>
                                {items.icono}
                              </Icono>
                            </ListItemIcon>

                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1"
                                  sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                                >
                                  {items.nombre}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: '0.8rem' }}
                                >
                                  {items.datoRegistro?.ejecucion}
                                </Typography>
                              }
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    ))
                  )}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Item>
      </Grid>
    )
  }
)

export default EntityInformation
