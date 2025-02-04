import React, { useEffect } from 'react'
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'

interface ChartSectionProps {
  graficoImage?: { [key: string]: string[] | {} }
  tituloReporte?: string
}

const ChartSectionCruceVariable: React.FC<ChartSectionProps> = ({
  graficoImage,
  tituloReporte,
}) => {
  useEffect(() => {}, [graficoImage])
  const formattedTitle =
    tituloReporte
      ?.split('vs')
      .map((part, index) => {
        const parts = part
          .split(' / ')
          .map((subPart, idx) => {
            if (idx === 0) return `Subsector: ${subPart}`
            if (idx === 1) return `Variable: ${subPart}`
            return `Ítem: ${subPart}`
          })
          .join('\n')

        return index === 0 ? parts : `vs\n${parts}`
      })
      .join('\n') || 'Reporte Comparativo'

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.rightAligned}>
          <Text style={styles.subsector}>{formattedTitle.split('\n')[0]}</Text>
          <Text style={styles.variable}>{formattedTitle.split('\n')[1]}</Text>
          <Text style={styles.item}>{formattedTitle.split('\n')[2]}</Text>
        </View>

        <View style={styles.centerAligned}>
          <Text style={styles.variable}>{formattedTitle.split('\n')[3]}</Text>
        </View>

        <View style={styles.leftAligned}>
          <Text style={styles.subsector}>{formattedTitle.split('\n')[4]}</Text>
          <Text style={styles.variable}>{formattedTitle.split('\n')[5]}</Text>
          <Text style={styles.item}>{formattedTitle.split('\n')[6]}</Text>
        </View>
      </View>
      <View style={styles.imageContainer}>
        {graficoImage &&
          Object.entries(graficoImage)
            .slice(0, 1)
            .map(([key, value]) => {
              if (typeof value === 'string' && value.trim() !== '') {
                const isValidImage =
                  value.startsWith('data:image/') || value.startsWith('http')
                return (
                  isValidImage && (
                    <Image key={key} src={value} style={styles.image} />
                  )
                )
              }
              return null
            })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 0,
    marginBottom: 0,
    padding: 10,
    width: '100%',
  },
  titleContainer: {
    marginBottom: 10,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  rightAligned: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '30%',
    marginBottom: 5,
  },
  centerAligned: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '40%',
    marginBottom: 5,
  },
  leftAligned: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '30%',
  },
  subsector: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 1,
  },
  variable: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 1,
  },
  item: {
    fontSize: 8,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#BDC3C7',
    paddingTop: 10,
  },
  image: {
    width: '90%',
    height: 'auto',
    borderRadius: 6,
    border: '1px solid #E0E0E0',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
})

export default ChartSectionCruceVariable
