import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
type EChartsOption = echarts.EChartsOption

const PieDoughnutChart: React.FC = () => {
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )
  useEffect(() => {
    if (!chartInstance) {
      const chart = echarts.init(document.getElementById('PieDoughnutChart')!)

      const option: EChartsOption = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: '5%',
          left: 'center',
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: 1048, name: 'Search Engine' },
              { value: 735, name: 'Direct' },
              { value: 580, name: 'Email' },
              { value: 484, name: 'Union Ads' },
              { value: 300, name: 'Video Ads' },
            ],
          },
        ],
      }

      chart.setOption(option)

      setChartInstance(chart)
    }
  }, [chartInstance])

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

  return <div id="PieDoughnutChart" style={{ width: '100%', height: '100%' }} />
}

export default PieDoughnutChart
