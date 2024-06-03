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
  onExport?: (image: string) => void
}

const ChartLine: React.FC<ChartLineProps> = ({
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

      const categories = data.map((serie) => serie.name)
      const resourceTypes = Array.from(
        new Set(data.flatMap((serie) => serie.data.map((item) => item.nombre)))
      )

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

      if (onExport) {
        setTimeout(() => {
          const image = chart.getDataURL({
            type: 'png', // Cambiar a 'jpeg' si prefieres JPEG
            pixelRatio: 2, // Ajustar la resolución si es necesario
          })
          onExport(image || '')
        }, 500)
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

    // Agregar el evento de cambio de tamaño de la ventana
    window.addEventListener('resize', handleResize)

    // Eliminar el evento de cambio de tamaño de la ventana al desmontar el componente
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [chartInstance])

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default ChartLine
