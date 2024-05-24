import React from 'react'
import ChartBar from '@/components/echarts/bar'
import ChartPie from '@/components/echarts/pie'
import HorizontalBarChart from '@/components/echarts/barHorizontal'
import ChartLine from '@/components/echarts/line'
import VerticalBarChart from '@/components/echarts/barVertical'
import ChartScatter from './chartScatter'

const ChartComponent = ({ type, data, title, subTitle, chartRef }) => {
  switch (type) {
    case 'bar':
      return (
        <ChartBar
          data={data}
          title={title}
          subTitle={subTitle}
          ref={chartRef}
        />
      )
    case 'pie':
      return (
        <ChartPie
          data={data}
          title={title}
          subTitle={subTitle}
          ref={chartRef}
        />
      )
    case 'bar_horizontal':
      return (
        <HorizontalBarChart
          data={data}
          title={title}
          subTitle={subTitle}
          ref={chartRef}
        />
      )
    case 'line':
      return (
        <ChartLine
          data={data}
          title={title}
          subTitle={subTitle}
          ref={chartRef}
        />
      )
    case 'bar_vertical':
      return <VerticalBarChart data={data} title={title} subTitle={subTitle} />
    case 'scatter':
      return <ChartScatter data={data} title={title} subTitle={subTitle} />
    default:
      return null
  }
}

export default ChartComponent
