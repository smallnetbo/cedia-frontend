import { Box } from '@mui/material'
import BarType from './barType'
import BarHorizontalType from './barHorizontalType'
import LineType from './lineType'
import PieType from './pieType'
import BarVerticalType from './barVerticalType'

interface TipoGraficoProps {
  tipoGrafico: string | undefined
}

const chartComponents: { [key: string]: React.ComponentType<any> } = {
  bar: BarType,
  bar_horizontal: BarHorizontalType,
  line: LineType,
  pie: PieType,
  bar_vertical: BarVerticalType,
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
