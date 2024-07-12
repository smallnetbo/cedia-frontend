import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Paper, CircularProgress } from '@mui/material'
import TipoGraficoComponent from '../TipoGraficoComponent'
import { filtradoDatosGeneralesPorSector } from '@/app/datosGenerales/dataUtils/filtros/filterBySelectedSector'
import { SubSector } from '@/app/fichasSectoriales/types/reporteType'

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
  const [images, setImages] = useState<{ [key: string]: string }>({})
  const [currentIndex, setCurrentIndex] = useState(0)

  const datosFiltrados = filtradoDatosGeneralesPorSector(listaReporte)

  useEffect(() => {
    const generarImagenes = async () => {
      const nuevasImagenes: { [key: string]: string } = {}
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      const items = Object.entries(datosFiltrados)
        .map(([sector, datos]) => datos)
        .flat()
      const batchSize = 10

      const renderBatch = async () => {
        for (
          let i = currentIndex;
          i < Math.min(currentIndex + batchSize, items.length);
          i++
        ) {
          const dato = items[i]
          for (const variable of dato.variables) {
            const tipoGrafico = variable.tipoGrafico
            const data = variable.data

            await new Promise<void>((resolve) => {
              const handleExport = (image: string) => {
                nuevasImagenes[variable.nombre] = image
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
                    type={tipoGrafico}
                    data={data}
                    title={variable.nombre}
                    subTitle=""
                    onExport={handleExport}
                  />
                </Paper>
              )
            })
          }
        }

        setCurrentIndex(currentIndex + batchSize)
        if (currentIndex + batchSize < items.length) {
          requestAnimationFrame(renderBatch)
        } else {
          setImages(nuevasImagenes)
          setLoading(false)
          setChartImages(nuevasImagenes)
          setImagesGenerated(true)
          root.unmount()
          document.body.removeChild(container)
        }
      }

      requestAnimationFrame(renderBatch)
    }

    generarImagenes()
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
