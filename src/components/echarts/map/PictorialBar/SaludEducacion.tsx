/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
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
      // Ajustes
      const iconSize = 100 // Aumenta el tamaño del ícono
      const lineLength = 80 // Aumenta la longitud de la línea
      const textOffset = 15 // Aumenta el desplazamiento del texto
      const verticalSpacing = 200 // Aumenta el espacio vertical entre íconos
      const lineSpacing = 10 // Aumenta el espacio vertical entre líneas de separación
      const iconXOffset = 250 // Ajusta el espacio horizontal para centrar los íconos
      const centerX = chart.getWidth() / 2 // Centro horizontal del gráfico
      const baseYOffsetOffset = 50 // Ajusta la posición vertical de la base
      const titleOffset = 50 // Espacio adicional para el título

      const calculateRectangleWidth = (value: number) => {
        const minWidth = 50 // Ancho mínimo
        const maxWidth = 300 // Ancho máximo
        const maxValue = 100 // Valor máximo para escalar
        return Math.min(
          maxWidth,
          Math.max(minWidth, (value / maxValue) * maxWidth)
        )
      }

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          top: `top+${titleOffset}px`, // Ajusta la posición del título
          textStyle: {
            fontSize: getResponsiveFontSize(28), // Aumenta el tamaño del texto del título
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: getResponsiveFontSize(18), // Aumenta el tamaño del subtítulo
          },
        },
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
                          y: baseYOffset - 30, // Ajusta la posición del título del ícono
                          text: item.name,
                          textAlign: 'center',
                          fontSize: getResponsiveFontSize(24), // Aumenta el tamaño del texto del título
                          fontWeight: 'bold',
                          fill: '#333',
                        },
                      },
                      {
                        // Línea asociada al ícono
                        type: 'line',
                        shape: {
                          x1: iconXOffset + iconSize,
                          y1: yOffset - 30, // Ajusta la posición vertical inicial de la línea
                          x2: iconXOffset + iconSize + lineLength,
                          y2: yOffset - 30, // Ajusta la posición vertical final de la línea
                        },
                        style: {
                          stroke: d.color,
                          lineWidth: 4, // Aumenta el grosor de la línea
                        },
                      },
                      {
                        // Texto asociado al ícono
                        type: 'text',
                        style: {
                          x: iconXOffset + iconSize + lineLength + textOffset,
                          y: yOffset - 30,
                          text: `${d.nombre}`,
                          textAlign: 'left',
                          textVerticalAlign: 'middle',
                          fontSize: getResponsiveFontSize(20), // Aumenta el tamaño del texto
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
                            120, // Ajusta el desplazamiento horizontal del texto
                          y: yOffset - 30,
                          text: `${d.valor}`,
                          textAlign: 'center',
                          textVerticalAlign: 'middle',
                          fontSize: getResponsiveFontSize(20), // Aumenta el tamaño del texto
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
                            100, // Ajusta el desplazamiento horizontal del rectángulo
                          y: yOffset - 30 - 30 / 2,
                          width: rectangleWidth, // Ancho del rectángulo dinámico
                          height: 30, // Alto del rectángulo
                        },
                        style: {
                          stroke: d.color,
                          lineWidth: 4, // Aumenta el grosor del borde del rectángulo
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

export default SaludEducacion
