/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import { Typography } from '@mui/material'
import { getResponsiveFontSize } from '../data/PaperResponsive'

interface ChartLineProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const LineStackedChart: React.FC<ChartLineProps> = ({
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
              type: 'line',
              data: data.map((serie) => ({
                value: serie.data[0].valor,
                itemStyle: { color: serie.data[0].color ?? '#000' },
              })),
              label: {
                show: true,
                position: 'top',
                fontSize: getResponsiveFontSize(10),
                formatter: (params: any) =>
                  typeof params.value === 'number'
                    ? params.value.toLocaleString()
                    : params.value,
              },
            },
          ]
        : categories.map((resource) => {
            return {
              name: resource,
              type: 'line',
              data: data.map((serie) => {
                const item = serie.data.find((d) => d.nombre === resource)
                return item && typeof item.valor === 'number' ? item.valor : 0
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
                position: 'top',
                fontSize: getResponsiveFontSize(10),
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
          top: '2%',
          textStyle: {
            fontSize: getResponsiveFontSize(12),
            fontWeight: 'bold',
            overflow: 'truncate',
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        // legend: {
        //   data: resourceTypes,
        //   top: '10%',
        //   formatter: (name) => {
        //     const item = data
        //       .flatMap((serie) => serie.data)
        //       .find((d) => d.nombre === name)

        //     if (window.innerWidth <= 768) {
        //       return `{rect|}`
        //     } else {
        //       return item ? `{${name}|${name}}` : `{rect|}`
        //     }
        //   },
        //   textStyle: {
        //     rich: {
        //       ...Object.fromEntries(
        //         Object.entries(richColors).map(([name, style]) => [
        //           name,
        //           { color: style.color },
        //         ])
        //       ),
        //       rect: {
        //         width: 12,
        //         height: 12,
        //       },
        //     },
        //   },
        // },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: data.map((serie) => serie.name),
          axisLabel: {
            interval: 0,
          },
        },
        yAxis: {
          type: 'value',
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

export default LineStackedChart
