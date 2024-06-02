import React from 'react'
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from '@react-pdf/renderer'
import { SubSector } from '../../types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'
import { Constantes } from '@/config/Constantes'

const DocumentoPdfGeneral: React.FC<{
  nombre: string
  title: string
  date: string
  time: string
  imageSrc: string
  tipoGobierno: Gobiernos
  data: SubSector[]
  dataReporteGraficos: SubSector[]
  graficoImage?: { [key: string]: string }
}> = ({
  nombre,
  title,
  date,
  time,
  imageSrc,
  data,
  dataReporteGraficos,
  tipoGobierno,
  graficoImage,
}) => {
  const renderDataSections = () => {
    const sectionRows = []

    for (let i = 0; i < data.length; i += 2) {
      sectionRows.push(
        <View style={styles.row} key={`section-row-${i}`}>
          <View style={[styles.column, { flex: 1 }]}>
            {data[i] && renderSection(data[i], i)}
          </View>
          <View style={[styles.column, { flex: 1 }]}>
            {data[i + 1] && renderSection(data[i + 1], i + 1)}
          </View>
        </View>
      )
    }

    return sectionRows
  }

  const renderSection = (section: SubSector, sectionIndex: number) => (
    <View key={sectionIndex}>
      <Text style={styles.contentTitle}>{section.nombre}</Text>
      {section.variables.map((variable, variableIndex) => (
        <View key={variableIndex}>
          <Text style={styles.variable}>{variable.nombre}</Text>
          {variable.entidadVariables.map((item, itemIndex) => (
            <View key={itemIndex}>
              {Object.entries(item.datoRegistro).map(
                ([key, value], entryIndex) => (
                  <View style={styles.row} key={entryIndex}>
                    <View style={[styles.cell, { flex: 2 }]}>
                      <Text>{key}</Text>
                    </View>
                    <View style={[styles.cell, { flex: 2 }]}>
                      <Text>{value}</Text>
                    </View>
                  </View>
                )
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  )

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

            {/* datos graficos*/}
            {dataReporteGraficos.map((section, sectionIndex) => (
              <View style={styles.contentGrafico} key={sectionIndex}>
                <Text style={styles.contentTitle}>{section.nombre}</Text>
                <View style={styles.infoContainer}>
                  {section.variables.map((variable, variableIndex) => (
                    <View
                      style={[
                        styles.column,
                        {
                          width:
                            variable.graficos.ancho === '50' ? '50%' : '100%',
                        },
                      ]}
                      key={variableIndex}
                    >
                      <Text style={styles.infoValue}>{variable.nombre}</Text>
                      <View style={styles.contenedorGrafico}>
                        {graficoImage && graficoImage[variable.nombre] && (
                          <Image
                            style={styles.imagenGrafico}
                            src={graficoImage[variable.nombre]}
                          />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
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
  column: {
    flex: 1,
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
  imagenGrafico: {
    flex: 1,
    height: 200,
    margin: 'auto',
    borderWidth: 1,
    borderColor: '#000',
  },
  contenedorGrafico: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#000',
  },
  innerColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 1,
    borderWidth: 1,
    borderColor: '#000',
  },
  innerColumn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    padding: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    textAlign: 'center',
    marginBottom: 0,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#000',
  },
  infoValue: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#000',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginBottom: 6,
  },
  contentGrafico: {
    marginBottom: 1,
    borderWidth: 1,
    borderColor: '#000',
  },
})

export default DocumentoPdfGeneral
