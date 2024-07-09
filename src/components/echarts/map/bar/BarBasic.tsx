import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface BarBasicProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const BarBasic: React.FC<BarBasicProps> = ({
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

      let categories: string[] = []
      let series: echarts.SeriesOption[] = []

      const hasSingleDataSeries = data.every((serie) => serie.data.length === 1)

      if (hasSingleDataSeries) {
        categories = data.map((serie) => serie.name)
        series = [
          {
            type: 'bar',
            data: data.map((serie) => ({
              value: serie.data[0].valor,
              itemStyle: { color: serie.data[0].color ?? '#000' },
            })),
            label: {
              show: true,
              position: 'top',
              formatter: (params: any) => params.value.toFixed(2),
            },
          },
        ]
      } else {
        categories = Array.from(
          new Set(
            data.flatMap((serie) => serie.data.map((item) => item.nombre))
          )
        )
        series = data.map((serie) => ({
          name: serie.name,
          type: 'bar',
          data: categories.map((category) => {
            const item = serie.data.find(
              (dataItem) => dataItem.nombre === category
            )
            return {
              value: item ? item.valor : 0,
              itemStyle: {
                color: item?.color ?? '#000',
              },
            }
          }),
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => params.value.toFixed(2),
          },
        }))
      }

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
          type: 'category',
          data: categories,

          axisLabel: {
            interval: 0,
            fontSize: 9,
            formatter: (value: string) => {
              return value.replace(/_/g, '\n')
            },
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

export default BarBasic
