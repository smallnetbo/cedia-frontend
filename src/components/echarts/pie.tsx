import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { DatoRegistro } from '@/app/datosGenerales/types/datosGeneralesType'
type EChartsOption = echarts.EChartsOption

interface ChartPieProps {
  data: {
    name: string
    data: { datoRegistro: DatoRegistro }[]
  }[]
  title: string
  subTitle: string
}

const ChartPie: React.FC<ChartPieProps> = ({ data, title, subTitle }) => {
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

      const formattedData = data.map((item) => ({
        name: item.name,
        value: parseFloat(item.data[0].datoRegistro.ejecucion),
      }))

      const option: EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
        },

        series: [
          {
            //name: 'Access From',
            type: 'pie',
            radius: '50%',
            data: formattedData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }

      chartInstance.setOption(option)
    }
  }, [chartInstance, data, title, subTitle])

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default ChartPie
