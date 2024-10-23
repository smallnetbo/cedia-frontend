import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface MixedLineBarProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const MixedLineBar: React.FC<MixedLineBarProps> = ({
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
      const values = data.map((serie) => serie.data[0].valor)
      const colors = data.map((serie) => serie.data[0].color)

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          top: '1%',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999',
            },
          },
        },
        // toolbox: {
        //   left: 'center',
        //   feature: {
        //     dataView: { show: true, readOnly: false },
        //     magicType: { show: true, type: ['line', 'bar'] },
        //     restore: { show: true },
        //     saveAsImage: { show: true },
        //   },
        // },
        xAxis: [
          {
            type: 'category',
            data: categories,
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Valores',
            min: 0,
            max: Number(Math.max(...values.map(Number)).toFixed(2)),
            interval: 1,
            axisLabel: {
              formatter: '{value}',
            },
          },
        ],
        series: [
          {
            name: 'Valores',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value: any) {
                return value as number
              },
            },
            data: values,
            itemStyle: {
              color: (params: any) => colors[params.dataIndex],
            },
          },
          {
            name: 'Línea',
            type: 'line',
            tooltip: {
              valueFormatter: function (value: any) {
                return value as number
              },
            },
            data: values,
            itemStyle: {
              color: '#ff4500',
            },

            smooth: true,
            lineStyle: {
              width: 2,
            },
          },
        ] as unknown as echarts.SeriesOption[],
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

export default MixedLineBar
