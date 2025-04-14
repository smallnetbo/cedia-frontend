import { FC, useEffect } from 'react'
import { init, EChartsOption, SeriesOption } from 'echarts'
import { Box } from '@mui/material'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import { useThemeContext } from '@/themes/ThemeRegistry'

interface HorizontalBarType {
  id: string
  titulo?: string
  subTitulo?: string
  datos?: {
    name: string
    data: ChartData[]
  }[]
  muestra?: Boolean

  onExport?: (image: string) => void
}

const HorizontalBarChart: FC<HorizontalBarType> = ({
  id,
  datos,
  titulo,
  subTitulo,
  muestra = false,
}) => {
  const datosMuestra = [
    {
      name: '2024',
      data: [
        { nombre: 'Brazil', valor: 18203, color: '#FF5733' },
        { nombre: 'USA', valor: 29034, color: '#3357FF' },
        { nombre: 'Bolivia', valor: 23489, color: '#33FF57' },
      ],
    },
    {
      name: '2025',
      data: [
        { nombre: 'Brazil', valor: 19325, color: '#FF8D33' },
        { nombre: 'USA', valor: 31000, color: '#338DFF' },
        { nombre: 'Bolivia', valor: 23438, color: '#33FF8D' },
      ],
    },
  ]
  const { themeMode } = useThemeContext()
  if (muestra) {
    datos = datosMuestra
  }
  const series: SeriesOption[] = datos
    ? datos?.map((serie) => ({
        name: serie.name,
        type: 'bar',
        data: serie.data?.map((item) => ({
          value: item.valor,
          itemStyle: {
            color: item.color,
          },
        })),
      }))
    : []

  const option: EChartsOption = {
    //TODO: quitar el fondo cuando se use el card
    backgroundColor: 'white',

    title: {
      text: muestra ? 'GRAFICO DE BARRAS HORIZONTAL' : titulo?.toUpperCase(),
      subtext: !muestra ? subTitulo : '',
      left: 'center',
      textStyle: {
        fontSize: 12,
        fontWeight: 600,
      },
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: { show: true, title: 'Guardar imagen' },
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
      bottom: '10%',
      containLabel: true,
    },

    legend: { bottom: 0 },

    xAxis: {
      show: true,
      nameLocation: 'middle',
      type: 'value',
      nameGap: 30,
      nameTextStyle: {
        align: 'center',
        fontSize: 12,
        fontWeight: 500,
      },
    },
    yAxis: {
      type: 'category',
      data:
        datos &&
        datos[0]?.data.map((dato) => dato.nombre.split(' ').join('\n')),

      axisLine: {
        show: !!datos?.length,
      },
      nameTextStyle: {},
    },

    series: series.map((serie) => ({
      ...serie,
      label: {
        show: true,
        position: 'right',
        fontSize: 10,
      },
    })) as SeriesOption[],

    graphic:
      datos?.length === 0
        ? [
            {
              type: 'text',
              left: 'center',
              top: 'center',
              style: {
                text: 'No hay datos disponibles',
                fontSize: 20,
                fontWeight: 'bold',
                fill: '#999',
              },
            },
          ]
        : [],
  }

  useEffect(() => {
    const chartDom = document.getElementById(id)
    if (chartDom) {
      const myChart = init(chartDom, themeMode.toString())
      myChart.setOption(option)

      const resizeObserver = new ResizeObserver(() => {
        myChart.resize()
      })
      resizeObserver.observe(chartDom)

      return () => {
        resizeObserver.unobserve(chartDom)
        myChart.dispose()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option])
  return (
    <Box
      id={id}
      bgcolor="background.paper"
      sx={{
        p: 1,
        width: '100%',
        height: '100%',
        minHeight: '400px',
      }}
    />
  )
}

export default HorizontalBarChart
