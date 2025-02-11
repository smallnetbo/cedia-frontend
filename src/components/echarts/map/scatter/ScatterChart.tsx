/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { Typography } from '@mui/material'

interface ChartData {
  nombre: string
  valor: number
  color: string
}

interface Departamento {
  name: string
  data: ChartData[]
}

interface Subsector {
  subsector: string
  departamentos: Departamento[]
}

interface ChartScatterProps {
  data: Subsector[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const ScatterChart: React.FC<ChartScatterProps> = ({
  data,
  title,
  subTitle,
  onExport,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )
  const [isDataValid, setIsDataValid] = useState<boolean>(true)
  let colorToggle = true
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      if (!data || data.length === 0) {
        setIsDataValid(false)
        return
      }

      const scatterData: {
        value: [number, number]
        itemStyle: { color: string }
        entidad: string
        items?: [string, string]
      }[] = []

      const subsectorNames = data.map((subsector) => subsector.subsector)

      if (data.length === 1) {
        const subsector = data[0]
        subsector.departamentos.forEach((departamento) => {
          departamento.data.forEach((item) => {
            scatterData.push({
              value: [0, item.valor],
              itemStyle: { color: item.color },
              entidad: `${departamento.name} - ${item.nombre}`,
            })
          })
        })
      } else if (data.length >= 2) {
        const subsectorA = data[0]
        const subsectorB = data[1]

        subsectorA.departamentos.forEach((deptA) => {
          const matchingDept = subsectorB.departamentos.find(
            (deptB) => deptB.name === deptA.name
          )
          if (!matchingDept) return

          deptA.data.forEach((dataA) => {
            const matchingDataB = matchingDept.data.find(
              (d) => d.nombre != dataA.nombre
            )
            if (matchingDataB) {
              const valorA = Number(dataA.valor)
              const valorB = Number(matchingDataB.valor)

              scatterData.push({
                value: [
                  isNaN(valorA) ? 0 : parseFloat(valorA.toFixed(2)),
                  isNaN(valorB) ? 0 : parseFloat(valorB.toFixed(2)),
                ],
                itemStyle: {
                  color: colorToggle ? dataA.color : matchingDataB.color,
                },
                entidad: deptA.name,
                items: [dataA.nombre, matchingDataB.nombre],
              })

              colorToggle = !colorToggle
            }
          })
        })
      }

      if (scatterData.length === 0) {
        setIsDataValid(false)
        return
      }

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          top: '2%',
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        xAxis: {
          type: 'value',
          name:
            data.length === 1 ? 'Valor' : subsectorNames[0] || 'Subsector X',
          nameTextStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
        yAxis: {
          type: 'value',
          name: data.length === 1 ? '' : subsectorNames[1] || 'Subsector Y',
          nameTextStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          textStyle: { color: '#fff' },
          borderRadius: 6,
          padding: 10,
          formatter: (params: any) => {
            const data = params.data
            if (data.items) {
              return `
              <b style="font-size:14px">${data.entidad}</b><br/>
              <span style="color:${data.itemStyle.color}">&#x25CF;</span> <b>${data.items[0]}</b>: ${data.value[0]}<br/>
              <span style="color:${data.itemStyle.color}">&#x25CF;</span> <b>${data.items[1]}</b>: ${data.value[1]}`
            } else {
              return `
              <b style="font-size:14px">${data.entidad}</b><br/>
              <span style="color:${data.itemStyle.color}">&#x25CF;</span> <b>Valor</b>: ${data.value[1]}<br/>
              
              `
            }
          },
        },
        series: [
          {
            type: 'scatter',
            symbolSize: 15,
            data: scatterData,
          },
        ],
        backgroundColor: 'white',
      }

      chart.setOption(option)

      if (onExport) {
        setTimeout(() => {
          const image = chart.getDataURL({
            type: 'png',
            pixelRatio: 2,
          })
          onExport(image || '')
        }, 1100)
      }
    }

    setChartInstance(chart)
    updateChart()

    return () => {
      if (chart) {
        chart.dispose()
      }
    }
  }, [data, title, subTitle])

  useLayoutEffect(() => {
    function handleResize() {
      if (chartInstance) {
        chartInstance.resize()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [chartInstance])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {isDataValid ? (
        <div
          ref={chartContainerRef}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Typography
          variant="h6"
          color="textSecondary"
          style={{
            textAlign: 'center',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          No hay datos válidos para mostrar el gráfico.
        </Typography>
      )}
    </div>
  )
}

export default ScatterChart
