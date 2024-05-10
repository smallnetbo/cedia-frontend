import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { DatoRegistro } from '@/app/datosGenerales/types/datosGeneralesType'

type EChartsOption = echarts.EChartsOption

interface ChartLineProps {
  data: {
    name: string
    data: { datoRegistro: DatoRegistro }[]
  }[]
  title: string
  subTitle: string
}

const ChartLine: React.FC<ChartLineProps> = ({ data, title, subTitle }) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize()
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      if (chartInstance) {
        chartInstance.dispose()
      }
    }
  }, [chartInstance])

  useEffect(() => {
    if (!chartInstance && chartContainerRef.current) {
      const chart = echarts.init(chartContainerRef.current)
      setChartInstance(chart)
    }

    return () => {
      if (chartInstance) {
        chartInstance.dispose()
      }
    }
  }, [chartInstance])

  useEffect(() => {
    if (chartInstance && chartContainerRef.current) {
      if (data.length === 0) {
        chartInstance.clear()
        return
      }

      const xAxisData = data.map((item) => item.name)
      const recursosUnicos = Array.from(
        new Set(
          data.flatMap((serie) =>
            serie.data.map((item) => item.datoRegistro.recurso)
          )
        )
      )

      const series = recursosUnicos.map((recurso) => {
        return {
          name: recurso,
          type: 'line',
          stack: 'Total',
          data: data.map((serie) => {
            const dato = serie.data.find(
              (item) => item.datoRegistro.recurso === recurso
            )
            return dato ? parseFloat(dato.datoRegistro.ejecucion) : 0
          }),
        }
      })

      const option: EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },

        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
        },
        yAxis: {
          type: 'value',
        },
        series: series,
      }

      chartInstance.setOption(option)
    }
  }, [chartInstance, data, title, subTitle])

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default ChartLine
