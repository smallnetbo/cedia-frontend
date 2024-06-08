import React from 'react'
import BarStackedColumnChart from './map/bar/BarStackedColumnChart'
import BarWorldPopulation from './map/bar/BarWorldPopulation'
import LineStacketChart from './map/line/LineStacketChart'
import FunnelChart from './map/funnel/FunnelChart'

const TipoGraficoComponent = ({
  type,
  data,
  title,
  subTitle,
  onExport,
  setChartImage,
}) => {
  switch (type) {
    case 'BarStackedColumnChart':
      return (
        <BarStackedColumnChart
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
    case 'BarWorldPopulation':
      return (
        <BarWorldPopulation
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
    case 'LineStacketChart':
      return (
        <LineStacketChart
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

export default TipoGraficoComponent
