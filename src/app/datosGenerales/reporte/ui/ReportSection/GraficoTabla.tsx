import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'
import {
  ChartData,
  SubSector,
} from '@/app/datosGenerales/types/datosGeneralesType'
import { transformDataForChart } from '@/app/datosGenerales/dataUtils/transformDataForChart'

interface TableProps {
  data: SubSector
  nombreVariable: string
}

const GraficoTabla: React.FC<TableProps> = ({ data, nombreVariable }) => {
  const [chartData, setChartData] = useState<{
    [key: string]: { name: string; data: ChartData[] }[]
  }>({})

  useEffect(() => {
    const newData: { [key: string]: { name: string; data: ChartData[] }[] } = {}
    newData[nombreVariable] = transformDataForChart(data, nombreVariable)
    setChartData(newData)
  }, [data, nombreVariable])

  const isGrouped =
    chartData[nombreVariable]?.length > 0 &&
    chartData[nombreVariable][0].data.length > 1

  const getGroupedRows = () => {
    const groupedData = chartData[nombreVariable] || []
    const rows = []

    for (let i = 0; i < groupedData.length; i += 4) {
      rows.push(groupedData.slice(i, i + 4))
    }

    return rows
  }

  const getUngroupedRows = () => {
    const ungroupedData = (chartData[nombreVariable] || []).flatMap(
      (row) => row.data
    )
    const rows = []

    for (let i = 0; i < ungroupedData.length; i += 4) {
      rows.push(ungroupedData.slice(i, i + 4))
    }

    return rows
  }

  return (
    <View style={styles.table}>
      {isGrouped
        ? getGroupedRows().map((rowGroup, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.itemName}>Nombre</Text>
                <View style={styles.separator} />
                <Text style={styles.itemValue}>{rowGroup[0]?.name || ''}</Text>
              </View>

              {rowGroup
                .flatMap((row) => row.data)
                .map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.tableCell}>
                    <Text style={styles.itemName}>{item.nombre}</Text>
                    <View style={styles.separator} />
                    <Text style={styles.itemValue}>{item.valor}</Text>
                  </View>
                ))}
            </View>
          ))
        : getUngroupedRows().map((rowGroup, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {rowGroup.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.tableCell}>
                  <Text style={styles.itemName}>{item.nombre}</Text>
                  <View style={styles.separator} />
                  <Text style={styles.itemValue}>{item.valor}</Text>
                </View>
              ))}
            </View>
          ))}
    </View>
  )
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 0,
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

export default GraficoTabla
