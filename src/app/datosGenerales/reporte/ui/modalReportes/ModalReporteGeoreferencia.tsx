import React from 'react'
import {
  DialogContent,
  DialogActions,
  Grid,
  Button,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'

import PdfReportePorEntidad from '../reportesPDF/PdfReportePorEntidad'
import { transformarDatosParaPDFGeoreferencia } from '@/app/datosGenerales/dataUtils/filtros/transformarDatosParaPDFGeoreferencia'

export interface SelectedEntidad {
  codigoEntidad: string
  nombre: string
  chartData: ChartData[]
  color: string
}

export interface ModalPdfType {
  switchEntidadesMap?: {
    [key: string]: {
      nameAgrupador: string
      entidades: SelectedEntidad[]
    }
  }
  capturedImage: string | null
  titulo?: string
  subTitulo: Gobiernos
}

const ModalReporteGeoreferencia = ({
  switchEntidadesMap,
  capturedImage,
  titulo,
  subTitulo,
}: ModalPdfType) => {
  const parametrosPDF = transformarDatosParaPDFGeoreferencia(
    switchEntidadesMap,
    titulo,
    subTitulo
  )

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>
            <PdfReportePorEntidad
              parametros={parametrosPDF}
              imagen={capturedImage}
            />
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
          document={
            <PdfReportePorEntidad
              parametros={parametrosPDF}
              imagen={capturedImage}
            />
          }
          fileName={titulo || 'reporte.pdf'}
        >
          {({ loading }) => (
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
      </DialogActions>
    </form>
  )
}

export default ModalReporteGeoreferencia
