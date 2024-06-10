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
import { Gobiernos } from '@/types/map/entidad.interface'
import { SubSector } from '../../types/datosGeneralesType'

const DocumentoPdfGeneral: React.FC<{
  nombre: string
  title: { titulo: string; colorPrimario: string; colorSecundario: string }
  date: string
  time: string
  tipoGobierno: Gobiernos
  datosGenerales: SubSector[]
  dataReporteGraficos: SubSector[]
  graficoImage?: { [key: string]: string | null }
}> = ({
  nombre,
  title,
  date,
  time,
  datosGenerales,
  dataReporteGraficos,
  tipoGobierno,
  graficoImage,
}) => {
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
                  <Text>{item.datoRegistro.valor}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    ))
  }

  const renderChartImages = () => {
    const imageCount = dataReporteGraficos.reduce(
      (acc, section) => acc + section.variables.length,
      0
    )
    let itemWidth = '100%'
    if (imageCount > 1) {
      itemWidth = imageCount === 2 ? '50%' : '48%'
    }

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
        <View
          style={[
            styles.imageContainer,
            { justifyContent: imageCount > 1 ? 'space-between' : 'center' },
          ]}
        >
          {section.variables.map((variable, variableIndex) => (
            <View
              key={variableIndex}
              style={[styles.imageItem, { width: itemWidth }]}
            >
              <Text style={styles.variable}>{variable.nombre}</Text>
              {variable.graficos && (
                <Image
                  key={`${sectionIndex}-${variableIndex}`}
                  src={graficoImage?.[variable.nombre] || ''}
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
                <Text style={styles.mainTitle}>FICHAS MUNICIPALES</Text>
                <View style={styles.divider} />
                <Text style={styles.subTitle}>
                  1103 Gobierno Autónomo Municipal de {nombre}
                </Text>
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
    width: '48%',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 'auto',
    marginVertical: 5,
    maxWidth: '100%',
  },
})

export default DocumentoPdfGeneral
