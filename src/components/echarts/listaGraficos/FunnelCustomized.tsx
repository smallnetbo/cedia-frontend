import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'

const FunnelCustomized: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      if (!chart) return

      const option: echarts.EChartsOption = {
        title: {
          text: 'Funnel',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c}%',
        },
        toolbox: {
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {},
          },
        },
        legend: {
          data: ['Show', 'Click', 'Visit', 'Inquiry', 'Order'],
        },
        series: [
          {
            name: 'Expected',
            type: 'funnel',
            left: '10%',
            width: '80%',
            label: {
              formatter: '{b}Expected',
            },
            labelLine: {
              show: false,
            },
            itemStyle: {
              opacity: 0.7,
            },
            emphasis: {
              label: {
                position: 'inside',
                formatter: '{b}Expected: {c}%',
              },
            },
            data: [
              { value: 60, name: 'Visit' },
              { value: 40, name: 'Inquiry' },
              { value: 20, name: 'Order' },
              { value: 80, name: 'Click' },
              { value: 100, name: 'Show' },
            ],
          },
          {
            name: 'Actual',
            type: 'funnel',
            left: '10%',
            width: '80%',
            maxSize: '80%',
            label: {
              position: 'inside',
              formatter: '{c}%',
              color: '#fff',
            },
            itemStyle: {
              opacity: 0.5,
              borderColor: '#fff',
              borderWidth: 2,
            },
            emphasis: {
              label: {
                position: 'inside',
                formatter: '{b}Actual: {c}%',
              },
            },
            data: [
              { value: 30, name: 'Visit' },
              { value: 10, name: 'Inquiry' },
              { value: 5, name: 'Order' },
              { value: 50, name: 'Click' },
              { value: 80, name: 'Show' },
            ],
            // Ensure outer shape will not be over inner shape when hover.
            z: 100,
          },
        ],
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
    <div
      ref={chartContainerRef}
      style={{ width: '100%', height: '100%' }}
    ></div>
  )
}

export default FunnelCustomized
