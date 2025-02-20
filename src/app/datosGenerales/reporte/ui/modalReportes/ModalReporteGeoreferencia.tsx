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
import {
  ChartData,
  SubSector,
} from '@/app/datosGenerales/types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { filtradoDatosGeneralesPorEntidad } from '@/app/datosGenerales/dataUtils/filtros/filtradoDatosGeneralesPorEntidad'
import PdfReportePorEntidad from '../reportesPDF/PdfReportePorEntidad'

export interface EntidadesData {
  codigoEntidad: string
  nombre: string
  chartData: ChartData[]
  color: string
}
export interface ModalPdfType {
  infoEntidadData: SubSector[]
  selectedEntidades: EntidadesData[]
  capturedImage: string | null
  titulo?: string
  subTitulo: Gobiernos
}

const ModalReporteGeoreferencia = ({
  infoEntidadData,
  selectedEntidades,
  capturedImage,
  titulo,
  subTitulo,
}: ModalPdfType) => {
  const datosGenerales = filtradoDatosGeneralesPorEntidad(
    infoEntidadData,
    selectedEntidades
  )
  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>
            <PdfReportePorEntidad
              parametros={datosGenerales}
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
              parametros={datosGenerales}
              imagen={capturedImage}
            />
          }
          fileName={datosGenerales.nombre}
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
