import React, { useState } from 'react'
import { DialogContent, DialogActions, Grid, Button } from '@mui/material'

import { PDFViewer } from '@react-pdf/renderer'

import { SubSector } from '../types/reporteType'

import {
  filterDatoGeneralReporte,
  filterDatoGeneralVista,
} from '@/app/datosGenerales/dataUtils/filtros/filterDatosGenerales'
import { filtradoDatosGenerales } from '@/app/datosGenerales/dataUtils/filtradoDatosGenerales'

import GenerarImagenes from '@/components/echarts/generarImagenesGrafico/GenerarImagenes'
import { generarDataReporteGraficos } from '@/app/datosGenerales/dataUtils/reportes/generateDataReporteGraficos'

import PdfReporteFicha from './PdfReporteFicha'
import { EntidadFicha } from '../types/fichaType'

export interface ModalPdfType {
  accionCorrecta: () => void
  accionCancelar: () => void
  listaReporte: SubSector[]
  selectedEntidad: EntidadFicha
}

const ModalReporteFicha = ({
  accionCorrecta,
  accionCancelar,
  listaReporte,
  selectedEntidad,
}: ModalPdfType) => {
  const [generatingPDF, setGeneratingPDF] = useState<boolean>(false)
  const [chartImages, setChartImages] = useState({})
  const [imagesGenerated, setImagesGenerated] = useState<boolean>(false)

  const filterDatosGenerales = filterDatoGeneralReporte(listaReporte)
  const datosGenerales = filtradoDatosGenerales(filterDatosGenerales)
  const datosGrafico = filterDatoGeneralVista(listaReporte)
  const dataReporteGraficos = generarDataReporteGraficos(datosGrafico)

  const primeraEntidad = datosGrafico?.find((item) => {
    const entidadVariable = item.variables.flatMap((variable) =>
      variable.entidadVariables.find(
        (entidadVariable) => entidadVariable.entidad.nombre
      )
    )
    return entidadVariable
  })

  const colorPrimario = primeraEntidad?.sector.colorPrimario
  const colorSecundario = primeraEntidad?.sector.colorSecundario
  const sector = primeraEntidad?.sector.nombre

  const title = {
    titulo: sector,
    subTitulo: selectedEntidad.nombreGam,
    colorPrimario: colorPrimario,
    colorSecundario: colorSecundario,
  }

  const parametros = {
    nombre: 'entidad',
    title: title,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    datosGenerales: datosGenerales,
    dataReporteGraficos: dataReporteGraficos,
    graficoImage: chartImages,
  }

  const handlePDFGeneration = async () => {
    setGeneratingPDF(true)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setGeneratingPDF(false)
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          {!imagesGenerated ? (
            <GenerarImagenes
              listaReporte={datosGrafico}
              setChartImages={setChartImages}
              setImagesGenerated={setImagesGenerated}
            />
          ) : (
            <PDFViewer height={'600px'}>
              {PdfReporteFicha(parametros)}
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
          disabled={generatingPDF || !imagesGenerated}
        >
          Generar PDF
        </Button>
      </DialogActions>
    </form>
  )
}

export default ModalReporteFicha
