import { pathSymbols } from '@/iconosSvg/pathSymbols'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'

const SaludEducacion: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)
    const datosFijos = [
      {
        name: 'Educación',
        data: [
          {
            nombre: 'Escuelas',
            valor: '25',
            color: '#1f77b4',
          },
          {
            nombre: 'Universidades',
            valor: '10',
            color: '#ff7f0e',
          },
        ],
      },
      {
        name: 'Salud',
        data: [
          {
            nombre: 'Hospitales',
            valor: '15',
            color: '#2ca02c',
          },
          {
            nombre: 'Clínicas',
            valor: '20',
            color: '#d62728',
          },
        ],
      },
    ]

    const updateChart = () => {
      if (!chart) return

      const iconSize = 50
      const lineLength = 50
      const textOffset = 10
      const verticalSpacing = 100
      const lineSpacing = 5
      const iconXOffset = 50
      const centerX = chart.getWidth() / 2
      const baseYOffsetOffset = 50
      const titleOffset = 30

      const calculateRectangleWidth = (value: number) => {
        const minWidth = 30
        const maxWidth = 150
        const maxValue = 100
        return Math.min(
          maxWidth,
          Math.max(minWidth, (value / maxValue) * maxWidth)
        )
      }

      const option: echarts.EChartsOption = {
        title: {
          text: 'Salud y Educación',

          left: 'center',
          top: `top+${titleOffset}px`,
          textStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: 12,
          },
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: datosFijos.map((item, index) => ({
          type: 'custom',
          renderItem: function () {
            const baseYOffset = index * verticalSpacing + baseYOffsetOffset

            return {
              type: 'group',
              children: [
                ...item.data.map((d, i) => {
                  const yOffset =
                    baseYOffset +
                    iconSize / 2 +
                    i * (iconSize / item.data.length + lineSpacing)

                  const rectangleWidth = calculateRectangleWidth(
                    Number(d.valor).valueOf.length + 20
                  )

                  return {
                    type: 'group',
                    children: [
                      {
                        type: 'path',
                        shape: {
                          pathData: pathSymbols.colegio,
                          x: iconXOffset,
                          y: baseYOffset,
                          width: iconSize,
                          height: iconSize,
                        },
                        style: {
                          fill: d.color,
                        },
                      },
                      {
                        type: 'text',
                        style: {
                          x: centerX,
                          y: baseYOffset - 20,
                          text: item.name,
                          textAlign: 'center',
                          fontSize: 14,
                          fontWeight: 'bold',
                          fill: '#333',
                        },
                      },
                      {
                        type: 'line',
                        shape: {
                          x1: iconXOffset + iconSize,
                          y1: yOffset - 10,
                          x2: iconXOffset + iconSize + lineLength,
                          y2: yOffset - 10,
                        },
                        style: {
                          stroke: d.color,
                          lineWidth: 2,
                        },
                      },
                      {
                        type: 'text',
                        style: {
                          x: iconXOffset + iconSize + lineLength + textOffset,
                          y: yOffset - 10,
                          text: `${d.nombre}`,
                          textAlign: 'left',
                          textVerticalAlign: 'middle',
                          fontSize: 14,
                          fill: d.color,
                        },
                      },
                      {
                        type: 'text',
                        style: {
                          x:
                            iconXOffset +
                            iconSize +
                            lineLength +
                            textOffset +
                            130,
                          y: yOffset - 10,
                          text: `${d.valor}`,
                          textAlign: 'center',
                          textVerticalAlign: 'middle',
                          fontSize: 14,
                          fill: d.color,
                        },
                      },
                      {
                        type: 'rect',
                        shape: {
                          x:
                            iconXOffset +
                            iconSize +
                            lineLength +
                            textOffset +
                            115,
                          y: yOffset - 10 - 25 / 2,
                          width: rectangleWidth,
                          height: 25,
                        },
                        style: {
                          stroke: d.color,
                          lineWidth: 2,
                          fill: 'none',
                        },
                      },
                    ],
                  }
                }),
              ],
            }
          },
          data: [0],
        })) as unknown as echarts.SeriesOption[],
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

export default SaludEducacion
