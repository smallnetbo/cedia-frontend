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
import { SubSector } from '../types/reporteType'

const PdfReporteGeneral: React.FC<{
  nombre: string
  title: { titulo: string; colorPrimario: string; colorSecundario: string }
  date: string
  time: string
  data: { [entidad: string]: SubSector[] }
}> = ({ nombre, title, date, time, data }) => {
  const renderDataSections = (subSectors: SubSector[]) => {
    return subSectors.map((section, sectionIndex) => (
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
            <Text style={styles.variable}>{variable.nombre}</Text>
            {variable.entidadVariables.map((item, itemIndex) => {
              const entries = Object.entries(item.datoRegistro)
              const rows = []

              for (let i = 0; i < entries.length; i += 2) {
                rows.push(
                  <View style={styles.row} key={i}>
                    <View style={[styles.cell, { flex: 2 }]}>
                      <Text>{entries[i][0]}</Text>
                    </View>
                    <View style={[styles.cell, { flex: 2 }]}>
                      <Text>{entries[i][1]}</Text>
                    </View>
                    {entries[i + 1] && (
                      <>
                        <View style={[styles.cell, { flex: 2 }]}>
                          <Text>{entries[i + 1][0]}</Text>
                        </View>
                        <View style={[styles.cell, { flex: 2 }]}>
                          <Text>{entries[i + 1][1]}</Text>
                        </View>
                      </>
                    )}
                  </View>
                )
              }

              return rows
            })}
          </View>
        ))}
      </View>
    ))
  }

  const renderPages = () => {
    return Object.entries(data).map(([entidad, subSectors], index) => (
      <Page
        key={index}
        size="LEGAL"
        orientation="landscape"
        style={styles.page}
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
                  1103 Gobierno Autónomo Municipal de {entidad}
                </Text>
              </View>
            </View>
            {renderDataSections(subSectors)}
          </View>
        </View>
      </Page>
    ))
  }

  return <Document>{renderPages()}</Document>
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
})

export default PdfReporteGeneral
