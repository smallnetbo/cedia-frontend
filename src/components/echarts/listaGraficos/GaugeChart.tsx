import React, { useEffect, useRef, useState, useLayoutEffect } from 'react'
import * as echarts from 'echarts'

// Datos fijos simulados
const fixedData = {
  '9': [
    {
      name: '2011',
      data: [
        {
          nombre: 'PEJE_MMBs',
          valor: 6.12345846000001,
          color: '#1a4138',
          icono: '1x_mobiledata',
        },
        {
          nombre: 'PPTO_EJEC',
          valor: 6.12345846000001,
          color: '#43691a',
          icono: '3g_mobiledata',
        },
        {
          nombre: 'PPTO_VIGENTE',
          valor: 9.88425246,
          color: '#4b1257',
          icono: 'access_time',
        },
        {
          nombre: 'PORCENTAJE_EJEC',
          valor: 0.619516598223353,
          color: '#03312c',
          icono: 'equalizer',
        },
      ],
    },
    {
      name: '2012',
      data: [
        {
          nombre: 'PEJE_MMBs',
          valor: 8.12345846000001,
          color: '#1a4138',
          icono: '1x_mobiledata',
        },
        {
          nombre: 'PPTO_EJEC',
          valor: 8.12345846000001,
          color: '#43691a',
          icono: '3g_mobiledata',
        },
        {
          nombre: 'PPTO_VIGENTE',
          valor: 15.88425246,
          color: '#4b1257',
          icono: 'access_time',
        },
        {
          nombre: 'PORCENTAJE_EJEC',
          valor: 0.819516598223353,
          color: '#03312c',
          icono: 'equalizer',
        },
      ],
    },
  ],
}

const GaugeChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartInstance, setChartInstance] = useState<echarts.ECharts | null>(
    null
  )

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current)

    const updateChart = () => {
      const data = fixedData['9'] // Usamos los datos fijos aquí
      const columnCount = Math.min(data.length, 3) // Para manejar 2 gráficos
      const series = data.map((agrupador, index) => {
        const valores = agrupador.data.map((item) => item.valor)
        const numericValores = valores
          .map((valor) =>
            typeof valor === 'string' ? parseFloat(valor) : valor
          )
          .filter((valor) => typeof valor === 'number' && !isNaN(valor))

        const valorMaximo = Math.max(...numericValores)
        const valorPptoEjec = agrupador.data.find(
          (item) => item.nombre === 'PPTO_EJEC'
        )?.valor
        const valorAguja =
          valorPptoEjec !== undefined
            ? Number(valorPptoEjec)
            : Math.min(...numericValores)
        const porcentajeValue = ((valorAguja / valorMaximo) * 100).toFixed(2)
        const colores = agrupador.data.map((item) => item.color)

        return {
          type: 'gauge',
          center: [
            `${(index % columnCount) * (100 / columnCount) + 100 / (columnCount * 2)}%`,
            `${Math.floor(index / columnCount) * 50 + 50}%`,
          ],
          radius: '55%',
          max: valorMaximo.toFixed(2),
          progress: {
            show: true,
            width: 10,
          },
          axisLine: {
            lineStyle: {
              width: 10,
              color: colores.map((color, i) => [
                (i + 1) / colores.length,
                color,
              ]),
            },
          },
          axisTick: { show: false },
          splitLine: {
            length: 5,
            lineStyle: { width: 2, color: '#999' },
          },
          axisLabel: {
            distance: 20,
            color: '#333',
            fontSize: 12,
            formatter: (value: any) => value.toFixed(0),
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 15,
            itemStyle: { borderWidth: 6, borderColor: '#333' },
          },
          title: { show: false },
          detail: {
            show: true,
            formatter: () =>
              `{agrupador|${agrupador.name}}\n{ppEjecutado|PPTO. EJEC.: ${valorAguja.toFixed(2)} (${porcentajeValue}%) }\n{ppVigente|PPTO. VIGENTE: ${valorMaximo.toFixed(2)}}`,
            rich: {
              agrupador: {
                fontSize: 16,
                color: '#2c3e50',
                fontWeight: 'bold',
                lineHeight: 24,
                backgroundColor: '#ecf0f1',
                padding: [4, 6],
                borderRadius: 4,
              },
              ppEjecutado: {
                fontSize: 14,
                color: '#2980b9',
                fontWeight: 'bold',
                lineHeight: 20,
                backgroundColor: '#d5dbdb',
                padding: [4, 6],
                borderRadius: 4,
              },
              ppVigente: {
                fontSize: 14,
                color: '#27ae60',
                fontWeight: 'bold',
                lineHeight: 20,
                backgroundColor: '#d5dbdb',
                padding: [4, 6],
                borderRadius: 4,
              },
            },
            offsetCenter: [0, '80%'],
          },
          data: [{ value: valorAguja }],
        }
      })

      const option: echarts.EChartsOption = {
        title: {
          text: 'Gráfico Gauge Fijo',
          subtext: 'Datos Fijos',
          left: 'center',
          top: '1%',
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const valorAguja = params.data.value
            const valorMaximo = params.max
            const porcentajeValue = ((valorAguja / valorMaximo) * 100).toFixed(
              2
            )
            return `Valor: ${valorAguja} (${porcentajeValue}%)`
          },
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
    return () => window.removeEventListener('resize', handleResize)
  }, [chartInstance])

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default GaugeChart
