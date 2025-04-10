import { Box } from '@mui/material'
import BarStackedColumnChart from './BarStackedColumnChart'
import BarWorldPopulation from './BarWorldPopulation'
import FunnelCustomized from './FunnelCustomized'
import LineStacketChart from './LineStacketChart'
import PieDoughnutChart from './PieDoughnutChart'
import TextoChart from './TextoChart'
import ScatterType from './chartScatter'
import PersonasChart from './PersonasChart'
import PieDoughnutTotalChart from './PieDoughnutTotalChart'
import IconosChart from './IconosChart'
import BarDouble from './BarDouble'
import SaludEducacion from './SaludEducacion'
import BarWorldComparativa from './BarWorldComparativa'
import MixedLineBar from './MixedLineBar'
import GaugeChart from './GaugeChart'
import BarBasic from './BarBasic'
//import BarBasic from '../map/bar/BarBasic'

interface TipoGraficoProps {
  tipoGrafico: string | undefined
}

const chartComponents: { [key: string]: React.ComponentType<any> } = {
  'Tabla General': TextoChart,
  'Barra Apilada': BarStackedColumnChart,
  'Barra Horizontal': BarWorldPopulation,
  'Barra Basica': BarBasic,
  Pastel: PieDoughnutChart,
  Linea: LineStacketChart,
  Embudo: FunnelCustomized,
  Dispersión: ScatterType,
  'Iconos Personas': PersonasChart,
  'Pastel Total': PieDoughnutTotalChart,
  Iconos: IconosChart,
  'Barra Doble': BarDouble,
  'Grafico Indicadores Clave': SaludEducacion,
  'Barra Comparativa': BarWorldComparativa,
  'Mixto Barra Linea': MixedLineBar,
  'Grafico Indicador': GaugeChart,
}

const TipoGrafico: React.FC<TipoGraficoProps> = ({ tipoGrafico }) => {
  if (!tipoGrafico) return null
  const ChartComponent = chartComponents[tipoGrafico]
  const datosMuestra = { muestra: true }
  return (
    <Box width="100%" height="100%">
      <ChartComponent />
      {/* <ChartComponent {...datosMuestra} /> */}
    </Box>
  )
}

export default TipoGrafico
