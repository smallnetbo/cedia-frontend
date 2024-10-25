import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'

import ImageGrid from './ImageGrid'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'
import GraficoTabla from './GraficoTabla'

const legislativoNombres = [
  'órgano legislativo',
  'Órgano Legislativo',
  'organo legislativo',
  'ORGANO LEGISLATIVO',
]

interface VariableSectionProps {
  subSector: SubSector
  imagesDatoGeneral?: { [key: string]: string[] | {} }
}

const VariableSection: React.FC<VariableSectionProps> = ({
  subSector,
  imagesDatoGeneral,
}) => (
  <>
    {subSector.variables.map((variable, variableIndex) => (
      <View key={variableIndex} style={styles.variableContainer} wrap={false}>
        <Text style={styles.variable}>{variable.nombre}</Text>
        {legislativoNombres.includes(variable.nombre) ? (
          <ImageGrid images={imagesDatoGeneral} />
        ) : (
          <GraficoTabla data={subSector} nombreVariable={variable.id} />
        )}
      </View>
    ))}
  </>
)

const styles = StyleSheet.create({
  variableContainer: {
    marginBottom: 0,
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
})

export default VariableSection
