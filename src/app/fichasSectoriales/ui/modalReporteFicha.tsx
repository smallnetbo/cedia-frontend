import React, { useState } from 'react'
import { DialogContent, DialogActions, Grid } from '@mui/material'

import { PDFViewer } from '@react-pdf/renderer'

import { SubSector } from '../types/reporteType'
import PdfReporteGeneral from './pdfReporteGeneral'

export interface ModalPdfType {
  accionCorrecta: () => void
  accionCancelar: () => void
  listaReporte: SubSector[]
}

const ModalReporteFicha = ({
  accionCorrecta,
  accionCancelar,
  listaReporte,
}: ModalPdfType) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

  const newData = listaReporte
    ?.filter((element) => element.tipoDatoGeneral === true)
    .map((element) => ({
      id: element.id,
      nombre: element.nombre,
      icono: element.icono,
      variables: element.variables.map((variable) => ({
        ...variable,
        items: variable.items.map((item) => ({
          ...item,
          datoRegistro: variable.entidadVariables.find((entidad) => {
            // Encuentra la clave de datoRegistro que coincide con el nombre del item
            return Object.keys(entidad.datoRegistro).includes(item.nombre)
          })?.datoRegistro,
        })),
      })),
    }))

  // Parámetros para enviar al componente DocumentoPdf
  const parametros = {
    nombre: 'entidad',
    title: 'Título del Reporte',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    data: newData,
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>
            {PdfReporteGeneral(parametros)}
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

export default ModalReporteFicha
