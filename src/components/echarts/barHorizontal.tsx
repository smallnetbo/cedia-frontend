import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import {
  ChartData,
  DatoRegistro,
} from '@/app/datosGenerales/types/datosGeneralesType'

type EChartsOption = echarts.EChartsOption

interface HorizontalBarChartProps {
  data: {
    name: string
    data: { chartData: ChartData }[]
  }[]
  title: string
  subTitle: string
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
  subTitle,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize()
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      if (chartInstance) {
        chartInstance.dispose()
      }
    }
  }, [chartInstance])

  useEffect(() => {
    if (!chartInstance && chartContainerRef.current) {
      const chart = echarts.init(chartContainerRef.current)
      setChartInstance(chart)
    }

    return () => {
      if (chartInstance) {
        chartInstance.dispose()
      }
    }
  }, [chartInstance])

  useEffect(() => {
    if (chartInstance && chartContainerRef.current) {
      if (data.length === 0) {
        chartInstance.clear()
        return
      }

      // Formatea los datos para la serie
      const nombreBarra = data.flatMap((item) =>
        item.data.map((subItem) => subItem.chartData.nombre)
      )
      const ejecuciones = data.flatMap((item) =>
        item.data.map((innerItem) => innerItem.chartData.valor)
      )
      const colores = data.flatMap((item) =>
        item.data.map((innerItem) => innerItem.chartData.color)
      )

      const option: EChartsOption = {
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
        xAxis: {
          type: 'value',
        },
        yAxis: [
          {
            type: 'category',
            data: nombreBarra,
            axisTick: {
              alignWithLabel: true,
            },
            inverse: true,
            axisLabel: {
              align: 'right',
              margin: 5,
            },
          },
        ],
        series: [
          {
            name: '',
            type: 'bar',
            barWidth: '60%',
            data: ejecuciones,
            itemStyle: {
              color: function (params) {
                return colores[params.dataIndex] || '#000'
              },
            },
          },
        ],
        backgroundColor: 'white',
      }

      chartInstance.setOption(option)
    }
  }, [chartInstance, data, title, subTitle])

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default HorizontalBarChart
