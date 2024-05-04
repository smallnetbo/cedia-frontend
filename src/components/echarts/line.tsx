import React, { useEffect, useState } from 'react'
import * as echarts from 'echarts'
type EChartsOption = echarts.EChartsOption

interface ChartLineProps {
  data: { value: number; name: string }[]
  title: string
  subTitle: string
}

const ChartLine: React.FC<ChartLineProps> = ({ data, title, subTitle }) => {
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )
  useEffect(() => {
    if (!chartInstance) {
      // Inicializa el gráfico solo si aún no está inicializado
      const chart = echarts.init(document.getElementById('line')!)

      const seriesData = data.map((item) => ({
        name: item.name,
        type: 'line',
        data: [item.value],
      }))

      const option: EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: data.map((item) => item.name),
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
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
          type: 'value',
        },
        series: seriesData,
      }

      chart.setOption(option)

      setChartInstance(chart)
    }
  }, [chartInstance])

  // Función para actualizar el tamaño del gráfico cuando cambia el tamaño del contenedor
  useEffect(() => {
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

  return <div id="line" style={{ width: '100%', height: '100%' }} />
}

export default ChartLine
