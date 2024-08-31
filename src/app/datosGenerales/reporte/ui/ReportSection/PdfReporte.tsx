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
    position: 'relative',
    fontFamily: 'Helvetica',
  },
  content: {
    marginTop: 0,
  },
})

export default PdfReporte
