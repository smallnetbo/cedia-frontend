import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'

const PieDoughnutTotalChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      if (!chart) return

      // Datos fijos
      const data = [
        {
          name: 'HOMBRES',
          value: 15,
          itemStyle: { color: '#c37f0d' },
        },
        {
          name: 'MUJERES',
          value: 5,
          itemStyle: { color: '#ac07c9' },
        },
      ]

      const totalGlobal = data.reduce((sum, item) => sum + item.value, 0)

      const option: echarts.EChartsOption = {
        title: {
          text: 'Distribución por Género',
          subtext: 'Total de personas',
          left: 'center',
          top: '1%',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#666',
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        series: [
          {
            name: 'Distribución por Género',
            type: 'pie',
            radius: ['30%', '60%'],
            center: ['50%', '60%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              formatter: '{b}: {c} ({d}%)',
              fontSize: 8,
              fontWeight: 'bold',
              color: '#333',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold',
                color: '#000',
              },
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2,
              },
            },
            labelLine: {
              show: true,
            },
            data: data,
          },
        ] as unknown as echarts.SeriesOption[],
        graphic: {
          elements: [
            {
              type: 'text',
              left: 'center',
              top: '55%',
              style: {
                text: `${totalGlobal}`,
                fill: '#000',
                fontSize: 40,
                fontWeight: 'bolder',
              },
            },
          ],
        },
        backgroundColor: 'white',
      }

      chart.setOption(option)
    }

    setChartInstance(chart)
    updateChart()

    return () => {
      if (chart) {
        chart.dispose()
      }
    }
  }, [])

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

export default PieDoughnutTotalChart
