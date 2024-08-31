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
  findDatoRegistroValor: (
    variableId: string,
    nombreCorto: string
  ) => string | number | undefined
}

const Section: React.FC<SectionProps> = ({
  section,
  titleColor,
  isChartSection,
  graficoImage,
  imagesDatoGeneral,
  findDatoRegistroValor,
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
        variables={section.variables}
        findDatoRegistroValor={findDatoRegistroValor}
        imagesDatoGeneral={imagesDatoGeneral}
      />
    )}
  </View>
)

const styles = StyleSheet.create({
  section: {
    marginBottom: 10,
  },
})

export default Section
