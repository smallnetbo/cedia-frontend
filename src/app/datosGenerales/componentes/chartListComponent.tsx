import React from 'react'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import ChartComponent from '@/components/echarts/chartComponent'
import { DatoRegistro } from '../types/datosGeneralesType'
import { Typography } from '@mui/material'

interface ChartListComponentProps {
  charts: string[]
  chartData: {
    [key: string]: { name: string; data: { datoRegistro: DatoRegistro }[] }[]
  }
  selectedItem: string | null
  handleItemClick: (id: string) => void
  switchStates: { [key: string]: boolean }
  graficosPorVariable: { [variable: string]: string }
  entidadesComparativa?: string[] // Nueva prop opcional para las entidades
}

const ChartListComponent = ({
  charts,
  chartData,
  selectedItem,
  handleItemClick,
  switchStates,
  graficosPorVariable,
  entidadesComparativa,
}: ChartListComponentProps) => {
  return (
    <Grid container spacing={2}>
      {charts.map((item, index) => (
        <Grid
          item
          xs={12}
          sm={selectedItem === null ? 12 : 12}
          md={selectedItem === null ? 12 : 12}
          lg={selectedItem === null ? 6 : 12}
          xl={selectedItem === null ? 6 : 12}
          style={{
            display:
              selectedItem === item || selectedItem === null ? 'block' : 'none',
            minHeight: selectedItem === null ? '320px' : '640px',
          }}
          key={index}
        >
          <Paper
            style={{
              padding: '20px',
              textAlign: 'center',
              color: 'black',
              cursor: 'pointer',
              transform: selectedItem === item ? 'scale(1)' : 'scale(1)',
              transition: 'transform 0.3s ease-in-out',
              height: '100%',
            }}
            onClick={() => handleItemClick(item)}
          >
            <IconButton
              aria-label="expanded"
              style={{ position: 'absolute', right: '1px', top: '1px' }}
              onClick={() => handleItemClick(item)}
            >
              <span className="material-icons">
                {selectedItem === item ? 'close' : 'open_in_full'}
              </span>
            </IconButton>

            {switchStates[item] && (
              <React.Fragment key={index}>
                {graficosPorVariable[item] && (
                  <div>
                    {/* Render charts for each entity if `entidades` is provided */}
                    {entidadesComparativa ? (
                      entidadesComparativa.map((entidad, entidadIndex) => (
                        <div key={entidadIndex}>
                          <Typography variant="h6">{entidad}</Typography>
                          <ChartComponent
                            key={entidadIndex}
                            type={graficosPorVariable[item]} // Tipo de gráfico
                            data={chartData[item][entidad]} // Datos del gráfico por entidad
                            title={`${item} - ${entidad}`} // Título del gráfico
                            subTitle="" // Subtítulo del gráfico
                          />
                        </div>
                      ))
                    ) : (
                      // Render single chart if no `entidades` provided
                      <ChartComponent
                        key={index}
                        type={graficosPorVariable[item]} // Tipo de gráfico
                        data={chartData[item]} // Datos del gráfico
                        title={item} // Título del gráfico
                        subTitle="" // Subtítulo del gráfico
                      />
                    )}
                  </div>
                )}
              </React.Fragment>
            )}

            {selectedItem === index && (
              <IconButton
                aria-label="close"
                style={{ position: 'absolute', right: '5px', top: '5px' }}
                onClick={() => handleItemClick(null)}
              >
                X
              </IconButton>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

export default ChartListComponent
