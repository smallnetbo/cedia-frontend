import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
type EChartsOption = echarts.EChartsOption

const BarVerticalType: React.FC = () => {
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )
  useEffect(() => {
    if (!chartInstance) {
      const chart = echarts.init(document.getElementById('barVertical')!)

      const option: EChartsOption = {
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
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
            barWidth: '60%',
            data: [10, 52, 200, 334, 390, 330, 220],
            itemStyle: {
              // obtener colores de tabla Items
              color: function (params) {
                var colorList = [
                  '#c23531',
                  '#2f4554',
                  '#61a0a8',
                  '#d48265',
                  '#749f83',
                  '#ca8622',
                  '#bda29a',
                ]
                return colorList[params.dataIndex]
              },
            },
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

  return <div id="barVertical" style={{ width: '100%', height: '100%' }} />
}

export default BarVerticalType
