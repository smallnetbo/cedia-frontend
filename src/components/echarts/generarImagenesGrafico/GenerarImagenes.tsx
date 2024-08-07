import React, { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { Paper, CircularProgress } from '@mui/material'
import TipoGraficoComponent from '../TipoGraficoComponent'
import { filtradoDatosGeneralesPorSector } from '@/app/datosGenerales/dataUtils/filtros/filterBySelectedSector'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'

interface GenerarImagenesProps {
  listaReporte: SubSector[]
  setChartImages: (images: { [key: string]: string }) => void
  setImagesGenerated: (generated: boolean) => void
}

const GenerarImagenes: React.FC<GenerarImagenesProps> = ({
  listaReporte,
  setChartImages,
  setImagesGenerated,
}) => {
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const datosFiltrados = filtradoDatosGeneralesPorSector(listaReporte)

  useEffect(() => {
    const generarImagenes = async () => {
      const nuevasImagenes: { [key: string]: { [key: string]: string } } = {}
      const container = document.createElement('div')
      containerRef.current = container
      document.body.appendChild(container)
      const root = createRoot(container)

      const items = Object.entries(datosFiltrados)
        .map(([sector, datos]) => datos)
        .flat()
      const batchSize = 10
      let currentIndex = 0

      const renderBatch = async () => {
        for (
          let i = currentIndex;
          i < Math.min(currentIndex + batchSize, items.length);
          i++
        ) {
          const dato = items[i]
          for (const variable of dato.variables) {
            const { nombre, data, tipoGrafico, tipoGraficoPdf } = variable

            // Function to render a chart and export the image
            const renderChart = async (
              chartType: string,
              keySuffix: string
            ) => {
              await new Promise<void>((resolve) => {
                const handleExport = (image: string) => {
                  // Save the image with a suffix to differentiate types
                  if (!nuevasImagenes[nombre]) {
                    nuevasImagenes[nombre] = {}
                  }
                  nuevasImagenes[nombre][keySuffix] = image
                  resolve()
                }

                root.render(
                  <Paper
                    elevation={4}
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: 'black',
                      cursor: 'pointer',
                      height: '600px',
                    }}
                  >
                    <TipoGraficoComponent
                      type={chartType}
                      data={data}
                      title={nombre}
                      subTitle=""
                      onExport={handleExport}
                    />
                  </Paper>
                )
              })
            }

            // Render both types of charts for each variable
            if (tipoGrafico) {
              await renderChart(tipoGrafico, 'tipoGrafico')
            }
            if (tipoGraficoPdf) {
              await renderChart(tipoGraficoPdf, 'tipoGraficoPdf')
            }
          }
        }

        currentIndex += batchSize
        if (currentIndex < items.length) {
          requestAnimationFrame(renderBatch)
        } else {
          setLoading(false)
          setChartImages(nuevasImagenes)
          setImagesGenerated(true)
          root.unmount()
          if (containerRef.current) {
            document.body.removeChild(containerRef.current)
            containerRef.current = null
          }
        }
      }

      requestAnimationFrame(renderBatch)
    }

    generarImagenes()

    // Clean up
    return () => {
      if (containerRef.current) {
        document.body.removeChild(containerRef.current)
      }
    }
  }, [listaReporte, setChartImages, setImagesGenerated])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </div>
    )
  }

  return null
}

export default GenerarImagenes
