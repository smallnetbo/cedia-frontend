import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'

const BarWorldComparativa: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const fixedData = [
      {
        name: 'La Paz',
        data: [{ nombre: 'Escuelas', valor: 5, color: '#1f77b4' }],
      },
      {
        name: 'Beni',
        data: [{ nombre: 'Escuelas', valor: 8, color: '#d62728' }],
      },
    ]

    const title = 'Comparativa General'
    const subTitle = 'Ej: por departamento'

    const updateChart = () => {
      if (!chart) return

      const entityNames = fixedData.map((serie) => serie.name)

      const categories = Array.from(
        new Set(
          fixedData.flatMap((serie) => serie.data.map((item) => item.nombre))
        )
      )

      const series = categories.map((category) => ({
        name: category,
        type: 'bar',
        data: fixedData.map((serie) => {
          const item = serie.data.find((d) => d.nombre === category)
          return {
            value: item && typeof item.valor === 'number' ? item.valor : 0,
            itemStyle: { color: item?.color ?? '#000' },
            name: serie.name,
          }
        }),
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) =>
            typeof params.value === 'number'
              ? params.value.toFixed(2)
              : params.value,
        },
      }))

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          top: '1%',
          textStyle: {
            fontSize: 12,
          },
          subtextStyle: {
            fontSize: 8,
          },
        },
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
          top: '20%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'category',
          data: entityNames,
          axisLabel: {
            interval: 0,
            fontSize: 13,
          },
          inverse: true,
        },
        series: series as echarts.SeriesOption[],
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

export default BarWorldComparativa
