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

export interface ModalPdfType {
  accionCorrecta: () => void
  accionCancelar: () => void
  infoEntidadData?: SubSector[]
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

  const newData = infoEntidadData
    ?.filter((element) => element.tipoDatoGeneral === true)
    .map((element) => ({
      id: element.id,
      nombre: element.nombre,
      icono: element.icono,
      variables: element.variables
        .map((variable) => {
          const items = variable.items
            .map((item) => {
              const entidadVariable = variable.entidadVariables.find(
                (entidad) =>
                  entidad.datoRegistro[item.nombre.toLowerCase()] !== undefined
              )

              const datoRegistro = entidadVariable
                ? entidadVariable.datoRegistro[item.nombre.toLowerCase()]
                : undefined

              return {
                ...item,
                datoRegistro:
                  datoRegistro !== undefined
                    ? { nombre: item.nombre, valor: datoRegistro }
                    : undefined,
              }
            })
            .filter((item) => item.datoRegistro !== undefined)

          return {
            ...variable,
            items,
          }
        })
        .filter((variable) => variable.items.length > 0),
    }))
    .filter((element) => element.variables.length > 0)

  // Parámetros para enviar al componente DocumentoPdf
  const parametros = {
    nombre: nombreEntidad,
    title: 'Título del Reporte',
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    imageSrc: mapImage,
    tipoGobierno: tipoGobierno,
    data: newData,
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
