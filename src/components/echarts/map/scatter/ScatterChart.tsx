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

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      if (!chart) return

      const series = data.map(({ sector, variable, datos }) => ({
        name: `${sector} - ${variable}`,
        type: 'scatter',
        symbolSize: 10,
        data: datos.map((dato) => [dato.valor, dato.nombre]),
        label: {
          show: true,
          formatter: '{b}: {c}',
          position: 'right',
        },
        emphasis: {
          focus: 'series',
          label: {
            show: true,
            formatter: '{b}: {c}',
            position: 'right',
          },
        },
      }))

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
          },
        },
        xAxis: {
          type: 'value',
          name: 'Valor',
        },
        yAxis: {
          type: 'category',
          name: 'Categoría',
        },
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const seriesName = params
            const data = params
            const valor = data
            const categoria = data
            return `${seriesName}<br/>Categoría: ${categoria}<br/>Valor: ${valor}`
          },
        },
        series: series as unknown as echarts.SeriesOption[],
        legend: {
          data: data.map(({ sector, variable }) => `${sector} - ${variable}`),
          orient: 'vertical',
          left: 10,
          top: 20,
          itemGap: 20,
          textStyle: {
            color: 'black',
          },
        },
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
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default ScatterChart
