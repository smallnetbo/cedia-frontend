import React, { useState } from 'react'
import {
  Modal,
  Button,
  DialogContent,
  DialogActions,
  Grid,
  Box,
} from '@mui/material'
import documentoPdf from './pdf'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { SubSector } from '../../types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'
import DocumentoPdfGeneral from './pdfGeneral'

export interface ModalPdfType {
  accionCorrecta: () => void
  accionCancelar: () => void
  infoEntidadData?: SubSector[]
  dataReporteGraficos?: SubSector[]
}

const ModalReporteGeneral = ({
  accionCorrecta,
  accionCancelar,
  infoEntidadData,
  dataReporteGraficos,

  mapImage,
  tipoGobierno,
}: ModalPdfType & { mapImage?: string | undefined } & {
  tipoGobierno?: Gobiernos
}) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

  const newData = infoEntidadData
    ?.filter((element) => element.tipoDatoGeneral === true)
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

  // Parámetros para enviar al componente DocumentoPdf
  const parametros = {
    nombre: 'Nombre del Usuario',
    title: 'Título del Reporte',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    imageSrc: mapImage,
    tipoGobierno: tipoGobierno,
    data: newData,
    dataReporteGraficos: dataReporteGraficos,
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>
            {DocumentoPdfGeneral(parametros)}
          </PDFViewer>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          my: 1,
          mx: 2,
          justifyContent: {
            lg: 'flex-end',
            md: 'flex-end',
            xs: 'center',
            sm: 'center',
          },
        }}
      >
        {/* <PDFDownloadLink
          document={documentoPdf(parametros)}
          fileName={parametros.nombre}
        >
          {({ blob, url, loading, error }) => (
            <Button
              size="large"
              variant="contained"
              startIcon={<span className="material-icons">download</span>}
            >
              {loading ? 'Cargando...' : 'DESCARGAR'}
            </Button>
          )}
        </PDFDownloadLink> */}
      </DialogActions>
    </form>
  )
}

export default ModalReporteGeneral
