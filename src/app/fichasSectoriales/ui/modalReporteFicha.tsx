import React, { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogActions,
  Grid,
  Button,
  CircularProgress,
  Box,
} from '@mui/material'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
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
  listaReporte: SubSector[]
  selectedEntidad: EntidadFicha | null
}

const ModalReporteFicha = ({ listaReporte, selectedEntidad }: ModalPdfType) => {
  const [chartImages, setChartImages] = useState({})
  const [imagesGenerated, setImagesGenerated] = useState<boolean>(false)
  const [pdfReady, setPdfReady] = useState<boolean>(false)

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
    titulo: sector ?? '',
    subTitulo: selectedEntidad?.nombreGam ?? '',
    colorPrimario: colorPrimario ?? '',
    colorSecundario: colorSecundario ?? '',
  }

  const parametros = {
    title: title,
    datosGenerales: datosGenerales,
    dataReporteGraficos: dataReporteGraficos,
    graficoImage: chartImages,
  }

  useEffect(() => {
    if (imagesGenerated) {
      setPdfReady(true)
    }
  }, [imagesGenerated])

  const handleImagesGenerated = (generatedImages) => {
    setChartImages(generatedImages)
    setImagesGenerated(true)
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          {!imagesGenerated && (
            <GenerarImagenes
              listaReporte={datosGrafico}
              setChartImages={handleImagesGenerated}
              setImagesGenerated={setImagesGenerated}
            />
          )}
          {imagesGenerated && (
            <PDFViewer height={'600px'}>
              <PdfReporteFicha parametros={parametros} />
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
        {pdfReady ? (
          <PDFDownloadLink
            document={<PdfReporteFicha parametros={parametros} />}
            fileName={parametros.title.subTitulo}
          >
            {({ blob, url, loading, error }) => (
              <Button
                size="large"
                variant="contained"
                startIcon={<span className="material-icons">download</span>}
                disabled={loading}
              >
                {loading ? (
                  <Box display="flex" alignItems="center">
                    <CircularProgress
                      size={24}
                      sx={{ color: 'primary', marginRight: 1 }}
                    />
                    Cargando...
                  </Box>
                ) : (
                  'DESCARGAR'
                )}
              </Button>
            )}
          </PDFDownloadLink>
        ) : (
          <Button
            size="large"
            variant="contained"
            startIcon={<span className="material-icons">download</span>}
            disabled
          >
            Preparando...
          </Button>
        )}
      </DialogActions>
    </form>
  )
}

export default ModalReporteFicha
