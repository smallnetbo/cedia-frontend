import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import { pathSymbols } from '@/iconosSvg/pathSymbols'

interface IconosChartProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const SaludEducacion: React.FC<IconosChartProps> = ({
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

      // Ajustes
      const iconSize = 80
      const lineLength = 60
      const textOffset = 10
      const verticalSpacing = 150 // Espacio vertical entre íconos
      const lineSpacing = 0 // Espacio vertical entre líneas de separación
      const iconXOffset = 200 // Ajusta el espacio horizontal para mover los íconos a la izquierda
      const centerX = chart.getWidth() / 2 // Centro horizontal del gráfico
      const baseYOffsetOffset = 10 // Ajusta la posición vertical de la base

      const calculateRectangleWidth = (value: number) => {
        const minWidth = 35 // Ancho mínimo
        const maxWidth = 200 // Ancho máximo
        const maxValue = 100 // Valor máximo para escalar
        return Math.min(
          maxWidth,
          Math.max(minWidth, (value / maxValue) * maxWidth)
        )
      }

      const option: echarts.EChartsOption = {
        // title: {
        //   text: title,
        //   subtext: subTitle,
        //   left: 'center',
        //   top: '5%',
        //   textStyle: {
        //     fontSize: 24,
        //     fontWeight: 'bold',
        //   },
        //   subtextStyle: {
        //     fontSize: 16,
        //   },
        // },
        xAxis: { show: false },
        yAxis: { show: false },
        series: data.map((item, index) => ({
          type: 'custom',
          renderItem: function () {
            const baseYOffset = index * verticalSpacing + 50 + baseYOffsetOffset

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
                        // Ícono principal
                        type: 'path',
                        shape: {
                          pathData: pathSymbols.colegio, // Asigna el ícono adecuado
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
                        // Título del ícono
                        type: 'text',
                        style: {
                          x: centerX,
                          y: baseYOffset - 20,
                          text: item.name,
                          textAlign: 'center',
                          fontSize: 20,
                          fontWeight: 'bold',
                          fill: '#333',
                        },
                      },
                      {
                        // Línea asociada al ícono
                        type: 'line',
                        shape: {
                          x1: iconXOffset + iconSize,
                          y1: yOffset - 20, // Ajusta la posición vertical inicial de la línea
                          x2: iconXOffset + iconSize + lineLength,
                          y2: yOffset - 20, // Ajusta la posición vertical final de la línea
                        },
                        style: {
                          stroke: d.color,
                          lineWidth: 3,
                        },
                      },
                      {
                        // Texto asociado al ícono
                        type: 'text',
                        style: {
                          x: iconXOffset + iconSize + lineLength + textOffset,
                          y: yOffset - 20,
                          text: `${d.nombre}`,
                          textAlign: 'left',
                          textVerticalAlign: 'middle',
                          fontSize: 18,
                          fill: d.color,
                        },
                      },
                      {
                        // Texto asociado al ícono
                        type: 'text',
                        style: {
                          x:
                            iconXOffset +
                            iconSize +
                            lineLength +
                            textOffset +
                            100,
                          y: yOffset - 20,
                          text: `${d.valor}`,
                          textAlign: 'center',
                          textVerticalAlign: 'middle',
                          fontSize: 18,
                          fill: d.color,
                        },
                      },
                      {
                        // Reemplaza el círculo con un rectángulo
                        type: 'rect',
                        shape: {
                          x:
                            iconXOffset +
                            iconSize +
                            lineLength +
                            textOffset +
                            80,

                          y: yOffset - 20 - 30 / 2,
                          width: rectangleWidth, // Ancho del rectángulo dinamico
                          height: 30, // Alto del rectángulo
                        },
                        style: {
                          stroke: d.color,
                          lineWidth: 3,
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

export default SaludEducacion
