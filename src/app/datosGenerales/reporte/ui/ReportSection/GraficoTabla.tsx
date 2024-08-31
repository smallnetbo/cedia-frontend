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

  const columnNames = chartData[nombreVariable]
    ? Array.from(
        new Set(
          chartData[nombreVariable].flatMap((serie) =>
            serie.data.map((item) => item.nombre)
          )
        )
      )
    : []

  const isGrouped =
    chartData[nombreVariable]?.length > 0 &&
    chartData[nombreVariable][0].data.length > 1

  return (
    <View style={styles.tableContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{nombreVariable}</Text>
      </View>
      {/* Cabecera de la tabla */}
      <View style={styles.tableRow}>
        {isGrouped ? (
          <>
            <Text style={[styles.tableCell, styles.tableHeader]}>Nombre</Text>
            {columnNames.map((name, index) => (
              <Text key={index} style={[styles.tableCell, styles.tableHeader]}>
                {name}
              </Text>
            ))}
          </>
        ) : (
          columnNames.map((name, index) => (
            <Text key={index} style={[styles.tableCell, styles.tableHeader]}>
              {name}
            </Text>
          ))
        )}
      </View>
      {/* Filas de datos */}
      {isGrouped ? (
        chartData[nombreVariable]?.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.name}</Text>
            {columnNames.map((colName, colIndex) => {
              const item = row.data.find((d) => d.nombre === colName)
              return (
                <Text key={colIndex} style={styles.tableCell}>
                  {item ? item.valor : ''}
                </Text>
              )
            })}
          </View>
        ))
      ) : (
        <View style={styles.tableRow}>
          {columnNames.map((colName, colIndex) => {
            const item = chartData[nombreVariable]
              ?.flatMap((row) => row.data)
              .find((d) => d.nombre === colName)
            return (
              <Text key={colIndex} style={styles.tableCell}>
                {item ? item.valor : ''}
              </Text>
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  tableContainer: {
    margin: 10,
    border: '1px solid #ddd',
  },
  headerContainer: {
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 8,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
})

export default GraficoTabla
