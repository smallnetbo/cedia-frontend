import React, { useState, useEffect } from 'react'
import {
  DialogContent,
  DialogActions,
  Grid,
  Button,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'

import PdfReporteFicha from '../reportesPDF/PdfReporteFicha'
import {
  filterDatoGeneralReporte,
  filterDatoGeneralVista,
} from '@/app/datosGenerales/dataUtils/filtros/filterDatosGenerales'
import { generarDataReporteGraficos } from '@/app/datosGenerales/dataUtils/reportes/generateDataReporteGraficos'
import { EntidadFicha } from '../../../../fichasSectoriales/types/fichaType'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'
import GenerarImagenesSectores from '@/components/echarts/generarImagenesGrafico/GenerarImagenesSectores'
import GenerarImagenesDatoGeneral from '@/components/echarts/generarImagenesGrafico/GenerarImagenesDatoGeneral'
import PdfReporte from '../ReportSection/PdfReporte'

const filtrarVariablesRepetidas = (variables: SubSector['variables']) => {
  const uniqueVariables: { [key: string]: boolean } = {}
  return variables.filter((variable) => {
    if (uniqueVariables[variable.nombre]) {
      return false
    }
    uniqueVariables[variable.nombre] = true
    return true
  })
}

interface Title {
  titulo: string
  subTitulo: string
  colorPrimario: string
  colorSecundario: string
}

interface Parametros {
  title: Title
  datosGenerales: SubSector[]
  dataReporteGraficos: SubSector[]
  graficoImage?: { [key: string]: string[] | {} }
  imagesDatoGeneral?: { [key: string]: string[] | {} }
}

export interface ModalPdfType {
  listaReporte: SubSector[]
  selectedEntidad: EntidadFicha | null
}

const ModalReporteFicha = ({ listaReporte, selectedEntidad }: ModalPdfType) => {
  const [chartImages, setChartImages] = useState<{ [key: string]: string[] }>(
    {}
  )

  const [imagesDatoGeneral, setImagesDatoGeneral] = useState<{
    [key: string]: string[]
  }>({})

  const [pdfReady, setPdfReady] = useState<boolean>(false)
  const [phase, setPhase] = useState<'initial' | 'duplicate' | 'complete'>(
    'initial'
  )

  const filterDatosGenerales = filterDatoGeneralReporte(listaReporte)
  const datosGenerales = generarDataReporteGraficos(filterDatosGenerales)

  const datosGrafico = filterDatoGeneralVista(listaReporte)

  const filteredDatosGrafico = datosGrafico.map((item) => ({
    ...item,
    variables: filtrarVariablesRepetidas(item.variables),
  }))

  const dataReporteGraficos = generarDataReporteGraficos(filteredDatosGrafico)

  const primeraEntidad = filteredDatosGrafico?.find((item) => {
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

  const title: Title = {
    titulo: sector ?? '',
    subTitulo: selectedEntidad?.nombreGam ?? '',
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
    if (phase === 'complete') {
      setPdfReady(true)
    }
  }, [phase])

  const handleImagesGenerated = (
    type: 'grafico' | 'imageDatoGeneral',
    generatedImages: any
  ) => {
    if (type === 'grafico') {
      setChartImages(generatedImages)
      setPhase('duplicate')
    } else if (type === 'imageDatoGeneral') {
      setImagesDatoGeneral(generatedImages)
      setPhase('complete')
    }
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          {phase === 'initial' && (
            <GenerarImagenesSectores
              listaReporte={filteredDatosGrafico}
              setChartImages={(images) =>
                handleImagesGenerated('grafico', images)
              }
              setImagesGenerated={() => {}}
            />
          )}
          {phase === 'duplicate' && (
            <GenerarImagenesDatoGeneral
              listaReporte={datosGenerales}
              setChartImages={(images) =>
                handleImagesGenerated('imageDatoGeneral', images)
              }
              setImagesGenerated={() => {}}
            />
          )}
          {pdfReady && (
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

export default ModalReporteFicha
