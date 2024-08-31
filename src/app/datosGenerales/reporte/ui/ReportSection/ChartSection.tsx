import React from 'react'
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'
import GraficoTabla from './GraficoTabla'

interface ChartSectionProps {
  subSector: SubSector
  graficoImage?: { [key: string]: string[] | {} }
}

const ChartSection: React.FC<ChartSectionProps> = ({
  subSector,
  graficoImage,
}) => (
  <View style={styles.imageContainer}>
    {subSector.variables
      .filter(
        (variable, index, self) =>
          index === self.findIndex((v) => v.nombre === variable.nombre)
      )
      .map((variable, variableIndex) => (
        <View
          key={variableIndex}
          style={[styles.imageItem, { width: variable.graficos.ancho + '%' }]}
        >
          <Text style={styles.variable}>{variable.nombre}</Text>

          {variable.graficoPdf.tipoGrafico.descripcion === 'Texto' ? (
            <GraficoTabla data={subSector} nombreVariable={variable.nombre} />
          ) : (
            graficoImage &&
            graficoImage[variable.nombre] &&
            typeof graficoImage[variable.nombre] === 'object' &&
            Object.entries(graficoImage[variable.nombre]).map(
              ([key, value]) => (
                <Image key={key} src={value} style={styles.image} />
              )
            )
          )}

          {variable.graficos && graficoImage?.[variable.nombre] && (
            <Image
              key={`${variableIndex}`}
              src={graficoImage?.[variable.nombre] as string}
              style={styles.image}
            />
          )}
        </View>
      ))}
  </View>
)

const styles = StyleSheet.create({
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 0,
  },
  imageItem: {
    marginBottom: 0,

    padding: 0,
    borderWidth: 1,
    borderColor: '#ddd',
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
  image: {
    height: 200,
    marginVertical: 2,
    maxWidth: '100%',
    borderRadius: 4,
  },
})

export default ChartSection
