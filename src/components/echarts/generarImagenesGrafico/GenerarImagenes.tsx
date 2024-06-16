import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Paper, CircularProgress } from '@mui/material'
import TipoGraficoComponent from '../TipoGraficoComponent'
import { filtradoDatosGeneralesPorSector } from '@/app/datosGenerales/dataUtils/filtros/filterBySelectedSector'

const GenerarImagenes = ({
  listaReporte,
  setChartImages,
  setImagesGenerated,
}) => {
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState({})

  const datosFiltrados = filtradoDatosGeneralesPorSector(listaReporte)

  useEffect(() => {
    const generarImagenes = async () => {
      const nuevasImagenes = {}
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      for (const [sector, datos] of Object.entries(datosFiltrados)) {
        for (const dato of datos) {
          for (const variable of dato.variables) {
            const tipoGrafico = variable.tipoGrafico
            const data = variable.data

            await new Promise((resolve) => {
              const handleExport = (image) => {
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
      }

      setImages(nuevasImagenes)
      setLoading(false)
      setChartImages(nuevasImagenes)
      setImagesGenerated(true)
      root.unmount()
      document.body.removeChild(container)
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
