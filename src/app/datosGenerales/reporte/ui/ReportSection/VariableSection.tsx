import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { Variable } from '@/app/datosGenerales/types/datosGeneralesType'
import ImageGrid from './ImageGrid'
import DataTable from './DataTable'

interface VariableSectionProps {
  variables: Variable[]
  findDatoRegistroValor: (
    variableId: string,
    nombreCorto: string
  ) => string | number | undefined

  imagesDatoGeneral?: { [key: string]: string[] | {} }
}

const VariableSection: React.FC<VariableSectionProps> = ({
  variables,
  findDatoRegistroValor,
  imagesDatoGeneral,
}) => (
  <>
    {variables.map((variable, variableIndex) => (
      <View key={variableIndex} style={styles.variableContainer}>
        <Text style={styles.variable}>{variable.nombre}</Text>
        {variable.nombre === 'ORGANO LEGISLATIVO' ? (
          <ImageGrid images={imagesDatoGeneral} />
        ) : (
          <DataTable
            variable={variable}
            findDatoRegistroValor={findDatoRegistroValor}
          />
        )}
      </View>
    ))}
  </>
)

const styles = StyleSheet.create({
  variableContainer: {
    marginVertical: 5,
  },
  variable: {
    fontSize: 10,
    fontWeight: 'bold',
  },
})

export default VariableSection
