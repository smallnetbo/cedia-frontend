import React, { useEffect, useState } from 'react'
import {
  Button,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { SubSector } from '../../../types/datosGeneralesType'

import { generarDataReporteGraficos } from '@/app/datosGenerales/dataUtils/reportes/generateDataReporteGraficos'
import GenerarImagenesDatoGeneral from '@/components/echarts/generarImagenesGrafico/GenerarImagenesDatoGeneral'

import PdfReporte from '../ReportSection/PdfReporte'

interface Title {
  titulo: string
  subTitulo: string
  colorPrimario: string
  colorSecundario: string
}

interface Parametros {
  title: Title
  datosGenerales: SubSector[]
  imagesDatoGeneral?: { [key: string]: string[] | {} }
  dataReporteGraficos: SubSector[]
  graficoImage?: { [key: string]: string[] | {} }
}

interface ModalPdfType {
  infoEntidadData: SubSector[]
  dataReporteGraficos?: SubSector[]
  chartImages?: { [key: string]: string[] | {} }
}

const ModalReporteGeneralMapa = ({
  infoEntidadData,
  dataReporteGraficos,
  chartImages,
}: ModalPdfType) => {
  const [imagesGenerated, setImagesGenerated] = useState<boolean>(false)
  const [pdfReady, setPdfReady] = useState<boolean>(false)
  const [imagesDatoGeneral, setChartImages] = useState({})

  const datosGenerales = generarDataReporteGraficos(infoEntidadData)

  const primeraEntidad = infoEntidadData?.find((item) => {
    const entidadVariable = item.variables.flatMap((variable) =>
      variable.entidadVariables.find(
        (entidadVariable) => entidadVariable.entidad.nombre
      )
    )
    return entidadVariable
  })

  const nombreEntidad =
    primeraEntidad?.variables[0]?.entidadVariables[0]?.entidad.nombreGam

  const colorPrimario = primeraEntidad?.sector.colorPrimario
  const colorSecundario = primeraEntidad?.sector.colorSecundario
  const sector = primeraEntidad?.sector.nombre

  const title: Title = {
    titulo: sector ?? '',
    subTitulo: nombreEntidad ?? '',
    colorPrimario: colorPrimario ?? '',
    colorSecundario: colorSecundario ?? '',
  }

  const parametros: Parametros = {
    title: title,
    datosGenerales: datosGenerales || [],
    imagesDatoGeneral: imagesDatoGeneral || {},
    dataReporteGraficos: dataReporteGraficos || [],
    graficoImage: chartImages || {},
  }

  useEffect(() => {
    if (imagesGenerated) {
      setPdfReady(true)
    }
  }, [imagesGenerated])

  const handleImagesGenerated = (generatedImages: any) => {
    setChartImages(generatedImages)
    setImagesGenerated(true)
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          {!imagesGenerated && (
            <GenerarImagenesDatoGeneral
              listaReporte={datosGenerales}
              setChartImages={handleImagesGenerated}
              setImagesGenerated={setImagesGenerated}
            />
          )}
          {imagesGenerated && (
            <PDFViewer height={'600px'}>
              <PdfReporte parametros={parametros} />
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
            document={<PdfReporte parametros={parametros} />}
            fileName={parametros.title.subTitulo}
          >
            {({ blob, url, loading, error }) => (
              <Button
                size="large"
                variant="contained"
                startIcon={<span className="material-icons">download</span>}
                disabled={loading}
                sx={{
                  color: 'white',
                }}
              >
                {loading ? (
                  <Box display="flex" alignItems="center">
                    <CircularProgress
                      size={24}
                      sx={{ color: 'white', marginRight: 1 }}
                    />
                    <Typography color="white">Cargando...</Typography>
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
            sx={{
              color: 'white',
            }}
          >
            Preparando...
          </Button>
        )}
      </DialogActions>
    </form>
  )
}

export default ModalReporteGeneralMapa
