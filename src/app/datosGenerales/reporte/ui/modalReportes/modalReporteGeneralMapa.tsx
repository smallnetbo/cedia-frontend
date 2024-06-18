import React from 'react'
import {
  Button,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  CircularProgress,
} from '@mui/material'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { SubSector } from '../../../types/datosGeneralesType'
import PdfReporteFicha from '../reportesPDF/PdfReporteFicha'
import { generarDataReporteGraficos } from '@/app/datosGenerales/dataUtils/reportes/generateDataReporteGraficos'

export interface ModalPdfType {
  infoEntidadData: SubSector[]
  dataReporteGraficos?: SubSector[]
  chartImages?: { [key: string]: string[] | {} }
}

const ModalReporteGeneralMapa = ({
  infoEntidadData,
  dataReporteGraficos,
  chartImages,
}: ModalPdfType) => {
  const datosGenerales: SubSector[] =
    generarDataReporteGraficos(infoEntidadData)

  const primeraEntidad = infoEntidadData?.find((item) => {
    const entidadVariable = item.variables.flatMap((variable) =>
      variable.entidadVariables.find(
        (entidadVariable) => entidadVariable.entidad.nombre
      )
    )
    return entidadVariable
  })

  const nombreEntidad =
    primeraEntidad?.variables[0]?.entidadVariables[0]?.entidad.nombre

  const colorPrimario = primeraEntidad?.sector.colorPrimario
  const colorSecundario = primeraEntidad?.sector.colorSecundario
  const sector = primeraEntidad?.sector.nombre

  const title = {
    titulo: sector ?? '',
    subTitulo: nombreEntidad ?? '',
    colorPrimario: colorPrimario ?? '',
    colorSecundario: colorSecundario ?? '',
  }

  const parametros = {
    title: title,
    datosGenerales: datosGenerales,
    dataReporteGraficos: dataReporteGraficos,
    graficoImage: chartImages,
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>
            <PdfReporteFicha parametros={parametros} />
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
      </DialogActions>
    </form>
  )
}

export default ModalReporteGeneralMapa
