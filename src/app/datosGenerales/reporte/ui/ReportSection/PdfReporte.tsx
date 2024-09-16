import React from 'react'
import {
  Document,
  Page,
  View,
  StyleSheet,
  Text,
  Font,
} from '@react-pdf/renderer'
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
      <Page size="A4" orientation="portrait" style={styles.page} wrap>
        <View style={styles.content}>
          <Header title={parametros.title} />

          {parametros.datosGenerales.map((section, index) => (
            <Section
              key={`datosGenerales-${index}`}
              section={section}
              titleColor={parametros.title.colorSecundario}
              isChartSection={false}
              imagesDatoGeneral={parametros.imagesDatoGeneral || {}}
            />
          ))}

          {parametros.dataReporteGraficos.map((section, index) => (
            <Section
              key={`dataReporteGraficos-${index}`}
              section={section}
              titleColor={parametros.title.colorSecundario}
              isChartSection={true}
              graficoImage={parametros.graficoImage}
            />
          ))}
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
})

const styles = StyleSheet.create({
  page: {
    // flexDirection: 'column',
    padding: 20, // Define márgenes de la página
    fontFamily: 'Oswald',
  },
  content: {
    flexGrow: 1,
    marginTop: 5, // Ajusta margen superior para el contenido
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
})

export default PdfReporte
