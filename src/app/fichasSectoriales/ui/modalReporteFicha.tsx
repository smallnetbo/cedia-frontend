import React, { useState } from 'react'
import {
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Button,
} from '@mui/material'

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
  const [generatingPDF, setGeneratingPDF] = useState<boolean>(false) // Estado para controlar la generación del PDF

  const listaEntidades = Object.keys(listaReporte) // Obtener todas las claves (entidades) del objeto JSON

  const primeraEntidad = listaEntidades[0]
  const primerSubsector = listaReporte[primeraEntidad]
    ? listaReporte[primeraEntidad][0]
    : null
  const colorPrimario = primerSubsector?.sector?.colorPrimario
  const colorSecundario = primerSubsector?.sector?.colorSecundario

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

  const handlePDFGeneration = async () => {
    setGeneratingPDF(true)
    // Simula el proceso de generación del PDF con un tiempo de espera
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setGeneratingPDF(false)
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          {generatingPDF ? ( // Si se está generando el PDF, muestra el indicador de carga
            <Grid item xs={12} justifyContent="center" alignItems="center">
              <CircularProgress />
            </Grid>
          ) : (
            <PDFViewer height={'600px'}>
              {PdfReporteGeneral(parametros)}
            </PDFViewer>
          )}
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
        <Button
          onClick={handlePDFGeneration}
          disabled={generatingPDF} // Deshabilita el botón mientras se está generando el PDF
        >
          Generar PDF
        </Button>
      </DialogActions>
    </form>
  )
}

export default ModalReporteFicha
