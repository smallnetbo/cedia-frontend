import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { pathSymbols } from '@/iconosSvg/pathSymbols'

const PersonasChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const data = [
      {
        name: 'Hombres',
        data: [
          { nombre: 'HOMBRE', valor: 3, color: '#1f77b4' },
          { nombre: 'MUJER', valor: 5, color: '#ff7f0e' },
        ],
      },
      {
        name: 'Mujeres',
        data: [
          { nombre: 'HOMBRE', valor: 5, color: '#1f77b4' },
          { nombre: 'MUJER', valor: 2, color: '#ff7f0e' },
        ],
      },
    ]

    const title = 'Distribución por Género'
    const subTitle = 'Datos Fijos'

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
                  fontSize: 18,
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
            fontSize: 14,
          },
          subtextStyle: {
            fontSize: 12,
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
            fontSize: 12,
            fontWeight: 'bold',
          },
          inverse: true,
        },
        series: series as unknown as echarts.SeriesOption[],
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
  }, [])

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
