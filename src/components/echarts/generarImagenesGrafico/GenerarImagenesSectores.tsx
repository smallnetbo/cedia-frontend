import React, { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { CircularProgress } from '@mui/material'
import TipoGraficoComponent from '../TipoGraficoComponent'
import { filtradoDatosGeneralesPorSector } from '@/app/datosGenerales/dataUtils/filtros/filterBySelectedSector'
import { SubSector } from '@/app/datosGenerales/types/datosGeneralesType'

interface GenerarImagenesProps {
  listaReporte: SubSector[]
  setChartImages: (images: { [key: string]: string }) => void
  setImagesGenerated: (generated: boolean) => void
}

const GenerarImagenesSectores: React.FC<GenerarImagenesProps> = ({
  listaReporte,
  setChartImages,
  setImagesGenerated,
}) => {
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const datosFiltrados = filtradoDatosGeneralesPorSector(listaReporte)

  useEffect(() => {
    const generarImagenes = () => {
      const nuevasImagenes: { [key: string]: string } = {}
      const container = document.createElement('div')
      containerRef.current = container
      container.style.position = 'absolute'
      container.style.width = '0'
      container.style.height = '0'
      container.style.overflow = 'hidden'
      document.body.appendChild(container)
      const root = createRoot(container)

      const items = Object.entries(datosFiltrados)
        .map(([, datos]) => datos)
        .flat()
      const batchSize = 5
      let currentIndex = 0

      const renderBatch = async () => {
        for (
          let i = currentIndex;
          i < Math.min(currentIndex + batchSize, items.length);
          i++
        ) {
          const dato = items[i]
          for (const variable of dato.variables) {
            const { id, nombre, data, tipoGrafico } = variable

            if (tipoGrafico === 'Tabla General') {
              continue
            }
            const renderChart = async (chartType: string) => {
              await new Promise<void>((resolve) => {
                const timeout = setTimeout(() => {
                  resolve()
                }, 5000)

                const handleExport = (image: string) => {
                  clearTimeout(timeout)
                  nuevasImagenes[id] = image
                  resolve()
                }
                try {
                  root.render(
                    <div
                      style={{
                        width: '800px',
                        height: '600px',
                        backgroundColor: 'white',
                      }}
                    >
                      <TipoGraficoComponent
                        type={chartType}
                        data={data}
                        title={nombre}
                        subTitle=""
                        onExport={handleExport}
                      />
                    </div>
                  )
                } catch (error) {
                  // console.error(
                  //   `Error rendering chart ${id} (${keySuffix}):`,
                  //   error
                  // )
                  resolve()
                }
              })
            }

            if (tipoGrafico) {
              await renderChart(tipoGrafico)
            }
          }
        }

        currentIndex += batchSize
        if (currentIndex < items.length) {
          setTimeout(renderBatch, 50)
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
      renderBatch()
    }

    generarImagenes()

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

export default GenerarImagenesSectores
