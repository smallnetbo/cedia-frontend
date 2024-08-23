import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { pathSymbols } from '@/iconosSvg/pathSymbols'

const IconosChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const title = 'Gráfico Iconos'

    const centralValue = 1500

    const updateChart = () => {
      if (!chart) return

      const option: echarts.EChartsOption = {
        title: {
          text: title,

          left: 'center',
          top: '1%',
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: [
          {
            type: 'custom',
            renderItem: function (params, api) {
              const centerX = api.getWidth() / 2
              const centerY = api.getHeight() / 2
              const radius = 40 // Radio del círculo grande (ajustado)
              const iconRadius = 35 // Radio del círculo alrededor del icono (ajustado)
              const iconSize = 35 // Tamaño del ícono (ancho/alto ajustado)

              return {
                type: 'group',
                children: [
                  // Círculo de fondo
                  {
                    type: 'circle',
                    shape: {
                      cx: centerX,
                      cy: centerY,
                      r: radius,
                    },
                    style: {
                      fill: '#006666',
                    },
                  },
                  // Ícono arriba
                  {
                    type: 'group',
                    children: [
                      {
                        type: 'circle',
                        shape: {
                          cx: centerX,
                          cy: centerY - radius - iconRadius, // Posición del círculo alrededor del ícono arriba
                          r: iconRadius,
                        },
                        style: {
                          fill: '#B7E1DF',
                        },
                      },
                      {
                        type: 'path',
                        shape: {
                          pathData: pathSymbols.grifo,
                          x: centerX - iconSize / 2,
                          y: centerY - radius - iconRadius - iconSize / 2,
                          width: iconSize,
                          height: iconSize,
                        },

                        style: {
                          fill: '#000000',
                        },
                      },
                    ],
                  },
                  // Ícono abajo
                  {
                    type: 'group',
                    children: [
                      {
                        type: 'circle',
                        shape: {
                          cx: centerX,
                          cy: centerY + radius + iconRadius, // Posición del círculo alrededor del ícono abajo
                          r: iconRadius,
                        },
                        style: {
                          fill: '#5EB1AF',
                        },
                      },
                      {
                        type: 'path',
                        shape: {
                          pathData: pathSymbols.casa,
                          x: centerX - iconSize / 2,
                          y: centerY + radius + iconRadius - iconSize / 2,
                          width: iconSize,
                          height: iconSize,
                        },
                        style: {
                          fill: '#000000',
                        },
                      },
                    ],
                  },
                  // Ícono derecha
                  {
                    type: 'group',
                    children: [
                      {
                        type: 'circle',
                        shape: {
                          cx: centerX + radius + iconRadius, // Posición del círculo alrededor del ícono derecha
                          cy: centerY,
                          r: iconRadius,
                        },
                        style: {
                          fill: '#8DCFC7',
                        },
                      },
                      {
                        type: 'path',
                        shape: {
                          pathData: pathSymbols.libro,
                          x: centerX + radius + iconRadius - iconSize / 2,
                          y: centerY - iconSize / 2,
                          width: iconSize,
                          height: iconSize,
                        },
                        style: {
                          fill: '#000000',
                        },
                      },
                    ],
                  },
                  // Ícono izquierda
                  {
                    type: 'group',
                    children: [
                      {
                        type: 'circle',
                        shape: {
                          cx: centerX - radius - iconRadius, // Posición del círculo alrededor del ícono izquierda
                          cy: centerY,
                          r: iconRadius,
                        },
                        style: {
                          fill: '#E3F3F1',
                        },
                      },
                      {
                        type: 'path',
                        shape: {
                          pathData: pathSymbols.doctor,
                          x: centerX - radius - iconRadius - iconSize / 2,
                          y: centerY - iconSize / 2,
                          width: iconSize,
                          height: iconSize,
                        },
                        style: {
                          fill: '#000000',
                        },
                      },
                    ],
                  },
                  // Central Value
                  {
                    type: 'text',
                    style: {
                      x: centerX,
                      y: centerY,
                      text: centralValue,
                      textAlign: 'center',
                      textVerticalAlign: 'middle',
                      fill: '#ffffff',
                      fontSize: 18,
                      fontWeight: 'bold',
                    },
                  },
                ],
              }
            },
            data: [1],
          } as echarts.CustomSeriesOption,
        ],
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
    <div
      ref={chartContainerRef}
      style={{ width: '100%', height: '100%' }}
    ></div>
  )
}

export default IconosChart
