import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import TipoGraficoComponent from '../TipoGraficoComponent'

interface ChartGeneratorProps {
  nombre: string
  data: any
  chartType: string
  onExport: (image: string) => void
}

const ChartGenerator: React.FC<ChartGeneratorProps> = ({
  nombre,
  data,
  chartType,
  onExport,
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const renderChart = async () => {
      if (chartRef.current) {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = createRoot(container)

        root.render(
          <div
            style={{
              width: '800px', // Ajusta el tamaño si es necesario
              height: '600px', // Ajusta el tamaño si es necesario
              backgroundColor: 'white',
            }}
          >
            <TipoGraficoComponent
              type={chartType}
              data={data}
              title={nombre}
              subTitle=""
              onExport={onExport}
            />
          </div>
        )

        // Espera un tiempo para que el gráfico se renderice
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Limpiar el contenedor después de la renderización
        root.unmount()
        document.body.removeChild(container)
      }
    }

    renderChart()
  }, [nombre, data, chartType, onExport])

  return <div ref={chartRef} style={{ display: 'none' }} />
}

export default ChartGenerator
