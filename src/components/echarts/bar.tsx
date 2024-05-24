import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { DatoRegistro } from '@/app/datosGenerales/types/datosGeneralesType'

interface ChartBarProps {
  data: {
    name: string
    data: { datoRegistro: DatoRegistro }[]
  }[]
  title: string
  subTitle: string
  chartRef?: React.RefObject<echarts.ECharts>
}

const ChartBar: React.FC<ChartBarProps> = ({
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

      const anios = data.map((serie) => serie.name)
      const recursosUnicos = Array.from(
        new Set(
          data.flatMap((serie) =>
            serie.data.map((item) => item.datoRegistro.recurso)
          )
        )
      )

      const series = recursosUnicos.map((recurso) => {
        return {
          name: recurso,
          type: 'bar',
          data: data.map((serie) => {
            const dato = serie.data.find(
              (item) => item.datoRegistro.recurso === recurso
            )
            return dato ? parseFloat(dato.datoRegistro.ejecucion) : 0
          }),
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
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: anios,
            axisLabel: {
              interval: 0,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: series,
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

export default ChartBar
