import React from 'react'
import {
  DialogContent,
  DialogActions,
  Grid,
  Button,
  CircularProgress,
  Box,
} from '@mui/material'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import {
  duplicarOrganoLegislativoPorEntidad,
  filtradoDatosGeneralesPorEntidad,
} from '@/app/datosGenerales/dataUtils/filtros/filtradoDatosGeneralesPorEntidad'
import PdfReportePorEntidad from '../reportesPDF/PdfReportePorEntidad'

interface Title {
  titulo: string
  subTitulo: string
  colorPrimario: string
  colorSecundario: string
}

interface Parametros {
  title: Title
  datosGenerales: { [entidad: string]: SubSector[] }
}
export interface ModalPdfType {
  infoEntidadData: SubSector[]
  titulo?: string
  subTitulo: Gobiernos
}

const ModalReporteGeoreferencia = ({
  infoEntidadData,
  titulo,
  subTitulo,
}: ModalPdfType) => {
  const primeraEntidad = infoEntidadData?.find((item) => {
    const entidadVariable = item.variables.flatMap((variable) =>
      variable.entidadVariables.find(
        (entidadVariable) => entidadVariable.entidad.nombre
      )
    )
    return entidadVariable
  })

  const colorPrimario = primeraEntidad?.sector.colorPrimario
  const colorSecundario = primeraEntidad?.sector.colorSecundario

  const datosGenerales = filtradoDatosGeneralesPorEntidad(infoEntidadData)
  const datosDuplicados = duplicarOrganoLegislativoPorEntidad(datosGenerales)
  const title: Title = {
    titulo: titulo ?? '',
    subTitulo: subTitulo.name ?? '',
    colorPrimario: colorPrimario ?? '',
    colorSecundario: colorSecundario ?? '',
  }

  const parametros: Parametros = {
    title: title,
    datosGenerales: datosDuplicados || [],
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>
            <PdfReportePorEntidad parametros={parametros} />
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
          document={<PdfReportePorEntidad parametros={parametros} />}
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

export default ModalReporteGeoreferencia
