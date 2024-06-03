import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface ChartPieProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  chartRef?: React.RefObject<echarts.ECharts>
}

const ChartPie: React.FC<ChartPieProps> = ({
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

      // Prepare the series data
      const formattedData = data.flatMap((serie) =>
        serie.data.map((item) => ({
          name: item.nombre,
          value: item.valor,
          itemStyle: {
            color: item.color,
          },
        }))
      )

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: formattedData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
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

export default ChartPie
