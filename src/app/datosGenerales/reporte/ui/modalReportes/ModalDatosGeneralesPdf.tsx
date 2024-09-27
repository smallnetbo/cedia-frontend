import React from 'react'
import {
  Button,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Box,
} from '@mui/material'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { SubSector } from '../../../types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'
import PdfDatosGenerales from '../reportesPDF/pdfDatosGenerales'

export interface ModalPdfType {
  infoEntidadData: SubSector[]
  mapImage: string | null
  tipoGobierno: Gobiernos
}

const ModalDatosGeneralesPdf = ({
  infoEntidadData,
  mapImage,
  tipoGobierno,
}: ModalPdfType) => {
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

  const parametros = {
    nombre: nombreEntidad ?? '',
    title: 'Título del Reporte',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    imageSrc: mapImage ?? '',
    tipoGobierno: tipoGobierno || undefined,
    data: infoEntidadData || [],
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>
            <PdfDatosGenerales parametros={parametros} />
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
          document={<PdfDatosGenerales parametros={parametros} />}
          fileName={parametros.nombre}
        >
          {({ loading }) => (
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

export default ModalDatosGeneralesPdf
