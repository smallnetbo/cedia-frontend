import { Box } from '@mui/material'
import BarType from './barType'
import BarHorizontalType from './barHorizontalType'
import LineType from './lineType'
import PieType from './pieType'
import BarVerticalType from './barVerticalType'
import ScatterType from './chartScatter'

interface TipoGraficoProps {
  tipoGrafico: string | undefined
}

const chartComponents: { [key: string]: React.ComponentType<any> } = {
  Barra: BarType,
  Barra_Horizontal: BarHorizontalType,
  Línea: LineType,
  Tarta: PieType,
  Barra_Vertical: BarVerticalType,
  Dispersión: ScatterType,
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
