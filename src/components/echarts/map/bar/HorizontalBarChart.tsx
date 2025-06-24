import { FC, useEffect } from 'react'
import { init, EChartsOption } from 'echarts'
import { Box } from '@mui/material'
import {
  ChartData
} from '@/app/datosGenerales/types/datosGeneralesType'
import { useThemeContext } from '@/themes/ThemeRegistry'

interface SerieChartData {
  nombre: string;
  datos: ChartData[];
}

interface HorizontalBarChartType {
  id: string
  titulo?: string
  subTitulo?: string
  datos?: SerieChartData[]
  muestra?: Boolean
  muestraAgrupada?: Boolean
  tendencia?: Boolean
  stack?: Boolean
}

// Mocks de ejemplo para datos de muestra
const datosMuestraSimple: SerieChartData[] = [
  {
    nombre: 'Serie 1',
    datos: [
      { nombre: 'Ejemplo 1', valor: 10, color: '#1976d2', icono: '' },
      { nombre: 'Ejemplo 2', valor: 20, color: '#388e3c', icono: '' },
    ],
  },
]

const datosMuestraAgrupado: SerieChartData[] = [
  {
    nombre: 'Grupo A',
    datos: [
      { nombre: 'A1', valor: 15, color: '#fbc02d', icono: '' },
      { nombre: 'A2', valor: 25, color: '#d32f2f', icono: '' },
    ],
  },
  {
    nombre: 'Grupo B',
    datos: [
      { nombre: 'B1', valor: 12, color: '#1976d2', icono: '' },
      { nombre: 'B2', valor: 18, color: '#388e3c', icono: '' },
    ],
  },
]

const HorizontalBarChart: FC<HorizontalBarChartType> = ({
  id,
  titulo,
  subTitulo,
  datos,
  muestra = false,
  muestraAgrupada = false,
  tendencia = false,
  stack = false,
}) => {
  const { themeMode } = useThemeContext()

  if (muestra) {
    datos = datosMuestraSimple
  }
  if (muestraAgrupada) {
    datos = datosMuestraAgrupado
  }

  const option: EChartsOption = {
    backgroundColor: 'transparent',

    title: {
      text:
        muestra || muestraAgrupada
          ? 'GRAFICO DE BARRAS HORIZONTAL'
          : titulo?.toUpperCase(),
      subtext: subTitulo,
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

    barCategoryGap: '20%',
    barGap: '10%',

    xAxis: {
      show: true,
      name: muestra || muestraAgrupada ? 'Cantidad' : '',
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
        datos && datos.length > 0
          ? datos[0].datos.map((dato: ChartData) => dato.nombre)
          : [],
      axisLabel: {
        fontSize: 9,
        formatter: (params: string) => params.split(' ').join('\n'),
      },
      axisLine: {
        show: datos ? true : false,
      },
    },

    series: [
      ...(datos?.map((serie) => ({
        name: serie?.nombre,
        stack: stack ? 'total' : serie.nombre,
        type: 'bar' as const,
        data: serie?.datos?.map((item: ChartData) => ({
          value: item.valor,
          itemStyle: {
            color: item.color,
          },
        })),
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(135, 26, 26, 0.2)',
        },
        label: {
          show: true,
          position: 'inside' as const,
          color: '#000',
          fontSize: 10,
        },
      })) || []),

      ...(datos && tendencia && datos.length === 1
        ? [
            {
              type: 'line' as const,
              smooth: true,
              color: '#2979ff',
              tooltip: { show: false },
              data: datos[0].datos.map((dato: ChartData) => dato.valor),
            },
          ]
        : []),
    ],

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
