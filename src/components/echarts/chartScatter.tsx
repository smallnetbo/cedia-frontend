import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface ChartScatterProps {
  data: {
    sector: string
    variable: string
    datos: ChartData[]
  }[]
  title: string
  subTitle: string
}

const ChartScatter: React.FC<ChartScatterProps> = ({
  data,
  title,
  subTitle,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)
    setChartInstance(chart)

    return () => {
      chart.dispose()
    }
  }, [])

  useEffect(() => {
    if (!chartInstance) return

    // Definir el tamaño máximo y mínimo para los puntos
    const maxSymbolSize = 40
    const minSymbolSize = 10

    // Encontrar el valor máximo para escalar los tamaños de los símbolos
    const maxValue = Math.max(
      ...data.flatMap(({ datos }) => datos.map((d) => d.valor))
    )

    const series = data.flatMap(({ sector, variable, datos }) =>
      datos.map((dato) => ({
        name: `${sector} - ${variable} - ${dato.nombre}`,
        type: 'scatter',
        data: [[dato.nombre, dato.valor]],
        itemStyle: {
          color: dato.color,
        },
        symbolSize:
          (dato.valor / maxValue) * (maxSymbolSize - minSymbolSize) +
          minSymbolSize,
        label: {
          show: true,
          formatter: `{b}: ${dato.valor}`,
          position: 'top',
        },
        emphasis: {
          focus: 'series',
          label: {
            show: true,
            formatter: `{b}: ${dato.valor}`,
            position: 'top',
          },
        },
      }))
    )

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        subtext: subTitle,
        left: 'center',
      },
      xAxis: {
        type: 'category',
        name: 'Categoría',
      },
      yAxis: {
        type: 'value',
        name: 'Valor',
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const { seriesName, data } = params
          const [categoria, valor] = data
          return `${seriesName}<br/>Categoría: ${categoria}<br/>Valor: ${valor}`
        },
      },
      series: series,
      backgroundColor: 'white',
    }

    chartInstance.setOption(option)
  }, [chartInstance, data, title, subTitle])

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
