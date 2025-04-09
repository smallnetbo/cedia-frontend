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

interface BarBasicProps {
  id: string
  datos: {
    name: string
    data: ChartData[]
  }[]
  title: string
  subTitle: string
  labelX?: string
  labelY?: string
  onExport?: (image: string) => void
  width?: string
  height?: string
}

const BarBasic: FC<BarBasicProps> = ({
  id,
  datos,
  title,
  subTitle,
  labelX,
  labelY,
  onExport,
  width = '100%',
  height = '100%',
}) => {
  const theme = useTheme()
  const xs = useMediaQuery(theme.breakpoints.only('xs'))

  const option: EChartsOption = {
    backgroundColor: 'white',
    title: {
      text: title?.toUpperCase(),
      subtext: subTitle,
      left: 'center',
      textStyle: {
        fontSize: getResponsiveFontSize(12),
        fontWeight: 600,
        overflow: 'truncate',
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
      name: datos.length ? labelX : '',
      data: datos.map((serie) => serie.name),
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: {
        align: 'center',
        fontSize: 14,
        fontWeight: 500,
      },
      axisLabel: {
        overflow: 'break',
        fontSize: getResponsiveFontSize(9),
        formatter: (params: string) =>
          xs
            ? params
                .split(' ')
                .map((palabra) => palabra.slice(0, 4))
                .join('\n')
            : params.split(' ').join('\n'),
      },
    },

    yAxis: {
      type: 'value',
      name: datos.length ? labelY : '',
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
        color: '`rgba(179, 169, 169, 0.2)',
      },
      data: datos.map((serie) => ({
        value: serie.data[0].valor,
        itemStyle: { color: serie.data[0].color ?? undefined },
      })),
      label: {
        show: true,
        position: 'top',
        fontSize: getResponsiveFontSize(10),
        formatter: ({ value }) => `${value}`,
      },
    },

    graphic:
      datos.length === 0
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
      const myChart = init(chartDom)
      // myChart.setOption(option)

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
        width,
        height,
        minHeight: '400px',
      }}
    />
  )
}

export default BarBasic
