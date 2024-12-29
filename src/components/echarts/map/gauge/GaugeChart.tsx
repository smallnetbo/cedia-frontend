import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface GaugeChartProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const GaugeChart: React.FC<GaugeChartProps> = ({
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

      const columnCount = Math.min(data.length, 3)
      const series = data.map((agrupador, index) => {
        const valores = agrupador.data.map((item) => item.valor)

        const numericValores = valores
          .map((valor) =>
            typeof valor === 'string' ? parseFloat(valor) : valor
          )
          .filter((valor) => typeof valor === 'number' && !isNaN(valor))

        const valorMaximo = Math.max(...numericValores)
        const valorPptoEjec = agrupador.data.find(
          (item) => item.nombre === 'PPTO_EJEC'
        )?.valor
        const valorAguja =
          valorPptoEjec !== undefined
            ? Number(valorPptoEjec)
            : Math.min(...numericValores)
        const porcentajeValue = ((valorAguja / valorMaximo) * 100).toFixed(2)
        const colores = agrupador.data.map((item) => item.color)

        return {
          type: 'gauge',
          center: [
            `${(index % columnCount) * (100 / columnCount) + 100 / (columnCount * 2)}%`,
            `${Math.floor(index / columnCount) * 50 + 50}%`,
          ],
          radius: '55%',
          max: valorMaximo.toFixed(2),
          progress: {
            show: true,
            width: 10,
          },
          axisLine: {
            lineStyle: {
              width: 10,
              color: colores.map((color, i) => [
                (i + 1) / colores.length,
                color,
              ]),
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            length: 5,
            lineStyle: {
              width: 2,
              color: '#999',
            },
          },
          axisLabel: {
            distance: 20,
            color: '#333',
            fontSize: 12,
            formatter: (value: any) => {
              return value.toFixed(0)
            },
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 15,
            itemStyle: {
              borderWidth: 6,
              borderColor: '#333',
            },
          },
          title: {
            show: false,
          },
          detail: {
            show: true,
            formatter: () => {
              return `{agrupador|${agrupador.name}}\n{ppEjecutado|PPTO. EJEC.: ${valorAguja?.toFixed(2)} (${porcentajeValue}%) }\n{ppVigente|PPTO. VIGENTE: ${valorMaximo.toFixed(2)}}`
            },
            rich: {
              agrupador: {
                fontSize: 16,
                color: '#2c3e50',
                fontWeight: 'bold',
                lineHeight: 24,
                backgroundColor: '#ecf0f1',
                padding: [4, 6],
                borderRadius: 4,
              },
              ppEjecutado: {
                fontSize: 14,
                color: '#2980b9',
                fontWeight: 'bold',
                lineHeight: 20,
                backgroundColor: '#d5dbdb',
                padding: [4, 6],
                borderRadius: 4,
              },
              ppVigente: {
                fontSize: 14,
                color: '#27ae60',
                fontWeight: 'bold',
                lineHeight: 20,
                backgroundColor: '#d5dbdb',
                padding: [4, 6],
                borderRadius: 4,
              },
            },
            offsetCenter: [0, '80%'],
          },
          data: [
            {
              value: valorAguja,
              max: valorMaximo,
            },
          ],
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
          trigger: 'item',
          formatter: (params: any) => {
            const valorAguja = params.data.value
            const valorMaximo = params.data.max
            const porcentajeValue = ((valorAguja / valorMaximo) * 100).toFixed(
              2
            )
            return `Valor: ${valorAguja} (${porcentajeValue}%)`
          },
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

export default GaugeChart
