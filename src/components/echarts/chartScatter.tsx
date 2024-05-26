import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'

const ChartScatter = ({ data, title, subTitle }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current || !data) return

    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      if (!chart) return

      // Encontrar el año mínimo y máximo entre todos los datos
      let minYear = Infinity
      let maxYear = -Infinity

      data.forEach(({ datos }) => {
        datos.forEach(({ año }) => {
          const parsedYear = parseInt(año)
          if (parsedYear < minYear) {
            minYear = parsedYear
          }
          if (parsedYear > maxYear) {
            maxYear = parsedYear
          }
        })
      })

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
        },
        xAxis: {
          type: 'category',
          data: Array.from(
            { length: maxYear - minYear + 1 },
            (_, i) => minYear + i
          ),
          name: 'Año',
        },
        yAxis: {
          name: 'Ejecución',
        },
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const { seriesName, data } = params
            const [año, ejecucion] = data
            return `${seriesName}<br/>Año: ${año}<br/>Ejecución: ${ejecucion}`
          },
        },
        series: data.map(({ sector, variable, datos }) => ({
          name: `${sector} - ${variable}`,
          symbolSize: (data) => Math.sqrt(data[1]) * 5,
          data: datos.map(({ año, ejecucion }) => [año, ejecucion]),
          type: 'scatter',
          itemStyle: {
            color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
          },
        })),
        backgroundColor: 'white',
      }

      chart.setOption(option)
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
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default ChartScatter
