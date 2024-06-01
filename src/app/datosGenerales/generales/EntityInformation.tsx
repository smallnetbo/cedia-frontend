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
import { filtradoDatosGenerales } from '../dataUtils/filtradoDatosGenerales'
import VariableList from './ui/VariableList'

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
    const newData = filtradoDatosGenerales(infoEntidadData)

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
      <>
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
            maxHeight: '620px',
            overflow: 'auto',
          }}
        >
          <Grid container direction="column" spacing={1}>
            {newData.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Box
                  sx={{
                    marginBottom: '5px',
                    borderBottom: '2px solid #50C0B2',
                  }}
                >
                  <Typography
                    variant="h5"
                    style={{
                      backgroundColor: '#50C0B2',
                      padding: '5px',
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    {item.nombre}
                  </Typography>
                </Box>
                {item.variables.map((variable) => (
                  <VariableList
                    key={variable.id}
                    variable={variable}
                    totalVariables={item.variables.length}
                  />
                ))}
              </Grid>
            ))}
          </Grid>
        </Item>
      </>
    )
  }
)

export default EntityInformation
