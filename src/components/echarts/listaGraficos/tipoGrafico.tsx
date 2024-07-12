import { Box } from '@mui/material'
import BarStackedColumnChart from './BarStackedColumnChart'
import BarWorldPopulation from './BarWorldPopulation'
import FunnelCustomized from './FunnelCustomized'
import LineStacketChart from './LineStacketChart'
import PieDoughnutChart from './PieDoughnutChart'
import TextoChart from './TextoChart'
import ScatterType from './chartScatter'
import BarBasic from './BarBasic'

interface TipoGraficoProps {
  tipoGrafico: string | undefined
}

const chartComponents: { [key: string]: React.ComponentType<any> } = {
  Texto: TextoChart,
  BarStackedColumnChart: BarStackedColumnChart,
  BarWorldPopulation: BarWorldPopulation,
  BarBasic: BarBasic,
  PieDoughnutChart: PieDoughnutChart,
  LineStacketChart: LineStacketChart,
  FunnelCustomized: FunnelCustomized,
  ScatterChart: ScatterType,
}

const TipoGrafico: React.FC<TipoGraficoProps> = ({ tipoGrafico }) => {
  if (!tipoGrafico) return null
  const ChartComponent = chartComponents[tipoGrafico]

  return (
    <Box width="100%" height="100%">
      <ChartComponent />
    </Box>
  )
}

export default TipoGrafico
