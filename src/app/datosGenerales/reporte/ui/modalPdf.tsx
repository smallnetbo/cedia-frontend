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

export interface ModalPdfType {
  accionCorrecta: () => void
  accionCancelar: () => void
  infoEntidadData?: SubSector[]
}

const ModalPdf = ({
  accionCorrecta,
  accionCancelar,
  infoEntidadData,
}: ModalPdfType) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

  const newData = infoEntidadData?.map((element) => ({
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
    imageSrc: 'https://example.com/image.jpg',
    data: newData,
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>{documentoPdf(parametros)}</PDFViewer>
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
        <PDFDownloadLink
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
        </PDFDownloadLink>
      </DialogActions>
    </form>
  )
}

export default ModalPdf
