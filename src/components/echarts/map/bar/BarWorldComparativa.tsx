/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import { getResponsiveFontSize } from '../data/PaperResponsive'

interface BarWorldPopulationProps {
  data:
    | {
        [key: string]: {
          name: string
          data: ChartData[]
        }[]
      }
    | {
        name: string
        data: ChartData[]
      }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const BarWorldComparativa: React.FC<BarWorldPopulationProps> = ({
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

      // Determina el formato de los datos
      const isGroupedData =
        Array.isArray(data) &&
        typeof (data as any)[0] === 'object' &&
        'data' in (data as any)[0]

      const entityNames = isGroupedData
        ? (data as { name: string; data: ChartData[] }[]).map(
            (serie) => serie.name
          )
        : Object.values(data).flatMap((entities) =>
            entities.map((entity: any) => entity.name)
          )

      // Obtén todas las categorías únicas (nombre) de los datos
      const categories = isGroupedData
        ? Array.from(
            new Set(
              (data as { name: string; data: ChartData[] }[]).flatMap((serie) =>
                serie.data.map((item) => item.nombre)
              )
            )
          )
        : Array.from(
            new Set(
              Object.values(data).flatMap((entities) =>
                entities.flatMap((entity: any) =>
                  entity.data.map((d: any) => d.nombre)
                )
              )
            )
          )

      // Configura las series de datos para el gráfico
      const series = isGroupedData
        ? categories.map((category) => ({
            name: category,
            type: 'bar',
            data: (data as { name: string; data: ChartData[] }[]).map(
              (serie) => {
                const item = serie.data.find((d) => d.nombre === category)
                return {
                  value:
                    item && typeof item.valor === 'number' ? item.valor : 0,
                  itemStyle: { color: item?.color ?? '#000' },
                  name: serie.name,
                }
              }
            ),
            label: {
              show: true,
              position: 'right',
              fontSize: getResponsiveFontSize(10),
              formatter: (params: any) =>
                typeof params.value === 'number'
                  ? params.value.toLocaleString()
                  : params.value,
            },
          }))
        : categories.map((category) => ({
            name: category,
            type: 'bar',
            data: Object.keys(data).flatMap((key) =>
              (
                data as { [key: string]: { name: string; data: ChartData[] }[] }
              )[key].map((entity) => {
                const item = entity.data.find((d) => d.nombre === category)
                return {
                  value:
                    item && typeof item.valor === 'number' ? item.valor : 0,
                  itemStyle: { color: item?.color ?? '#000' },
                  name: entity.name,
                }
              })
            ),
            label: {
              show: true,
              position: 'right',
              fontSize: getResponsiveFontSize(10),
              formatter: (params: any) =>
                typeof params.value === 'number'
                  ? params.value.toLocaleString()
                  : params.value,
            },
          }))

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
          subtextStyle: {
            fontSize: getResponsiveFontSize(11),
            fontWeight: 'normal',
            overflow: 'truncate',
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
          type: 'value',
        },
        yAxis: {
          type: 'category',
          data: entityNames,
          axisLabel: {
            interval: 0,
            fontSize: getResponsiveFontSize(9),
            rotate: entityNames.length > 10 ? 30 : 0,
            overflow: 'truncate',
            formatter: (value: string) => {
              const maxLength = 15
              return value.length > maxLength
                ? `${value.slice(0, maxLength)}...`
                : value
            },
          },
          inverse: true,
        },
        series: series as echarts.SeriesOption[],
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

export default BarWorldComparativa
