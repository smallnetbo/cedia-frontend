import React from 'react'
import { Document, Page, View, StyleSheet } from '@react-pdf/renderer'
import Section from './Section'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'
import Header from './Header'

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

interface PdfReporteFichaProps {
  parametros: Parametros
}

const PdfReporte: React.FC<PdfReporteFichaProps> = ({ parametros }) => {
  const findDatoRegistroValor = (
    variableId: string,
    nombreCorto: string
  ): string | number | undefined => {
    const subSector = parametros.datosGenerales.find((section) =>
      section.variables.some((variable) => variable.id === variableId)
    )
    if (!subSector) return undefined

    const variable = subSector.variables.find(
      (variable) => variable.id === variableId
    )
    if (!variable) return undefined

    const entidadVariable = variable.entidadVariables.find(
      (entidad) =>
        entidad.datoRegistro && entidad.datoRegistro[nombreCorto] !== undefined
    )
    if (!entidadVariable || !entidadVariable.datoRegistro) return undefined

    return entidadVariable.datoRegistro[nombreCorto]
  }

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page} wrap={true}>
        <View style={styles.content}>
          <Header title={parametros.title} />
          {parametros.datosGenerales.map((section, index) => (
            <Section
              key={index}
              section={section}
              titleColor={parametros.title.colorSecundario}
              isChartSection={false}
              findDatoRegistroValor={findDatoRegistroValor}
              imagesDatoGeneral={parametros.imagesDatoGeneral || {}}
            />
          ))}
        </View>
      </Page>
      <Page size="A4" orientation="portrait" style={styles.page} wrap={true}>
        <View style={styles.content}>
          {parametros.dataReporteGraficos.map((section, index) => (
            <Section
              key={index}
              section={section}
              titleColor={parametros.title.colorSecundario}
              isChartSection={true}
              graficoImage={parametros.graficoImage}
              findDatoRegistroValor={findDatoRegistroValor}
            />
          ))}
        </View>
      </Page>
    </Document>
  )
}
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 15,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
})

export default PdfReporte
