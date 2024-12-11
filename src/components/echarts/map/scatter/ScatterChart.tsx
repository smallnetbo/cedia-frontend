import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface ChartScatterProps {
  data: {
    name: string
    data: ChartData[]
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

      const series = data.map(({ name, data }) => ({
        name: name,
        type: 'scatter',
        symbolSize: 15,
        data: data.map((dato) => ({
          value: [dato.valor, dato.nombre],
          itemStyle: { color: dato.color },
        })),
        label: {
          show: true,
          formatter: (params: any) => {
            return params.value[0].toFixed(2)
          },
          position: 'right',
        },
        emphasis: {
          focus: 'series',
          label: {
            show: true,
            formatter: '{c}',
            position: 'right',
          },
        },
      }))

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          top: '1%',
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
          data: Array.from(
            new Set(data.flatMap(({ data }) => data.map((d) => d.nombre)))
          ),
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const seriesName = params.seriesName
            const [valor, categoria] = params.data.value
            return `${seriesName}<br/>Categoría: ${categoria}<br/>Valor: ${valor.toFixed(2)}`
          },
        },
        series: series as unknown as echarts.SeriesOption[],
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
