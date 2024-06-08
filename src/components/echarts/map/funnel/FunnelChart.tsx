import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface FunnelChartProps {
  data: {
    name: string
    data: {
      chartData: ChartData
    }[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  title,
  subTitle,
  onExport,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartContainerRef.current)
    }

    const chart = chartInstanceRef.current

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        textStyle: {
          // Estilo del texto del título
          color: '#333', // Color del texto
          fontSize: 16, // Tamaño de fuente
          fontWeight: 'bold', // Peso de fuente
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%',
      },
      legend: {
        data: data.map((item) => item.name),
        top: '10%',
        textStyle: {
          // Estilo del texto de los legend
          color: '#666', // Color del texto
          fontSize: 12, // Tamaño de fuente
        },
        formatter: (name) => {
          const item = data
            .flatMap((serie) => serie.data)
            .find((d) => d.chartData.nombre === name)

          if (window.innerWidth <= 768) {
            return `{rect|}`
          } else {
            return item ? `{name|${name}}` : `{rect|}`
          }
        },
        textStyle: {
          rich: {
            name: {
              color: (name) => {
                const item = data
                  .flatMap((serie) => serie.data)
                  .find((d) => d.chartData.nombre === name)
                return item ? item.chartData.color : '#000'
              },
            },
            rect: {
              width: 12,
              height: 12,
            },
          },
        },
      },
      series: data.map((item, index) => ({
        name: item.name,
        type: 'funnel',
        left: '10%',
        width: '80%',
        label: {
          formatter: `{b} {${item.name}}`,
          rotate: 45,
          fontSize: 10,
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          opacity: index === 0 ? 0.7 : 0.5,
        },
        emphasis: {
          label: {
            position: 'inside',
            formatter: `{b} {${item.name}}: {c}%`,
          },
        },
        data: item.data.map((dataItem) => ({
          name: dataItem.chartData.nombre,
          value: dataItem.chartData.valor,
          itemStyle: { color: dataItem.chartData.color },
        })),
      })),
      grid: {
        top: '20%',
        bottom: '10%',
        left: '10%',
        right: '10%',
      },
    }

    chart.setOption(option)
  }, [data, title])

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default FunnelChart
