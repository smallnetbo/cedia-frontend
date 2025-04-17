import React from 'react'
import { useAlerts } from '@/hooks/useAlerts'
import BarStackedColumnChart from './map/bar/BarStackedColumnChart'
import HorizontalBarChart from './map/bar/HorizontalBarChart'
import LineStacketChart from './map/line/LineStacketChart'
import BarBasic from './map/bar/BarBasic'
import PieDoughnutChart from './map/pie/PieDoughnutChart'
import FunnelCustomized from './map/funnel/FunnelCustomized'
import ScatterChart from './map/scatter/ScatterChart'
import PersonasChart from './map/PictorialBar/PersonasChart'
import PieDoughnutTotalChart from './map/pie/PieDoughnutTotal'
import IconosChart from './map/PictorialBar/IconosChart'
import BarDouble from './map/PictorialBar/BarraPersonalizada'
import SaludEducacion from './map/PictorialBar/SaludEducacion'
import DynamicTable from './map/tabla/DynamicTable'
import MixedLineBar from './map/bar/MixedLineBar'
import GaugeChart from './map/gauge/GaugeChart'

interface TipoGraficoProps {
  type: string
  data: any
  title: string
  subTitle: string
  onExport?: (image: string) => void
}

const TipoGraficoComponent: React.FC<TipoGraficoProps> = ({
  type,
  data,
  title,
  subTitle,
  onExport,
}) => {
  const { Alerta } = useAlerts()

  const handleExport = (image: string) => {
    if (onExport) {
      onExport(image)
    }
  }

  const validateData = (data: any): string | null => {
    if (!data) return 'Los datos están vacíos o son nulos.'
    if (Array.isArray(data) && data.length === 0)
      return 'Los datos están vacíos.'
    return null
  }

  React.useEffect(() => {
    const errorMessage = validateData(data)

    if (errorMessage) {
      Alerta({
        mensaje: `Error al generar el gráfico de tipo ${type}: ${errorMessage}`,
        variant: 'error',
      })
    }
  }, [data, type, Alerta])

  const errorMessage = validateData(data)
  if (errorMessage) {
    return null
  }

  switch (type) {
    case 'Barra Apilada':
      return (
        <BarStackedColumnChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Barra Horizontal':
      return (
        <HorizontalBarChart
          id={`HorizontalBarChartAgrupado-${type}-${title}`}
          datos={data}
          titulo={title}
          subTitulo={subTitle}
        />
      )
    case 'Barra Basica':
      return (
        <BarBasic
          id={`BarBasic-${type}-${title}`}
          datos={data}
          titulo={title}
          subTitulo={subTitle}
          onExport={handleExport}
        />
      )
    case 'Pastel':
      return (
        <PieDoughnutChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Linea':
      return (
        <LineStacketChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Embudo':
      return (
        <FunnelCustomized
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Dispersión':
      return (
        <ScatterChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Iconos Personas':
      return (
        <PersonasChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Pastel Total':
      return (
        <PieDoughnutTotalChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Iconos':
      return (
        <IconosChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Barra Doble':
      return (
        <BarDouble
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Grafico Indicadores Clave':
      return (
        <SaludEducacion
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Barra Comparativa':
      return (
        <HorizontalBarChart
          id={`HorizontalBarChart-${type}-${title}`}
          datos={data}
          titulo={title}
          subTitulo={subTitle}
        />
      )
    case 'Tabla General':
      return <DynamicTable data={data} title={title} subTitle={subTitle} />
    case 'Mixto Barra Linea':
      return (
        <MixedLineBar
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Grafico Indicador':
      return (
        <GaugeChart
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
