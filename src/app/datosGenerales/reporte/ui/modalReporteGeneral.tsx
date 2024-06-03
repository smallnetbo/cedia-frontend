import React, { useState } from 'react'
import {
  Modal,
  Button,
  DialogContent,
  DialogActions,
  Grid,
  Box,
} from '@mui/material'
import documentoPdf from './pdfDatosGenerales'
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer'
import { DatoRegistro, SubSector } from '../../types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'
import DocumentoPdfGeneral from './pdfGeneral'
import { filtradoDatosGenerales } from '../../dataUtils/filtradoDatosGenerales'

export interface ModalPdfType {
  accionCorrecta: () => void
  accionCancelar: () => void
  infoEntidadData: SubSector[]
  dataReporteGraficos?: SubSector[]
  chartImages?: string[]
}

const ModalReporteGeneral = ({
  accionCorrecta,
  accionCancelar,
  infoEntidadData,
  dataReporteGraficos,
  chartImages,
  mapImage,
  tipoGobierno,
}: ModalPdfType & { mapImage?: string | undefined } & {
  tipoGobierno?: Gobiernos
}) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

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

  const datosGenerales = filtradoDatosGenerales(infoEntidadData)

  // Parámetros para enviar al componente DocumentoPdf
  const parametros = {
    nombre: nombreEntidad,
    title: 'Título del Reporte',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    imageSrc: mapImage,
    tipoGobierno: tipoGobierno,
    datosGenerales: datosGenerales,
    dataReporteGraficos: dataReporteGraficos,
    graficoImage: chartImages,
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>
            {DocumentoPdfGeneral(parametros)}
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
        {/* <PDFDownloadLink
          document={documentoPdf(parametros)}
          fileName={parametros.nombre}
        >
          {({ blob, url, loading, error }) => (
            <Button
              size="large"
              variant="contained"
              startIcon={<span className="material-icons">download</span>}
            >
              {loading ? 'Cargando...' : 'DESCARGAR'}
            </Button>
          )}
        </PDFDownloadLink> */}
      </DialogActions>
    </form>
  )
}

export default ModalReporteGeneral
