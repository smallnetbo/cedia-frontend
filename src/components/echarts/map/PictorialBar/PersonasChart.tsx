import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import { pathSymbols } from '@/iconosSvg/pathSymbols'

interface PersonaChartProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const PersonasChart: React.FC<PersonaChartProps> = ({
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

      const hasSingleDataSeries = data.every((serie) => serie.data.length === 1)
      const categories = hasSingleDataSeries
        ? data.map((serie) => serie.name)
        : Array.from(
            new Set(
              data.flatMap((serie) => serie.data.map((item) => item.nombre))
            )
          )
      const series = hasSingleDataSeries
        ? [
            {
              type: 'pictorialBar',
              symbolSize: ['10%', '10%'],
              barCategoryGap: '20%',
              barGap: '5%',
              data: data.map((serie) => ({
                value: serie.data[0].valor,
                itemStyle: {
                  color: serie.data[0].color ?? '#000',
                },
                symbol:
                  serie.data[0].nombre === 'HOMBRE'
                    ? pathSymbols.hombre
                    : pathSymbols.mujer,
              })),
              label: {
                show: true,
                position: 'right',
                formatter: (params: any) => params.value.toFixed(2),
              },
            },
          ]
        : categories.map((resource) => {
            return {
              name: resource,
              type: 'pictorialBar',

              symbolSize: ['50%', '30%'],
              barCategoryGap: '0%',
              barGap: '0%',

              data: data.map((serie) => {
                const item = serie.data.find((d) => d.nombre === resource)
                return item && typeof item.valor === 'number'
                  ? {
                      value: item.valor,
                      symbol:
                        item.nombre === 'HOMBRE'
                          ? pathSymbols.hombre
                          : pathSymbols.mujer,

                      symbolRepeat: item.valor,
                    }
                  : 0
              }),
              itemStyle: {
                color:
                  data
                    .find((serie) =>
                      serie.data.find((d) => d.nombre === resource)
                    )
                    ?.data.find((d) => d.nombre === resource)?.color ?? '#000',
              },
              label: {
                show: true,
                position: 'center',
                formatter: (params: any) =>
                  typeof params.value === 'number'
                    ? params.value.toFixed(2)
                    : params.value,
                textStyle: {
                  fontSize: 23,
                  fontWeight: 'bold',
                },
              },
            }
          })

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          top: '1%',
          textStyle: {
            fontSize: 18,
          },
          subtextStyle: {
            fontSize: 14,
          },
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
          top: '20%',
          containLabel: true,
        },
        xAxis: {
          splitLine: { show: true },
          axisLabel: { show: true },
          axisTick: { show: true },
          axisLine: { show: true },
        },
        yAxis: {
          type: 'category',
          data: data.map((serie) => serie.name),
          axisLabel: {
            interval: 0,
            fontSize: 19,
            fontWeight: 'bold',
          },
          inverse: true,
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

export default PersonasChart
