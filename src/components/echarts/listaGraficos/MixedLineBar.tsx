/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'

const MixedLineBar: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  const data = [
    {
      name: '2022',
      data: [{ nombre: '2022', valor: 2.71, color: '#1b083d', icono: '360' }],
    },
    {
      name: '2012',
      data: [
        { nombre: '2012', valor: 2.95, color: '#21b6a3', icono: '1k_plus' },
      ],
    },
    {
      name: '2013',
      data: [
        {
          nombre: '2013',
          valor: 2.69,
          color: '#0e8b26',
          icono: '18_up_rating',
        },
      ],
    },
    {
      name: '2014',
      data: [
        { nombre: '2014', valor: 3.39, color: '#15685d', icono: '3k_plus' },
      ],
    },
    {
      name: '2015',
      data: [
        { nombre: '2015', valor: 2, color: '#42700c', icono: 'add_to_queue' },
      ],
    },
    {
      name: '2016',
      data: [{ nombre: '2016', valor: 2.36, color: '#6b3b12', icono: '30fps' }],
    },
    {
      name: '2017',
      data: [
        {
          nombre: '2017',
          valor: 1.23,
          color: '#0f5848',
          icono: '1x_mobiledata',
        },
      ],
    },
    {
      name: '2018',
      data: [
        {
          nombre: '2018',
          valor: 1.67,
          color: '#0c4b3d',
          icono: 'add_to_queue',
        },
      ],
    },
    {
      name: '2019',
      data: [
        { nombre: '2019', valor: 4.52, color: '#034ea5', icono: '2k_plus' },
      ],
    },
    {
      name: '2020',
      data: [
        {
          nombre: '2020',
          valor: 2.16,
          color: '#821099',
          icono: 'format_align_justify',
        },
      ],
    },
    {
      name: '2021',
      data: [
        {
          nombre: '2021',
          valor: 1.44,
          color: '#1f3532',
          icono: 'add_to_queue',
        },
      ],
    },
    {
      name: '2011',
      data: [
        { nombre: '2011', valor: 2.33, color: '#385c57', icono: '2k_plus' },
      ],
    },
  ]

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      if (!chart) return

      const categories = data.map((serie) => serie.name)
      const values = data.map((serie) => serie.data[0].valor)
      const colors = data.map((serie) => serie.data[0].color)

      const option: echarts.EChartsOption = {
        title: {
          text: 'Gráfico de Barras y Línea',

          left: 'center',
          top: '1%',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999',
            },
          },
        },
        xAxis: [
          {
            type: 'category',
            data: categories,
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Valores',
            min: 0,
            max: Math.ceil(Math.max(...values)),
            interval: 1,
            axisLabel: {
              formatter: '{value}',
            },
          },
        ],
        series: [
          {
            name: 'Valores',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value: any) {
                return value as number
              },
            },
            data: values,
            itemStyle: {
              color: (params: any) => colors[params.dataIndex],
            },
          },
          {
            name: 'Línea',
            type: 'line',
            tooltip: {
              valueFormatter: function (value: any) {
                return value as number
              },
            },
            data: values,
            itemStyle: {
              color: '#ff4500',
            },
            smooth: true,
            lineStyle: {
              width: 2,
            },
          },
        ] as unknown as echarts.SeriesOption[],
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

export default MixedLineBar
