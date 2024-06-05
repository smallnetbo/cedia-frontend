import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import boliviaGeo from '../map/municipioGEO.json' // Archivo JSON con los datos de geometría de los municipios de Bolivia

const MapChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    // Cargar los datos del mapa de Bolivia
    echarts.registerMap('bolivia', boliviaGeo)

    // Procesar los datos para la serie de datos del gráfico
    const seriesData = boliviaGeo.features.map((feature: any) => ({
      name: `${feature.properties.municipio}, ${feature.properties.nom_dpto}`,
      value: 15, // Valor ficticio, puedes cambiarlo según tus necesidades
    }))
    console.log('🚀🚀🚀 : seriesData', seriesData)

    const option: echarts.EChartsOption = {
      title: {
        text: 'Mapa de Municipios de Bolivia',
        left: 'center',
        top: 'top',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}',
      },
      series: [
        {
          name: 'Municipios',
          type: 'map',
          mapType: 'bolivia', // Utilizar el mapa personalizado de Bolivia
          selectedMode: 'single',
          label: {
            show: true,
          },
          itemStyle: {
            areaColor: '#f3f3f3',
            borderColor: '#999',
          },
          data: seriesData, // Utilizar los datos procesados
        },
      ],
    }

    chart.setOption(option)
    setChartInstance(chart)

    return () => {
      chart.dispose()
    }
  }, [])

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '600px' }} />
  )
}

export default MapChart
