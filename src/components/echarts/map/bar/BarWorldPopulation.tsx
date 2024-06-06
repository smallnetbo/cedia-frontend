import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface BarWorldPopulationProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const BarWorldPopulation: React.FC<BarWorldPopulationProps> = ({
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
                ?.data.find((d) => d.nombre === resource)?.color || '#000',
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params) => params.value.toFixed(2),
          },
        }
      })

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
              return item ? `{name|${name}}` : `{rect|}`
            }
          },
          textStyle: {
            rich: {
              name: {
                color: (name) => {
                  const item = data
                    .flatMap((serie) => serie.data)
                    .find((d) => d.nombre === name)
                  return item ? item.color : '#000'
                },
              },
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
          //top: '30%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
          },
          inverse: true,
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

export default BarWorldPopulation
