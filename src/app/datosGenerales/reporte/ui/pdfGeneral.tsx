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
  title: string
  date: string
  time: string
  imageSrc: string
  tipoGobierno: Gobiernos
  datosGenerales: SubSector[]
  dataReporteGraficos: SubSector[]
  graficoImage?: { [key: string]: string }
}> = ({
  nombre,
  title,
  date,
  time,
  imageSrc,
  datosGenerales,
  dataReporteGraficos,
  tipoGobierno,
  graficoImage,
}) => {
  const renderDataSections = () => {
    return datosGenerales.map((section, sectionIndex) => (
      <View key={sectionIndex} style={styles.section}>
        <Text style={styles.contentTitle}>{section.nombre}</Text>
        {section.variables.map((variable, variableIndex) => (
          <View key={variableIndex}>
            <Text style={styles.variable}>{variable.nombre}</Text>
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

  return (
    <Document>
      <Page size="LEGAL" orientation="landscape" style={styles.page}>
        <View style={styles.content}>
          <View style={styles.table}>
            <View style={styles.headerRow}>
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  subTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#d5e2c8',
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
    fontSize: 18,
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
})

export default DocumentoPdfGeneral
