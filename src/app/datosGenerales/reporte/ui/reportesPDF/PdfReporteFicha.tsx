import React from 'react'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from '@react-pdf/renderer'
import { Constantes } from '@/config/Constantes'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'

interface Title {
  titulo: string
  subTitulo: string
  colorPrimario: string
  colorSecundario: string
}

interface Parametros {
  title: Title
  datosGenerales: SubSector[]
  dataReporteGraficos: SubSector[]
  graficoImage?: { [key: string]: string[] | {} }
}

const PdfReporteFicha: React.FC<{ parametros: Parametros }> = ({
  parametros,
}) => {
  const { title, datosGenerales, dataReporteGraficos, graficoImage } =
    parametros

  const findDatoRegistroValor = (
    variableId: string,
    nombreCorto: string
  ): string | number | undefined => {
    const subSector = datosGenerales.find((section) =>
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

  const renderDataSections = () => {
    return datosGenerales.map((section, sectionIndex) => (
      <View key={sectionIndex} style={styles.section}>
        <Text
          style={[
            styles.contentTitle,
            { backgroundColor: title.colorSecundario },
          ]}
        >
          {section.nombre}
        </Text>
        {section.variables.map((variable, variableIndex) => (
          <View key={variableIndex}>
            <Text style={[styles.variable]}>{variable.nombre}</Text>
            {variable.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.row}>
                <View style={[styles.cell, { flex: 2 }]}>
                  <Text>{item.nombre}</Text>
                </View>
                <View style={[styles.cell, { flex: 2 }]}>
                  <Text>
                    {findDatoRegistroValor(variable.id, item.nombreCorto)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    ))
  }

  const renderChartImages = () => {
    return dataReporteGraficos.map((section, sectionIndex) => (
      <View key={sectionIndex} style={styles.section}>
        <Text
          style={[
            styles.contentTitle,
            { backgroundColor: title.colorSecundario },
          ]}
        >
          {section.nombre}
        </Text>
        <View style={[styles.imageContainer]}>
          {section.variables.map((variable, variableIndex) => (
            <View
              key={variableIndex}
              style={[
                styles.imageItem,
                { width: variable.graficos.ancho + '%' },
              ]}
            >
              <Text style={styles.variable}>{variable.nombre}</Text>
              {graficoImage &&
                graficoImage[variable.nombre] &&
                typeof graficoImage[variable.nombre] === 'object' &&
                Object.entries(graficoImage[variable.nombre]).map(
                  ([key, value]) =>
                    value && (
                      <Image key={key} src={value} style={styles.image} />
                    )
                )}
              {variable.graficos && graficoImage?.[variable.nombre] && (
                <Image
                  key={`${sectionIndex}-${variableIndex}`}
                  src={graficoImage?.[variable.nombre] as string}
                  style={styles.image}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    ))
  }

  return (
    <Document>
      <Page
        size="LEGAL"
        orientation="landscape"
        style={styles.page}
        wrap={true}
      >
        <View style={styles.content}>
          <View style={styles.table}>
            <View
              style={[
                styles.headerRow,
                { backgroundColor: title.colorPrimario },
              ]}
            >
              <View style={styles.logoContainer}>
                <Image
                  style={styles.logo}
                  src={`${Constantes.sitePath}/logo_blanco.png`}
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.mainTitle}>{title.titulo}</Text>
                <View style={styles.divider} />
                <Text style={styles.subTitle}>{title.subTitulo}</Text>
              </View>
            </View>
            {renderDataSections()}
            {renderChartImages()}
          </View>
        </View>
      </Page>
    </Document>
  )
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 10,
    position: 'relative',
  },
  content: {
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingBottom: 10,
    backgroundColor: '#31595d',
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginLeft: '70px',
  },
  headerText: {
    flex: 1,
    padding: 10,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 16,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#000',
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 6,
    textAlign: 'center',
  },
  variable: {
    fontWeight: 'bold',
    marginVertical: 1,
    padding: 3,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#EEEEEE',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginBottom: 6,
  },

  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageItem: {
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '300px',
    marginVertical: 5,
    maxWidth: '100%',
  },
})

export default PdfReporteFicha
