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

import DynamicMaterialIcon from '@/components/IconRenderer/DynamicMaterialIcon'

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
    imagesDatoGeneral = {},
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
        <View
          style={[
            styles.titleContainer,
            { backgroundColor: title.colorSecundario },
          ]}
        >
          <View style={styles.iconWrapper}>
            <DynamicMaterialIcon
              iconName="TravelExplore"
              style={{ width: 22, height: 22, color: '#D5E2C8' }}
            />
          </View>
          <Text style={[styles.contentTitle]}>{section.nombre}</Text>
        </View>
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
            <View key={variableIndex} style={styles.variableContainer}>
              <Text style={styles.variable}>{variable.nombre}</Text>
              {variable.nombre === 'Organo Legislativo' ? (
                <View style={styles.imageItem}>
                  {imagesDatoGeneral['Organo Legislativo'] && (
                    <Image
                      src={imagesDatoGeneral?.['Organo Legislativo'] as string}
                      style={styles.imageDatoGeneral}
                    />
                  )}
                </View>
              ) : variable.nombre === 'Participación según género' ? (
                <View style={styles.imageItem}>
                  {imagesDatoGeneral['Participación según género'] && (
                    <Image
                      src={
                        imagesDatoGeneral?.[
                          'Participación según género'
                        ] as string
                      }
                      style={styles.imageDatoGeneral}
                    />
                  )}
                </View>
              ) : (
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
          {renderDataSections(dataReporteGraficos, true)}
        </View>
      </Page>
    </Document>
  )
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 15,
    position: 'relative',
    fontFamily: 'Helvetica',
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
    marginBottom: 0,
    height: 80,
  },
  logoContainer: {
    width: 100,
    height: 100,
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
    paddingLeft: 10,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#D5E2C8',
  },
  section: {
    marginBottom: 5,
  },
  variable: {
    fontWeight: 'bold',
    padding: 5,
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    fontSize: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    padding: 5,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    marginVertical: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 0,
  },
  imageItem: {
    marginBottom: 0,
    width: '100%',
    padding: 0,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: 135,
    marginVertical: 2,
    maxWidth: '100%',
    borderRadius: 4,
  },
  imageDatoGeneral: {
    width: '100%',
    height: 190,
  },
  variableContainer: {
    marginBottom: 0,
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
    textAlign: 'center',
    fontWeight: 'extrabold',
    backgroundColor: '#dcdcdc',
    paddingVertical: 5,
  },
  itemValue: {
    fontSize: 9,
    fontWeight: 'extrabold',
    textAlign: 'center',
    color: '#31595D',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 2,
  },
  iconWrapper: {
    marginRight: 8,
  },
})

export default PdfReporteFicha
