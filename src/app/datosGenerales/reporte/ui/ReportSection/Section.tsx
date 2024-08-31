import React from 'react'
import { View, StyleSheet } from '@react-pdf/renderer'
import SectionTitle from './SectionTitle'
import ChartSection from './ChartSection'
import VariableSection from './VariableSection'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'

interface SectionProps {
  section: SubSector
  titleColor: string
  isChartSection: boolean
  graficoImage?: { [key: string]: string[] | {} }
  imagesDatoGeneral?: { [key: string]: string[] | {} }
}

const Section: React.FC<SectionProps> = ({
  section,
  titleColor,
  isChartSection,
  graficoImage,
  imagesDatoGeneral,
}) => (
  <View style={styles.section}>
    <SectionTitle
      iconName={section.icono}
      title={section.nombre}
      titleColor={titleColor}
    />
    {isChartSection ? (
      <ChartSection subSector={section} graficoImage={graficoImage} />
    ) : (
      <VariableSection
        subSector={section}
        imagesDatoGeneral={imagesDatoGeneral}
      />
    )}
  </View>
)

const styles = StyleSheet.create({
  section: {
    marginBottom: 5,
  },
})

export default Section
