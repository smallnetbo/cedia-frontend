import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import { pathSymbols } from '@/iconosSvg/pathSymbols'
import { Typography } from '@mui/material'
import { getResponsiveFontSize } from '../data/PaperResponsive'
interface IconosChartProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const IconosChart: React.FC<IconosChartProps> = ({
  data,
  title,
  subTitle,
  onExport,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )
  const [isDataValid, setIsDataValid] = useState<boolean>(true)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      if (
        !Array.isArray(data) ||
        data.length === 0 ||
        !data.every((serie) => serie.data && Array.isArray(serie.data))
      ) {
        setIsDataValid(false)
        return
      }

      const isDataValid = data.every(
        (serie) => serie.data.length > 0 && serie.data[0].valor !== undefined
      )
      setIsDataValid(isDataValid)

      if (!isDataValid) {
        chart.setOption({
          title: {
            text: 'Datos Inválidos',
            left: 'center',
            top: 'center',
            textStyle: {
              fontSize: getResponsiveFontSize(12),
              color: 'red',
            },
          },
          tooltip: {
            show: false,
          },
          series: [],
        })
        return
      }

      const centralValue = data[0].data[0].valor

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
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
              const radius = 60 // Radio del círculo grande
              const iconRadius = 50 // Radio del círculo alrededor del icono
              const iconSize = 50 // Tamaño del ícono (ancho/alto)

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
                      fontSize: getResponsiveFontSize(22),
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
    <div style={{ width: '100%', height: '100%' }}>
      {isDataValid ? (
        <div
          ref={chartContainerRef}
          style={{ width: '100%', height: '100%' }}
        ></div>
      ) : (
        <Typography
          variant="h6"
          color="textSecondary"
          style={{
            textAlign: 'center',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          Los datos no son válidos para mostrar el gráfico.
        </Typography>
      )}
    </div>
  )
}

export default IconosChart
