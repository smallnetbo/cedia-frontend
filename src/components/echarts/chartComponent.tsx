import React from 'react'
import ChartBar from '@/components/echarts/bar'
import ChartPie from '@/components/echarts/pie'
import HorizontalBarChart from '@/components/echarts/barHorizontal'
import ChartLine from '@/components/echarts/line'
import VerticalBarChart from '@/components/echarts/barVertical'
import ChartScatter from './map/scatter/chartScatter'

const ChartComponent = ({
  type,
  data,
  title,
  subTitle,
  onExport,
  setChartImage,
}) => {
  switch (type) {
    case 'Barra':
      return (
        <ChartBar
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={(image) =>
            setChartImage((prevImages) => ({
              ...prevImages,
              [title]: image,
            }))
          }
        />
      )
    case 'Tarta':
      return (
        <ChartPie
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={(image) =>
            setChartImage((prevImages) => ({
              ...prevImages,
              [title]: image,
            }))
          }
        />
      )
    case 'Barra_Horizontal':
      return (
        <HorizontalBarChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={(image) =>
            setChartImage((prevImages) => ({
              ...prevImages,
              [title]: image,
            }))
          }
        />
      )
    case 'Línea':
      return (
        <ChartLine
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={(image) =>
            setChartImage((prevImages) => ({
              ...prevImages,
              [title]: image,
            }))
          }
        />
      )
    case 'Barra_Vertical':
      return (
        <VerticalBarChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={(image) =>
            setChartImage((prevImages) => ({
              ...prevImages,
              [title]: image,
            }))
          }
        />
      )
    case 'scatter':
      return (
        <ChartScatter
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={(image) =>
            setChartImage((prevImages) => ({
              ...prevImages,
              [title]: image,
            }))
          }
        />
      )
    default:
      return null
  }
}

export default ChartComponent
