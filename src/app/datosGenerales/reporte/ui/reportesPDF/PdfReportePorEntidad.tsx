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
  datosGenerales: { [entidad: string]: SubSector[] }
}

const PdfReportePorEntidad: React.FC<{ parametros: Parametros }> = ({
  parametros,
}) => {
  const { title, datosGenerales } = parametros

  const findDatoRegistroValor = (
    entidad: string,
    variableId: string,
    nombreCorto: string
  ): string | number | undefined => {
    const subSectors = datosGenerales[entidad]
    if (!subSectors) return undefined

    const subSector = subSectors.find((section) =>
      section.variables.some((variable) => variable.id === variableId)
    )
    if (subSector) {
      const variable = subSector.variables.find(
        (variable) => variable.id === variableId
      )
      if (variable) {
        const entidadVariable = variable.entidadVariables.find(
          (entidadVar) =>
            entidadVar.datoRegistro &&
            entidadVar.datoRegistro[nombreCorto] !== undefined
        )
        if (entidadVariable && entidadVariable.datoRegistro) {
          return entidadVariable.datoRegistro[nombreCorto]
        }
      }
    }
    return undefined
  }

  const renderDataSections = (subSectors: SubSector[], entidad: string) => {
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
            {variable.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.row}>
                <View style={[styles.cell, { flex: 2 }]}>
                  <Text>{item.nombre}</Text>
                </View>
                <View style={[styles.cell, { flex: 2 }]}>
                  <Text>
                    {findDatoRegistroValor(
                      entidad,
                      variable.id,
                      item.nombreCorto
                    )}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    ))
  }

  const renderPages = () => {
    return Object.entries(datosGenerales).map(
      ([entidad, subSectors], index) => (
        <Page
          key={index}
          size="LETTER"
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
                    Gobierno Autónomo {title.subTitulo} de {entidad}
                  </Text>
                </View>
              </View>
              {renderDataSections(subSectors, entidad)}
            </View>
          </View>
        </Page>
      )
    )
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
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#D5E2C8',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
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
    backgroundColor: '#D9D9D9',
    fontSize: 12,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    color: '#fff',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginBottom: 6,
  },
})

export default PdfReportePorEntidad
