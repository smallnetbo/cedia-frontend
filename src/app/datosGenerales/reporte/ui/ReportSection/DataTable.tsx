import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { Variable } from '@/app/datosGenerales/types/datosGeneralesType'

interface DataTableProps {
  variable: Variable
  findDatoRegistroValor: (
    variableId: string,
    nombreCorto: string
  ) => string | number | undefined
}

const DataTable: React.FC<DataTableProps> = ({
  variable,
  findDatoRegistroValor,
}) => (
  <View style={styles.table}>
    {variable.items
      .reduce((rows, item, index) => {
        const rowIndex = Math.floor(index / 4)
        if (!rows[rowIndex]) rows[rowIndex] = []
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
                {findDatoRegistroValor(variable.id, item.nombreCorto)}
              </Text>
            </View>
          ))}
        </View>
      ))}
  </View>
)

const styles = StyleSheet.create({
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
})

export default DataTable
