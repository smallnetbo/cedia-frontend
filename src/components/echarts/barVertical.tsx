import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { DatoRegistro } from '@/app/datosGenerales/types/datosGeneralesType'

type EChartsOption = echarts.EChartsOption

interface VerticalBarChartProps {
  data: {
    name: string
    data: { datoRegistro: DatoRegistro }[]
  }[]
  title: string
  subTitle: string
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  title,
  subTitle,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize()
      }
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      if (chartInstance) {
        chartInstance.dispose()
      }
    }
  }, [chartInstance])

  useEffect(() => {
    if (!chartInstance && chartContainerRef.current) {
      const chart = echarts.init(chartContainerRef.current)
      setChartInstance(chart)
    }

    return () => {
      if (chartInstance) {
        chartInstance.dispose()
      }
    }
  }, [chartInstance])

  useEffect(() => {
    if (chartInstance && chartContainerRef.current) {
      if (data.length === 0) {
        chartInstance.clear()
        return
      }

      // Formatea los datos para la serie
      const nombreBarra = data.flatMap((item) =>
        item.data.map((subItem) => subItem.datoRegistro.recurso)
      )

      const ejecuciones = data.flatMap((item) =>
        item.data.map((innerItem) =>
          parseFloat(innerItem.datoRegistro.ejecucion)
        )
      )

      const option: EChartsOption = {
        title: {
          text: title,
          subtext: subTitle,
          left: 'center',
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
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: nombreBarra,
          axisTick: {
            alignWithLabel: true,
          },
        },
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: '',
            type: 'bar',
            barWidth: '60%',
            data: ejecuciones,
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
        backgroundColor: 'white',
      }

      chartInstance.setOption(option)
    }
  }, [chartInstance, data, title, subTitle])

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default VerticalBarChart

/* comparativa */

// import React, { useEffect, useRef, useState } from 'react'
// import * as echarts from 'echarts'
// import { DatoRegistro } from '@/app/datosGenerales/types/datosGeneralesType'

// type EChartsOption = echarts.EChartsOption

// interface VerticalBarChartProps {
//   data: {
//     name: string
//     data: { datoRegistro: DatoRegistro }[]
//   }[]
//   title: string
//   subTitle: string
// }

// const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
//   data,
//   title,
//   subTitle,
// }) => {
//   console.log('🚀🚀🚀 : data', JSON.stringify(data))
//   const chartContainerRef = useRef<HTMLDivElement | null>(null)
//   const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
//     null
//   )

//   useEffect(() => {
//     if (!chartContainerRef.current) return

//     const handleResize = () => {
//       if (chartInstance) {
//         chartInstance.resize()
//       }
//     }

//     const resizeObserver = new ResizeObserver(handleResize)
//     resizeObserver.observe(chartContainerRef.current)

//     return () => {
//       resizeObserver.disconnect()
//       if (chartInstance) {
//         chartInstance.dispose()
//       }
//     }
//   }, [chartInstance])

//   useEffect(() => {
//     if (!chartInstance && chartContainerRef.current) {
//       const chart = echarts.init(chartContainerRef.current)
//       setChartInstance(chart)
//     }

//     return () => {
//       if (chartInstance) {
//         chartInstance.dispose()
//       }
//     }
//   }, [chartInstance])

//   useEffect(() => {
//     if (chartInstance && chartContainerRef.current) {
//       if (data.length === 0) {
//         chartInstance.clear()
//         return
//       }

//       // Agrupar los datos por recurso
//       const groupedData = data.reduce<{ [key: string]: number[] }>(
//         (acc, item) => {
//           item.data.forEach((subItem) => {
//             const resource = subItem.datoRegistro.recurso
//             const value = parseFloat(subItem.datoRegistro.ejecucion)
//             if (!acc[resource]) {
//               acc[resource] = []
//             }
//             acc[resource].push(value)
//           })
//           return acc
//         },
//         {}
//       )

//       // Obtener nombres únicos de los recursos
//       const resources = Object.keys(groupedData)

//       const seriesData = resources.map((resource) => ({
//         name: resource,
//         type: 'bar',
//         data: groupedData[resource],
//       }))

//       const option: EChartsOption = {
//         title: {
//           text: title,
//           subtext: subTitle,
//           left: 'center',
//         },
//         tooltip: {
//           trigger: 'axis',
//           axisPointer: {
//             type: 'shadow',
//           },
//         },
//         legend: {
//           data: resources,
//         },
//         grid: {
//           left: '3%',
//           right: '4%',
//           bottom: '3%',
//           containLabel: true,
//         },
//         xAxis: {
//           type: 'category',
//           data: Array.from({
//             length: Math.max(
//               ...resources.map((resource) => groupedData[resource].length)
//             ),
//           }).map((_, index) => `${index + 1}`),
//           axisTick: {
//             alignWithLabel: true,
//           },
//         },
//         yAxis: {
//           type: 'value',
//         },
//         series: seriesData,
//       }

//       chartInstance.setOption(option)
//     }
//   }, [chartInstance, data, title, subTitle])

//   return (
//     <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
//   )
// }

// export default VerticalBarChart
