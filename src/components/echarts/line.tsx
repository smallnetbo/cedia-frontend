import React, { useEffect, useState } from 'react'
import * as echarts from 'echarts'
type EChartsOption = echarts.EChartsOption

interface ChartLineProps {
  data: {
    anio: string
    name: string
    type: string
    stack: string
    data: number[]
  }[]
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
        xAxis: {
          type: 'category',
          boundaryGap: false,
          // Aquí necesitas proporcionar las etiquetas para el eje X, por ejemplo, los nombres de los días
          data: data.map((item) => item.anio),
        },
        yAxis: {
          type: 'value',
        },
        series: data.map((seriesItem) => ({
          name: seriesItem.name,
          type: 'line',
          stack: 'Total',
          data: seriesItem.data,
        })),
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
