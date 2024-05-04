import React, { useEffect, useState } from 'react'
import * as echarts from 'echarts'
type EChartsOption = echarts.EChartsOption

interface ChartBarProps {
  data: { value: number; name: string }[]
  title: string
  subTitle: string
}

const ChartBar: React.FC<ChartBarProps> = ({ data, title, subTitle }) => {
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )
  useEffect(() => {
    if (!chartInstance) {
      // Inicializa el gráfico solo si aún no está inicializado
      const chart = echarts.init(document.getElementById('bar')!)

      const option: EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: data.map((item) => item.name),
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: 'Direct',
            type: 'bar',
            barWidth: '30%',
            data: data.map((item) => item.value),
          },
        ],
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

  return <div id="bar" style={{ width: '100%', height: '100%' }} />
}

export default ChartBar
