import React, { useEffect, useState } from 'react'
import * as echarts from 'echarts'
import { DatoRegistro } from '@/app/datosGenerales/types/datosGeneralesType'

type EChartsOption = echarts.EChartsOption

interface ChartBarProps {
  data: {
    name: string
    data: { datoRegistro: DatoRegistro }[]
  }[]
  title: string
  subTitle: string
}

const ChartBar: React.FC<ChartBarProps> = ({ data, title, subTitle }) => {
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )
  console.log('data render : ' + data)
  useEffect(() => {
    if (!chartInstance) {
      const chart = echarts.init(document.getElementById('bar')!)
      setChartInstance(chart)
    }

    return () => {
      if (chartInstance) {
        chartInstance.dispose() // Limpiar el gráfico al desmontar el componente
      }
    }
  }, [chartInstance])

  useEffect(() => {
    if (chartInstance) {
      if (data.length === 0) {
        chartInstance.clear()
        return
      }

      const anios = data.map((serie) => serie.name)
      const recursosUnicos = Array.from(
        new Set(
          data.flatMap((serie) =>
            serie.data.map((item) => item.datoRegistro.recurso)
          )
        )
      )

      const series = recursosUnicos.map((recurso) => {
        return {
          name: recurso,
          type: 'bar',
          data: data.map((serie) => {
            const dato = serie.data.find(
              (item) => item.datoRegistro.recurso === recurso
            )
            return dato ? parseFloat(dato.datoRegistro.ejecucion) : 0
          }),
        }
      })

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
          textStyle: {
            fontSize: 10,
          },
          extraCssText: 'background-color: rgba(255, 255, 255, 0.8);',
          position: (point, params, dom, rect, size) => {
            const top = 5
            const left = Math.max(point[0] - size.contentSize[0] / 1, 0)
            return [left, top]
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
            data: anios,
            axisLabel: {
              interval: 0,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: series,
      }

      chartInstance?.setOption(option)
    }
  }, [chartInstance, data, title, subTitle])

  return <div id="bar" style={{ width: '100%', height: '100%' }} />
}

export default ChartBar
