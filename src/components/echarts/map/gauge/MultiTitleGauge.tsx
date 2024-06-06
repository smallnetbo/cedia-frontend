import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface MultiTitleGaugeProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const MultiTitleGauge: React.FC<MultiTitleGaugeProps> = ({
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

      const adaptarDatosParaGauge = (datos: any[]) => {
        return datos.map((item) => {
          const totalValor = item.data.reduce(
            (acc: number, curr: any) => acc + curr.valor,
            0
          )
          const valorPromedio = totalValor / item.data.length

          let name
          if (valorPromedio <= 30) {
            name = 'Good'
          } else if (valorPromedio <= 60) {
            name = 'Better'
          } else {
            name = 'Perfect'
          }

          return {
            value: valorPromedio,
            name: name,
            title: {
              offsetCenter: [
                valorPromedio <= 30
                  ? '-40%'
                  : valorPromedio <= 60
                    ? '0%'
                    : '40%',
                '80%',
              ],
            },
            detail: {
              offsetCenter: [
                valorPromedio <= 30
                  ? '-40%'
                  : valorPromedio <= 60
                    ? '0%'
                    : '40%',
                '95%',
              ],
            },
          }
        })
      }

      const gaugeData = adaptarDatosParaGauge(data)

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          top: '1%',
        },
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%',
        },
        legend: {
          data: gaugeData.map((item) => item.name),
          bottom: 10,
          selectedMode: 'single',
        },
        series: [
          {
            type: 'gauge',
            anchor: {
              show: true,
              showAbove: true,
              size: 18,
              itemStyle: {
                color: '#FAC858',
              },
            },
            pointer: {
              icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
              width: 8,
              length: '80%',
              offsetCenter: [0, '8%'],
            },
            progress: {
              show: true,
              overlap: true,
              roundCap: true,
            },
            axisLine: {
              roundCap: true,
            },
            data: gaugeData,
            title: {
              fontSize: 14,
            },
            detail: {
              width: 40,
              height: 14,
              fontSize: 14,
              color: '#fff',
              backgroundColor: 'inherit',
              borderRadius: 3,
              formatter: '{value}%',
            },
          },
        ],
      }

      chart.setOption(option)

      if (onExport) {
        setTimeout(() => {
          const image = chart.getDataURL({
            type: 'png',
            pixelRatio: 2,
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
  }, [data, title, subTitle, onExport])

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

export default MultiTitleGauge
