import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
type EChartsOption = echarts.EChartsOption

const BarHorizontalType: React.FC = () => {
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )
  useEffect(() => {
    if (!chartInstance) {
      const chart = echarts.init(document.getElementById('barHorizontal')!)

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
        xAxis: {
          type: 'value',
        },
        yAxis: [
          {
            type: 'category',
            data: ['Barra 1', 'Barra 2', 'Barra 3', 'Barra 4', 'Barra 5'],
            axisTick: {
              alignWithLabel: true,
            },
            inverse: true,
            axisLabel: {
              align: 'right',
              margin: 5,
            },
          },
        ],
        series: [
          {
            name: '',
            type: 'bar',
            barWidth: '60%',
            data: [10, 52, 200, 334, 390],
            itemStyle: {
              color: function (params) {
                var colorList = [
                  '#c23531',
                  '#2f4554',
                  '#61a0a8',
                  '#d48265',
                  '#749f83',
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

  return <div id="barHorizontal" style={{ width: '100%', height: '100%' }} />
}

export default BarHorizontalType
