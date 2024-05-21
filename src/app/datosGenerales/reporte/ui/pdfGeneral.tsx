/* graficos reporte no borrar */

import React from 'react'
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { SubSector } from '../../types/datosGeneralesType'
import { Gobiernos } from '@/types/map/entidad.interface'

// Componente principal del documento PDF
const DocumentoPdfGeneral: React.FC<{
  title: string
  date: string
  time: string
  imageSrc: string
  tipoGobierno: Gobiernos
  data: SubSector[]
}> = ({ title, date, time, imageSrc, data, tipoGobierno }) => (
  <Document>
    <Page size="LEGAL" orientation="landscape" style={styles.page}>
      {/* Contenido */}
      <View style={styles.content}>
        {/* Título principal */}
        <View style={styles.titleContainer}>
          <Text style={styles.contentTitle}>FICHAS MUNICIPALES</Text>
          <Text style={styles.contentTitle}>
            1103 Gobierno Autónomo Municipal de Poroma
          </Text>
        </View>

        {/* Información de Gobierno */}
        <View style={styles.infoContainer}>
          {data.map((section, sectionIndex) => (
            <View style={styles.column} key={sectionIndex}>
              <Text style={styles.infoTitle}>{section.nombre}</Text>
              {section.variables.map((variable, variableIndex) => (
                <View style={styles.innerColumns} key={variableIndex}>
                  <View style={styles.innerColumn}>
                    <Text style={styles.infoValue}>{variable.nombre}</Text>
                    {variable.entidadVariables.map((item, itemIndex) => (
                      <View style={styles.innerColumns} key={itemIndex}>
                        <View style={styles.innerColumn}>
                          <Text style={styles.infoValue}>
                            {item.datoRegistro.recurso}
                          </Text>
                        </View>
                        <View style={styles.innerColumn}>
                          <Text style={styles.infoValue}>
                            {item.datoRegistro.ejecucion}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/*Seccion graficos */}
        <View style={styles.titleContainer}>
          <Text style={styles.contentTitle}>FICHAS MUNICIPALES</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.column}>
            <Text style={styles.infoTitle}>DATOS GENERALES</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.infoTitle}>COMPOSICIÓN DE GOBIERNO</Text>
          </View>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.column}>
            <Text style={styles.infoTitle}>graficos</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.infoTitle}>graficos</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
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
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#000',
  },
  column: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  innerColumns: {
    flexDirection: 'row',
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
})

export default DocumentoPdfGeneral
