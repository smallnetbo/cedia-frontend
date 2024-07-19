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
        ) : (
          section.variables.map((variable, variableIndex) => (
            <View key={variableIndex}>
              <Text style={[styles.variable]}>{variable.nombre}</Text>
              {/* Validación para mostrar imagen en lugar de valores */}
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
                  {variable.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.variableItem}>
                      <Text style={styles.itemName}>{item.nombre}</Text>
                      <Text style={styles.itemValue}>
                        {findDatoRegistroValor(variable.id, item.nombreCorto)}
                      </Text>
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
          <View style={styles.table}>
            {renderHeader()}
            {renderDataSections(datosGenerales)}
          </View>
        </View>
      </Page>
      <Page
        size="LETTER"
        orientation="portrait"
        style={styles.page}
        wrap={true}
      >
        <View style={styles.content}>
          <View style={styles.table}>
            {renderHeader()}
            {renderDataSections(dataReporteGraficos, true)}
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
  valor: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#006666',
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
    height: '145px',
    marginVertical: 5,
    maxWidth: '100%',
  },
  imageDatoGeneral: {
    width: '100%',
    height: '190px',
    marginVertical: 5,
    maxWidth: '100%',
  },
  variableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  variableItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 10,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  itemValue: {
    fontSize: 12,
    textAlign: 'right',
    color: '#006666',
    fontWeight: 'bold',
  },
})

export default PdfReporteFicha
