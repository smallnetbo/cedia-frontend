import React from 'react'
import { useAlerts } from '@/hooks/useAlerts' // Asegúrate de que la ruta sea correcta
import BarStackedColumnChart from './map/bar/BarStackedColumnChart'
import BarWorldPopulation from './map/bar/BarWorldPopulation'
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
import BarWorldComparativa from './map/bar/BarWorldComparativa'
import DynamicTable from './map/tabla/DynamicTable'

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
    return null // No hay errores
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
    case 'PersonasChart':
      return (
        <PersonasChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'PieDoughnutTotalChart':
      return (
        <PieDoughnutTotalChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'IconosChart':
      return (
        <IconosChart
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'BarDouble':
      return (
        <BarDouble
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'SaludEducacion':
      return (
        <SaludEducacion
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'BarWorldComparativa':
      return (
        <BarWorldComparativa
          data={data}
          title={title}
          subTitle={subTitle}
          onExport={handleExport}
        />
      )
    case 'Texto':
      return <DynamicTable data={data} title={title} subTitle={subTitle} />
    default:
      return null
  }
}

export default TipoGraficoComponent
