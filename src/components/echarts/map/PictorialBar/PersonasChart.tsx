import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

const pathSymbols = {
  hombre:
    'path://M179.02,65.494h-11.197c9.756-6.356,16.224-17.37,16.224-29.874C184.047,15.979,168.101,0,148.5,0s-35.547,15.979-35.547,35.62c0,12.504,6.468,23.518,16.224,29.874h-11.197c-24.776,0-44.934,20.184-44.934,44.989v69.374c0,5.482,4.445,9.929,9.929,9.929h19.41v97.285c0,5.482,4.445,9.929,9.929,9.929h72.373c5.483,0,9.929-4.446,9.929-9.929v-97.285h19.41c5.483,0,9.929-4.446,9.929-9.929v-69.374C223.954,85.678,203.797,65.494,179.02,65.494z M148.5,19.857c8.652,0,15.691,7.07,15.691,15.763s-7.039,15.766-15.691,15.766s-15.691-7.073-15.691-15.766S139.848,19.857,148.5,19.857zM204.098,169.929h-9.482v-38.067c0-5.483-4.445-9.927-9.929-9.927c-5.482,0-9.928,4.443-9.928,9.927v145.281h-16.33V202.41c0-5.482-4.446-9.928-9.929-9.928c-5.482,0-9.929,4.445-9.929,9.928v74.732h-16.33V131.861c0-5.483-4.445-9.927-9.928-9.927c-5.483,0-9.929,4.443-9.929,9.927v38.067h-9.483v-59.445c0-13.856,11.25-25.132,25.077-25.132h61.041c13.827,0,25.077,11.275,25.077,25.132V169.929z',
  mujer:
    'path://M225.254,174.314c-0.124-0.481-12.498-48.213-16.482-64.047c-6.391-25.396-21.71-39.963-42.028-39.963h-7.103c14.857-4.369,25.739-18.144,25.739-34.426C185.379,16.095,169.317,0,149.574,0c-19.743,0-35.805,16.095-35.805,35.878c0,16.282,10.882,30.057,25.739,34.426h-6.434c-20.206,0-35.75,14.496-42.648,39.771c-4.333,15.879-16.052,62.334-16.549,64.304c-0.754,2.989-0.087,6.159,1.808,8.591c1.896,2.433,4.806,3.854,7.889,3.854H95.14l-10.254,41.433c-0.739,2.985-0.063,6.145,1.832,8.565c1.896,2.422,4.8,3.837,7.875,3.837h8.539v48.49c0,5.522,4.477,10,10,10h72.883c5.523,0,10-4.478,10-10v-48.49h8.539c3.108,0,6.04-1.445,7.933-3.911c1.893-2.466,2.531-5.672,1.727-8.675l-11.041-41.249h12.401c3.095,0,6.015-1.433,7.909-3.88C225.377,180.495,226.031,177.31,225.254,174.314z M133.769,35.878c0-8.755,7.09-15.878,15.805-15.878c8.715,0,15.805,7.123,15.805,15.878c0,8.756-7.09,15.879-15.805,15.879C140.859,51.757,133.769,44.634,133.769,35.878z M123.133,240.658h16.441v38.49h-16.441V240.658z M176.016,279.148h-16.441v-38.49h16.441V279.148z M187.715,129.072c-1.428-5.335-6.908-8.501-12.246-7.074c-5.335,1.429-8.502,6.911-7.074,12.246l23.131,86.414H107.37l21.431-86.598c1.327-5.361-1.943-10.783-7.305-12.109c-5.356-1.328-10.782,1.944-12.109,7.305l-9.297,37.567h-3.669c3.903-15.383,10.393-40.827,13.301-51.483c3.116-11.422,9.698-25.036,23.353-25.036h33.669c13.539,0,19.781,13.51,22.634,24.844c2.714,10.788,9.291,36.26,13.278,51.676h-4.835L187.715,129.072z',
}

const PersonasChart: React.FC<BarWorldPopulationProps> = ({
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
              symbolRepeat: true,
              symbolSize: ['80%', '60%'],
              // barCategoryGap: '20%',
              barGap: '10%',

              data: data.map((serie) => {
                const item = serie.data.find((d) => d.nombre === resource)
                return item && typeof item.valor === 'number'
                  ? {
                      value: item.valor,
                      symbol:
                        item.nombre === 'HOMBRE'
                          ? pathSymbols.hombre
                          : pathSymbols.mujer,
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
                position: 'right',
                formatter: (params: any) =>
                  typeof params.value === 'number'
                    ? params.value.toFixed(2)
                    : params.value,
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
          splitLine: { show: false },
          axisLabel: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
        },
        yAxis: {
          type: 'category',
          data: data.map((serie) => serie.name),
          axisLabel: {
            interval: 0,
            fontSize: 9,
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
