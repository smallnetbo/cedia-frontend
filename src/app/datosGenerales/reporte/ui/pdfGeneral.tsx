import React from 'react'
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { SubSector } from '../../types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'

const DocumentoPdfGeneral: React.FC<{
  nombre: string
  title: string
  date: string
  time: string
  imageSrc: string
  tipoGobierno: Gobiernos
  data: SubSector[]
  dataReporteGraficos: SubSector[]
  graficoImage?: string[]
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
}) => (
  <Document>
    <Page size="LEGAL" orientation="landscape" style={styles.page}>
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.contentTitle}>FICHAS MUNICIPALES</Text>
          <Text style={styles.contentTitle}>
            1103 Gobierno Autónomo Municipal de {nombre}
          </Text>
        </View>
        <View style={styles.infoContainer}>{renderDataSections(data)}</View>
        {dataReporteGraficos.map(renderGraphSection)}
      </View>
    </Page>
  </Document>
)

const renderDataSections = (data: SubSector[]) =>
  data.map((section, sectionIndex) => (
    <View style={styles.column} key={sectionIndex}>
      <Text style={styles.infoTitle}>{section.nombre}</Text>
      {section.variables.map(renderVariable)}
    </View>
  ))

const renderVariable = (variable: any, variableIndex: number) => (
  <View style={styles.innerColumns} key={variableIndex}>
    <View style={styles.innerColumn}>
      <Text style={styles.infoValue}>{variable.nombre}</Text>
      {variable.entidadVariables.map(renderItem)}
    </View>
  </View>
)

const renderItem = (item: any, itemIndex: number) => (
  <View style={styles.innerColumns} key={itemIndex}>
    <View style={styles.innerColumn}>
      <Text style={styles.infoValue}>{item.datoRegistro.recurso}</Text>
    </View>
    <View style={styles.innerColumn}>
      <Text style={styles.infoValue}>{item.datoRegistro.ejecucion}</Text>
    </View>
  </View>
)

const renderGraphSection = (section: SubSector, sectionIndex: number) => (
  <View style={styles.titleContainer} key={sectionIndex}>
    <Text style={styles.contentTitle}>{section.nombre}</Text>
    <View style={styles.infoContainer}>
      {section.variables.map(renderGraphVariable)}
    </View>
  </View>
)

const renderGraphVariable = (variable: any, variableIndex: number) => (
  <View
    style={[
      styles.column,
      { width: variable.entidadVariables.length === 1 ? '100%' : '50%' },
    ]}
    key={variableIndex}
  >
    <Text style={styles.infoValue}>{variable.nombre}</Text>
  </View>
)

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    position: 'relative',
  },
  content: {
    marginTop: 30,
  },
  titleContainer: {
    borderWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    paddingVertical: 10,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  column: {
    width: '50%',
    borderWidth: 1,
    borderColor: '#000',
  },
  innerColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
  },
  innerColumn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    padding: 5,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    textAlign: 'center',
    marginBottom: 0,
    paddingVertical: 5,
  },
  infoValue: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: 'auto',
    marginTop: 5,
  },
})

export default DocumentoPdfGeneral
