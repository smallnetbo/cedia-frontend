import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'

interface PieDoughnutTotalChartProps {
  data: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const PieDoughnutTotalChart: React.FC<PieDoughnutTotalChartProps> = ({
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

      const totalHombres = data
        .flatMap((serie) => serie.data)
        .filter((item) => item.nombre === 'HOMBRE')
        .reduce((sum, item) => sum + Number(item.valor), 0)

      const totalMujeres = data
        .flatMap((serie) => serie.data)
        .filter((item) => item.nombre === 'MUJER')
        .reduce((sum, item) => sum + Number(item.valor), 0)

      const totalGlobal = totalHombres + totalMujeres

      const formattedData = [
        {
          name: 'HOMBRE',
          value: totalHombres,
          itemStyle: { color: '#c37f0d' },
        },
        { name: 'MUJER', value: totalMujeres, itemStyle: { color: '#ac07c9' } },
      ]

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
          top: '1%',
          textStyle: {
            fontSize: 20,
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: 16,
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
            name: title,
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '60%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              formatter: '{b}: {c} ({d}%)',
              fontSize: 19,
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
            data: formattedData,
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
                fontSize: 70,
                fontWeight: 'bolder',
              },
            },
          ],
        },
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

export default PieDoughnutTotalChart
