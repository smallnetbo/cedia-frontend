import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface DataGroup {
  name: string
  data: ChartData[]
}

interface BarBasicProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const BarDouble: React.FC<BarBasicProps> = ({
  data,
  title,
  subTitle,
  onExport,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return
    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      if (!chart) return

      // Dividir los datos en dos grupos para generar dos gráficos de barras
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
          stack: 'total', // Apilar las barras
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
            text: secondGroup[0].name,
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
        // legend: {},
        grid: [
          {
            left: '10%',
            right: '10%',
            top: '15%',
            bottom: '55%', // Ajuste suficiente en la parte inferior para el primer gráfico
            containLabel: true,
          },
          {
            left: '10%',
            right: '10%',
            top: '60%', // Espacio suficiente encima del segundo gráfico
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
            min: 0, // Asegúrate de que el eje X comience en 0
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
            min: 0, // Asegúrate de que el eje X comience en 0
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
            // Asegúrate de que el rango del eje Y comience en 0
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
            // Asegúrate de que el rango del eje Y comience en 0
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

      if (onExport) {
        setTimeout(() => {
          const image = chart.getDataURL({
            type: 'png',
            pixelRatio: 2,
          })
          onExport(image || '')
        }, 1100)
      }
    }

    setChartInstance(chart)
    updateChart()

    return () => {
      if (chart) {
        chart.dispose()
      }
    }
  }, [data, title, subTitle])

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
