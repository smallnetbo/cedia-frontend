import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface ChartLineProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  chartRef?: React.RefObject<echarts.ECharts>
}

const ChartLine: React.FC<ChartLineProps> = ({
  data,
  title,
  subTitle,
  chartRef,
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

      // Extract the categories (eje X) and the unique resource types
      const categories = data.map((serie) => serie.name)
      const resourceTypes = Array.from(
        new Set(data.flatMap((serie) => serie.data.map((item) => item.nombre)))
      )

      // Prepare the series data
      const series = resourceTypes.map((resource) => {
        return {
          name: resource,
          type: 'line',
          data: data.map((serie) => {
            const item = serie.data.find((d) => d.nombre === resource)
            return item ? item.valor : 0
          }),
          color:
            data
              .find((serie) => serie.data.find((d) => d.nombre === resource))
              ?.data.find((d) => d.nombre === resource)?.color || '#000',
        }
      })

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: resourceTypes,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
          },
        },
        yAxis: {
          type: 'value',
        },
        series: series,
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

  // Pasar la referencia del gráfico al padre si se proporciona
  useEffect(() => {
    if (chartRef) {
      chartRef.current = chartInstance
    }
  }, [chartInstance, chartRef])

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default ChartLine
