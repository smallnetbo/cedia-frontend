import React, { useState } from 'react'
import { Typography, Grid, Paper, styled, Box, Button } from '@mui/material'
import { SubSector } from '../types/datosGeneralesType'
import { CustomDialog } from '@/components/modales/CustomDialog'
import { delay } from '@/utils'
import { Gobiernos } from '@/types/map/entidad.interface'
import html2canvas from 'html2canvas'
import VariableList from './ui/VariableList'
import ModalDatosGeneralesPdf from '../reporte/ui/modalReportes/ModalDatosGeneralesPdf'
import { generarDataReporteGraficos } from '../dataUtils/reportes/generateDataReporteGraficos'

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
    const newData = generarDataReporteGraficos(infoEntidadData)

    const [modalPdf, setModalPdf] = useState(false)

    const cerrarModalPdf = async () => {
      setModalPdf(false)
      await delay(500)
    }
    const verPdfModal = () => {
      setModalPdf(true)
    }

    const [mapImage, setMapImage] = useState<string | null>(null)

    const capturarImagenMapa = () => {
      const leafletContainer = document.querySelector(
        '.leaflet-container'
      ) as HTMLElement

      if (leafletContainer) {
        leafletContainer.style.width = '100%'
        leafletContainer.style.height = '100%'

        const options = {
          scale: 2,
          useCORS: true,
        }

        html2canvas(leafletContainer, options).then((canvas) => {
          const imgData = canvas.toDataURL()
          setMapImage(imgData)
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
            <ModalDatosGeneralesPdf
              infoEntidadData={newData}
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
            {newData.map((subSector) => (
              <Grid item xs={12} key={subSector.id}>
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
                    {subSector.nombre}
                  </Typography>
                </Box>
                {subSector.variables.map((variable) => (
                  <VariableList
                    key={variable.id}
                    variable={variable}
                    totalVariables={subSector.variables.length}
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
EntityInformation.displayName = 'EntityInformation'
export default EntityInformation
