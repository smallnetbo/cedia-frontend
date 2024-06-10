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

  const listaEntidades = Object.keys(listaReporte) // Obtener todas las claves (entidades) del objeto JSON

  const primeraEntidad = listaEntidades[0]
  const primerSubsector = listaReporte[primeraEntidad][0]
  const colorPrimario = primerSubsector.sector?.colorPrimario
  const colorSecundario = primerSubsector.sector?.colorSecundario

  const title = {
    titulo: 'Título del Reporte',
    colorPrimario: colorPrimario,
    colorSecundario: colorSecundario,
  }

  const parametros = {
    nombre: 'entidad',
    title: title,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    data: listaReporte,
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
