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

      const categories = data.map((serie) => serie.name)
      const resourceTypes = Array.from(
        new Set(data.flatMap((serie) => serie.data.map((item) => item.nombre)))
      )

      const series = resourceTypes.map((resource) => {
        return {
          name: resource,
          type: 'bar',
          data: data.map((serie) => {
            const item = serie.data.find((d) => d.nombre === resource)
            return item ? item.valor : 0
          }),
          itemStyle: {
            color:
              data
                .find((serie) => serie.data.find((d) => d.nombre === resource))
                ?.data.find((d) => d.nombre === resource)?.color ?? '#000',
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => params.value.toFixed(2),
          },
        }
      })

      const richColors = resourceTypes.reduce(
        (acc, resource) => {
          const item = data
            .flatMap((serie) => serie.data)
            .find((d) => d.nombre === resource)
          if (item) {
            acc[resource] = {
              color: item.color || '#000',
            }
          }
          return acc
        },
        {} as { [key: string]: { color: string } }
      )

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
        legend: {
          data: resourceTypes,
          top: '10%',
          formatter: (name) => {
            const item = data
              .flatMap((serie) => serie.data)
              .find((d) => d.nombre === name)

            if (window.innerWidth <= 768) {
              return `{rect|}`
            } else {
              return item ? `{${name}|${name}}` : `{rect|}`
            }
          },
          textStyle: {
            rich: {
              ...Object.fromEntries(
                Object.entries(richColors).map(([name, style]) => [
                  name,
                  { color: style.color },
                ])
              ),
              rect: {
                width: 12,
                height: 12,
              },
            },
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
          },
        },
        yAxis: {
          type: 'value',
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

export default BarBasic
