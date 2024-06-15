import React from 'react'
import BarStackedColumnChart from './map/bar/BarStackedColumnChart'
import BarWorldPopulation from './map/bar/BarWorldPopulation'
import LineStacketChart from './map/line/LineStacketChart'
import BarBasic from './map/bar/BarBasic'
import PieDoughnutChart from './map/pie/PieDoughnutChart'
import FunnelCustomized from './map/funnel/FunnelCustomized'
import ScatterChart from './map/scatter/ScatterChart'

const TipoGraficoComponent = ({ type, data, title, subTitle, onExport }) => {
  const handleExport = (image) => {
    onExport(image)
  }

  switch (type) {
    case 'BarStackedColumnChart':
      return (
        <BarStackedColumnChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'BarWorldPopulation':
      return (
        <BarWorldPopulation
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'BarBasic':
      return (
        <BarBasic
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'PieDoughnutChart':
      return (
        <PieDoughnutChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'LineStacketChart':
      return (
        <LineStacketChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'FunnelCustomized':
      return (
        <FunnelCustomized
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'ScatterChart':
      return (
        <ScatterChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    default:
      return null
  }
}

export default TipoGraficoComponent
