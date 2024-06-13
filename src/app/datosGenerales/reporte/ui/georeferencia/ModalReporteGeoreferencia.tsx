import React, { useState } from 'react'
import { DialogContent, DialogActions, Grid } from '@mui/material'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'
import { filtradoDatosGeneralesPorEntidad } from '@/app/fichasSectoriales/utils/filtradoDatosGeneralesPorEntidad'
import { PDFViewer } from '@react-pdf/renderer'
import PdfReporteGeneral from '@/app/fichasSectoriales/ui/pdfReporteGeneral'

export interface ModalPdfType {
  accionCorrecta: () => void
  accionCancelar: () => void
  infoEntidadData: SubSector[]
  titulo?: string
  subTitulo: Gobiernos
}

const ModalReporteGeoreferencia = ({
  accionCorrecta,
  accionCancelar,
  infoEntidadData,
  titulo,
  subTitulo,
}: ModalPdfType) => {
  const [loadingModal, setLoadingModal] = useState<boolean>(false)

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

  const title = {
    titulo: titulo,
    subTitulo: subTitulo.name,
    colorPrimario: colorPrimario,
    colorSecundario: colorSecundario,
  }
  const parametros = {
    nombre: 'entidad',
    title: title,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    data: datosGenerales,
  }

  return (
    <form>
      <DialogContent dividers>
        <Grid container direction={'column'} justifyContent="space-evenly">
          <PDFViewer height={'600px'}>
            {PdfReporteGeneral(parametros)}
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
      ></DialogActions>
    </form>
  )
}

export default ModalReporteGeoreferencia
