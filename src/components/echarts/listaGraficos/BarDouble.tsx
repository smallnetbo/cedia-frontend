import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'

interface DataGroup {
  name: string
  data: { nombre: string; valor: number; color: string }[]
}

const BarDouble: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  const data: DataGroup[] = [
    {
      name: 'Group 1',
      data: [
        { nombre: 'Category A', valor: 10, color: '#5470C6' },
        { nombre: 'Category B', valor: 20, color: '#91CC75' },
        { nombre: 'Category C', valor: 30, color: '#FAC858' },
      ],
    },
    {
      name: 'Group 2',
      data: [
        { nombre: 'Category D', valor: 15, color: '#EE6666' },
        { nombre: 'Category E', valor: 25, color: '#73C0DE' },
        { nombre: 'Category F', valor: 35, color: '#3BA272' },
      ],
    },
  ]

  useEffect(() => {
    if (!chartContainerRef.current) return
    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      if (!chart) return

      // Split data into two groups
      const midIndex = Math.ceil(data.length / 2)
      const firstGroup = data.slice(0, midIndex)
      const secondGroup = data.slice(midIndex)

      const createSeries = (groupData: DataGroup[]) => {
        const categories = Array.from(
          new Set(
            groupData.flatMap((serie) => serie.data.map((item) => item.nombre))
          )
        )

        return categories.map((category) => ({
          name: category,
          type: 'bar',
          stack: 'total',
          data: groupData.map((serie) => {
            const item = serie.data.find((d) => d.nombre === category)
            return item ? item.valor : 0
          }),
          itemStyle: {
            color:
              groupData
                .find((serie) => serie.data.find((d) => d.nombre === category))
                ?.data.find((d) => d.nombre === category)?.color ?? '#000',
          },
          label: {
            show: true,
            formatter: (params: any) => params.value.toFixed(2),
          },
        }))
      }

      const option: echarts.EChartsOption = {
        title: [
          {
            text: firstGroup[0].name,
            left: 'center',
            top: '10%',
            textStyle: {
              fontSize: 18,
              fontWeight: 'bold',
            },
          },
          {
            text: secondGroup[0]?.name,
            left: 'center',
            top: '55%',
            textStyle: {
              fontSize: 18,
              fontWeight: 'bold',
            },
          },
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: [
          {
            left: '10%',
            right: '10%',
            top: '15%',
            bottom: '55%',
            containLabel: true,
          },
          {
            left: '10%',
            right: '10%',
            top: '60%',
            bottom: '10%',
            containLabel: true,
          },
        ],
        xAxis: [
          {
            type: 'value',
            gridIndex: 0,
            axisLabel: {
              formatter: '{value}',
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            min: 0,
          },
          {
            type: 'value',
            gridIndex: 1,
            axisLabel: {
              formatter: '{value}',
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            min: 0,
          },
        ],
        yAxis: [
          {
            type: 'category',
            data: firstGroup.flatMap((serie) => serie.name),
            gridIndex: 0,
            axisLabel: {
              interval: 0,
              fontSize: 9,
              formatter: (value: string) => value.replace(/_/g, '\n'),
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
          },
          {
            type: 'category',
            data: secondGroup.flatMap((serie) => serie.name),
            gridIndex: 1,
            axisLabel: {
              interval: 0,
              fontSize: 9,
              formatter: (value: string) => value.replace(/_/g, '\n'),
            },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
          },
        ],
        series: [
          ...createSeries(firstGroup).map((serie) => ({
            ...serie,
            xAxisIndex: 0,
            yAxisIndex: 0,
          })),
          ...createSeries(secondGroup).map((serie) => ({
            ...serie,
            xAxisIndex: 1,
            yAxisIndex: 1,
          })),
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

export default BarDouble
