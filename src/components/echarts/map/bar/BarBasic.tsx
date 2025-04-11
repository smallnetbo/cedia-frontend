import { FC, useEffect } from 'react'
import {
  init,
  EChartsOption,
  TooltipComponentFormatterCallbackParams,
  DefaultLabelFormatterCallbackParams,
} from 'echarts'
import { ChartData } from '@/app/datosGenerales/types/datosGeneralesType'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { getResponsiveFontSize } from '../data/PaperResponsive'
import { useThemeContext } from '@/themes/ThemeRegistry'

interface BarBasicProps {
  id: string
  datos: ChartData[]
  titulo?: string
  subTitulo?: string
  labelX?: string
  labelY?: string
  muestra?: Boolean
  width?: string
  height?: string

  onExport?: (image: string) => void
}

const BarBasic: FC<BarBasicProps> = ({
  id,
  datos,
  titulo: title,
  subTitulo: subTitle,
  labelX,
  labelY,
  onExport,
  width = '100%',
  height = '100%',
  muestra = false,
}) => {
  const { themeMode } = useThemeContext()
  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  const datosMuestra = {
    name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    valor: [120, 200, 150, 80, 70, 110, 130],
  }

  const option: EChartsOption = {
    backgroundColor: 'white',
    title: {
      text: muestra ? 'GRAFICO DE BARRAS BASICO' : title?.toUpperCase(),
      subtext: subTitle,
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
      formatter: (params: TooltipComponentFormatterCallbackParams) => {
        if (Array.isArray(params)) {
          const data = params[0] as DefaultLabelFormatterCallbackParams
          return `
          <div style="
            border: 1px solid ${data.color};
            padding: 12px;
            margin:-12px;
            color: #333;
            font-size: 14px;
          ">
            <b style="color: gray;">${title}</b><br/>
            <span style="color: gray;">${data.name}: </span>
            <span style="color: gray; font-weight:500;"> ${data.value} </span>
          </div>
        `
        }
        return ''
      },
    },

    xAxis: {
      type: 'category',
      name: muestra ? 'Categorias' : datos?.length ? labelX : '',
      data: muestra
        ? datosMuestra.name
        : datos?.map((dato) => dato.nombre.split(' ').join('\n')),
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: {
        align: 'center',
        fontSize: 14,
        fontWeight: 500,
      },
      axisLabel: {
        overflow: 'break',
        fontSize: 9,
        formatter: (params: string) =>
          xs
            ? params
                .split(' ')
                .map((palabra) => palabra.slice(0, 4))
                .join('\n')
            : params.split(' ').join('\n'),
      },
      axisLine: {
        show: datos.length ? true : false,
      },
    },

    yAxis: {
      type: 'value',
      name: muestra ? 'Cantidad' : datos.length ? labelY : '',
      nameLocation: 'middle',
      nameGap: 50,
      nameRotate: 90,
      nameTextStyle: {
        fontSize: 12,
        fontWeight: 500,
      },
    },
    series: {
      type: 'bar',
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(135, 26, 26, 0.2)',
      },
      data: muestra
        ? datosMuestra.valor
        : datos.map((dato) => ({
            value: dato.valor,
            itemStyle: { color: dato.color },
          })),
      label: {
        show: true,
        position: 'top',
        fontSize: 10,
        formatter: ({ value }) => `${value}`,
      },
    },
    graphic:
      !!!muestra && datos?.length === 0
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
  }, [option, themeMode])

  return (
    <Box
      id={id}
      bgcolor="background.paper"
      sx={{
        p: 1,
        width,
        height,
        minHeight: '400px',
      }}
    />
  )
}
// eslint-disable-next-line react-hooks/exhaustive-deps

export default BarBasic
