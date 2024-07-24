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
  imagesDatoGeneral?: { [key: string]: string[] | {} }
  dataReporteGraficos: SubSector[]
  graficoImage?: { [key: string]: string[] | {} }
}

const PdfReporteFicha: React.FC<{ parametros: Parametros }> = ({
  parametros,
}) => {
  const {
    title,
    datosGenerales,
    imagesDatoGeneral,
    dataReporteGraficos,
    graficoImage,
  } = parametros

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

  const renderDataSections = (
    sectionData: SubSector[],
    isChartSection: boolean = false
  ) => {
    return sectionData.map((section, sectionIndex) => (
      <View key={sectionIndex} style={styles.section}>
        <Text
          style={[
            styles.contentTitle,
            { backgroundColor: title.colorSecundario },
          ]}
        >
          {section.nombre}
        </Text>
        {isChartSection ? (
          <View style={styles.imageContainer}>
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
        ) : (
          section.variables.map((variable, variableIndex) => (
            <View key={variableIndex}>
              <Text style={styles.variable}>{variable.nombre}</Text>
              {variable.nombre === 'Organo Legislativo' ? (
                <Image
                  src={imagesDatoGeneral?.['Organo Legislativo'] as string}
                  style={styles.imageDatoGeneral}
                />
              ) : variable.nombre === 'Participación según género' ? (
                <Image
                  src={
                    imagesDatoGeneral?.['Participación según género'] as string
                  }
                  style={styles.imageDatoGeneral}
                />
              ) : (
                <View style={styles.variableContainer}>
                  <View style={styles.table}>
                    {variable.items
                      .reduce((rows, item, index) => {
                        const rowIndex = Math.floor(index / 4)
                        if (!rows[rowIndex]) {
                          rows[rowIndex] = []
                        }
                        rows[rowIndex].push(item)
                        return rows
                      }, [] as any[][])
                      .map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.tableRow}>
                          {row.map((item, itemIndex) => (
                            <View key={itemIndex} style={styles.tableCell}>
                              <Text style={styles.itemName}>{item.nombre}</Text>
                              <View style={styles.separator} />
                              <Text style={styles.itemValue}>
                                {findDatoRegistroValor(
                                  variable.id,
                                  item.nombreCorto
                                )}
                              </Text>
                            </View>
                          ))}
                        </View>
                      ))}
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    ))
  }

  const renderHeader = () => (
    <View style={[styles.headerRow, { backgroundColor: title.colorPrimario }]}>
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
  )

  return (
    <Document>
      <Page
        size="LETTER"
        orientation="portrait"
        style={styles.page}
        wrap={true}
      >
        <View style={styles.content}>
          {renderHeader()}
          {renderDataSections(datosGenerales)}
        </View>
      </Page>
      <Page
        size="LETTER"
        orientation="portrait"
        style={styles.page}
        wrap={true}
      >
        <View style={styles.content}>
          {renderHeader()}
          {renderDataSections(dataReporteGraficos, true)}
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
    marginTop: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 5,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
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
    fontWeight: 'normal',
    textAlign: 'center',
    color: '#D5E2C8',
  },
  section: {
    marginBottom: 0,
  },
  variable: {
    fontWeight: 'bold',
    marginVertical: 2,
    padding: 2,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
    fontSize: 10,
    borderRadius: 4,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 2,
    color: '#fff',
    borderRadius: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginVertical: 2,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  imageItem: {
    marginBottom: 5,
    width: '100%',
  },
  image: {
    width: '100%',
    height: 140,
    marginVertical: 2,
    maxWidth: '100%',
    borderRadius: 4,
  },
  imageDatoGeneral: {
    width: '100%',
    height: 180,
    marginVertical: 2,
    maxWidth: '100%',
    borderRadius: 4,
  },
  variableContainer: {
    width: '100%',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 2,
    marginBottom: 5,
    overflow: 'hidden',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 1,
    marginBottom: 0,
  },
  tableCell: {
    flex: 1,
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  itemName: {
    fontSize: 9,
    textAlign: 'left',
    backgroundColor: '#dcdcdc',
    paddingVertical: 5,
  },
  itemValue: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#31595D',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 2,
  },
})

export default PdfReporteFicha
