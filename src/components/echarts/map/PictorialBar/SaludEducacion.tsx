import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface IconosChartProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const pathSymbols = {
  grifo:
    'M390.606,142.511v-15.84h-47.511V84.447h-26.383V47.532h52.777V0H205.841v47.532h52.787v36.915h-26.394v42.223h-47.501v15.84H73.894v147.787h-31.67v58.085h142.532v-58.085h-26.383v-36.926h26.362v15.84h205.872v-15.84h79.17V142.511H390.606zM168.894,306.159v26.362H58.085v-26.362H168.894zM184.733,237.511h-42.222v52.787H89.755V158.372h94.978V237.511z M295.596,15.862h58.032V31.67h-58.032V15.862z M300.851,47.532v36.915h-26.362V47.532H300.851zM221.702,31.67V15.862h58.032V31.67H221.702zM248.096,100.308h79.139v26.362h-79.139V100.308z M337.797,253.351H237.541v-58.032h100.256V253.351zM374.744,245.441v7.91h-21.085v-73.894H221.681v73.894h-21.085V142.532h174.148V245.441z M453.915,237.511h-63.309v-79.139h63.309V237.511z',
  libro:
    'M92.2,2v107.3C77,110.2,63.4,119.4,57,133.4L2.4,254H79l4.9-16.3c21.1-5.1,36.9-21.1,43.6-41.3h116.1V2H92.2z M233.8,186.5 H112.6c-3.1,14.5-13.8,27.3-28.2,33.2c-0.5,0.2-1,0.3-1.5,0.3c-1.6,0-3-0.9-3.6-2.5c-0.8-2,0.1-4.5,2.2-5.1c13.5-4.4,24-18.5,24.3-33.5l0-5.7h38.5c5.9,0,10.7-4.8,10.7-10.7v-0.2c0-5.9-4.8-10.7-10.7-10.7l-68.6,0c-2.2,0-3.9-1.8-3.9-3.9s1.8-3.9,3.9-3.9H102V11.8h131.7V186.5zM193.6,49.1h-51.5v-9.8h51.5V49.1z M215.3,80.7h-94.8v-9.8h94.8V80.7z M215.3,106.3h-94.8v-9.8h94.8V106.3zM215.3,131.9h-94.8V122h94.8V131.9z',
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

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          top: '5%',
          textStyle: {
            fontSize: 24,
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: 16,
          },
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: [
          {
            type: 'custom',
            renderItem: function (params, api) {
              const centerX = api.getWidth() / 2
              const centerY = api.getHeight() / 2
              const iconSize = 80 // Tamaño del ícono (ancho/alto)
              const lineLength = 60 // Longitud de la línea
              const textOffset = 30 // Espaciado entre la línea y el texto
              const verticalSpacing = 150 // Espaciado vertical entre los dos conjuntos de íconos

              return {
                type: 'group',
                children: [
                  // Primer ícono (grifo)
                  {
                    type: 'group',
                    children: [
                      {
                        type: 'path',
                        shape: {
                          pathData: pathSymbols.grifo,
                          x: centerX - iconSize / 2,
                          y: centerY - iconSize / 2,
                          width: iconSize,
                          height: iconSize,
                        },
                        style: {
                          fill: '#000000',
                        },
                      },
                      // Línea
                      {
                        type: 'line',
                        shape: {
                          x1: centerX + iconSize / 2,
                          y1: centerY,
                          x2: centerX + iconSize / 2 + lineLength,
                          y2: centerY,
                        },
                        style: {
                          stroke: '#FF5733',
                          lineWidth: 3,
                        },
                      },
                      // Valor numérico
                      {
                        type: 'text',
                        style: {
                          x: centerX + iconSize / 2 + lineLength + textOffset,
                          y: centerY,
                          text: '100',
                          textAlign: 'center',
                          textVerticalAlign: 'middle',
                          fontSize: 18,
                          fill: '#000000',
                        },
                      },
                      // Línea
                      {
                        type: 'line',
                        shape: {
                          x1:
                            centerX +
                            iconSize / 2 +
                            lineLength +
                            textOffset +
                            40,
                          y1: centerY,
                          x2:
                            centerX +
                            iconSize / 2 +
                            lineLength +
                            textOffset +
                            40 +
                            lineLength,
                          y2: centerY,
                        },
                        style: {
                          stroke: '#FF5733',
                          lineWidth: 3,
                        },
                      },
                      // Valor numérico con borde
                      {
                        type: 'text',
                        style: {
                          x:
                            centerX +
                            iconSize / 2 +
                            lineLength +
                            textOffset +
                            40 +
                            lineLength +
                            40,
                          y: centerY,
                          text: '200',
                          textAlign: 'center',
                          textVerticalAlign: 'middle',
                          fontSize: 18,
                          fill: '#000000',
                        },
                      },
                      {
                        type: 'circle',
                        shape: {
                          cx:
                            centerX +
                            iconSize / 2 +
                            lineLength +
                            textOffset +
                            40 +
                            lineLength +
                            40,
                          cy: centerY,
                          r: 25,
                        },
                        style: {
                          stroke: '#FF5733',
                          lineWidth: 3,
                          fill: 'none',
                        },
                      },
                    ],
                  },
                  // Segundo ícono (libro) más abajo
                  {
                    type: 'group',
                    children: [
                      {
                        type: 'path',
                        shape: {
                          pathData: pathSymbols.libro,
                          x: centerX - iconSize / 2,
                          y: centerY + verticalSpacing - iconSize / 2,
                          width: iconSize,
                          height: iconSize,
                        },
                        style: {
                          fill: '#000000',
                        },
                      },
                      // Línea
                      {
                        type: 'line',
                        shape: {
                          x1: centerX + iconSize / 2,
                          y1: centerY + verticalSpacing,
                          x2: centerX + iconSize / 2 + lineLength,
                          y2: centerY + verticalSpacing,
                        },
                        style: {
                          stroke: '#FF5733',
                          lineWidth: 3,
                        },
                      },
                      // Valor numérico
                      {
                        type: 'text',
                        style: {
                          x: centerX + iconSize / 2 + lineLength + textOffset,
                          y: centerY + verticalSpacing,
                          text: '150',
                          textAlign: 'center',
                          textVerticalAlign: 'middle',
                          fontSize: 18,
                          fill: '#000000',
                        },
                      },
                      // Línea
                      {
                        type: 'line',
                        shape: {
                          x1:
                            centerX +
                            iconSize / 2 +
                            lineLength +
                            textOffset +
                            40,
                          y1: centerY + verticalSpacing,
                          x2:
                            centerX +
                            iconSize / 2 +
                            lineLength +
                            textOffset +
                            40 +
                            lineLength,
                          y2: centerY + verticalSpacing,
                        },
                        style: {
                          stroke: '#FF5733',
                          lineWidth: 3,
                        },
                      },
                      // Valor numérico con borde
                      {
                        type: 'text',
                        style: {
                          x:
                            centerX +
                            iconSize / 2 +
                            lineLength +
                            textOffset +
                            40 +
                            lineLength +
                            40,
                          y: centerY + verticalSpacing,
                          text: '250',
                          textAlign: 'center',
                          textVerticalAlign: 'middle',
                          fontSize: 18,
                          fill: '#000000',
                        },
                      },
                      {
                        type: 'circle',
                        shape: {
                          cx:
                            centerX +
                            iconSize / 2 +
                            lineLength +
                            textOffset +
                            40 +
                            lineLength +
                            40,
                          cy: centerY + verticalSpacing,
                          r: 25,
                        },
                        style: {
                          stroke: '#FF5733',
                          lineWidth: 3,
                          fill: 'none',
                        },
                      },
                    ],
                  },
                ],
              }
            },
            data: [0],
          },
        ],
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
